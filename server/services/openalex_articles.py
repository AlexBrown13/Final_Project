import io
import requests
from pymongo import UpdateOne
from pyalex import Works
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from services.mongo import articles_collection
from utils.logger import logger

_PDF_TIMEOUT = 10       # seconds per request
_PDF_MAX_PAGES = 5      # only extract first 5 pages
_PDF_MAX_CHARS = 50_000 # cap stored text to ~50 KB


def _fetch_pdf_content(pdf_url):
    try:
        pdf_url='https://www.psychiatrist.com/pdf-serve/effective-treatments-for-ptsd-practice-guidelines-from-the-international-society-for-traumatic-stress-studies-pdf/'
        resp = requests.get(pdf_url, timeout=_PDF_TIMEOUT, stream=True)
        resp.raise_for_status()
        if "pdf" not in resp.headers.get("content-type", "").lower():
            return None
        reader = PdfReader(io.BytesIO(resp.content))
        text = "\n".join(
            page.extract_text() or "" for page in reader.pages[:_PDF_MAX_PAGES]
        ).strip()
        return text[:_PDF_MAX_CHARS] if text else None
    except Exception as e:
        logger.debug(f"PDF fetch failed ({pdf_url!r}): {e}")
        return None

_ISRAEL_TERMS = {"israel", "ישראל"}
_PER_TAG_LIMIT = 20    # wide candidate net per tag
_FALLBACK_LIMIT = 40   # wider net when no tags
_EXTRA_QUERY_LIMIT = 15
_TOP_K = 15            # keep only the best N after reranking


def reconstruct_abstract(abstract_index):
    if not abstract_index:
        return None
    word_positions = []
    for word, positions in abstract_index.items():
        for pos in positions:
            word_positions.append((pos, word))
    word_positions.sort()
    return " ".join(word for _, word in word_positions)


_SELECT_FIELDS = [
    "id", "title", "publication_year", "doi",
    "primary_location", "authorships",
    "abstract_inverted_index", "cited_by_count",
]

def _fetch(query_str, per_page):
    return (
        Works()
        .search(query_str)
        .filter(type="article", publication_year=">2014")
        .select(_SELECT_FIELDS)
        .get(per_page=per_page)
    )


def _rerank(candidates, tags):
    """
    Score all candidates by TF-IDF cosine similarity to the user's tags.
    Returns candidates sorted best-first.

    This is the candidate generation + reranking pattern:
    OpenAlex casts a wide net → TF-IDF selects the most relevant subset.
    Only the top _TOP_K survive into MongoDB.
    """
    if not candidates or not tags:
        return candidates

    docs = [
        " ".join([(c.get("title") or ""), (c.get("abstract") or "")])
        for c in candidates
    ]
    query = " ".join(tags)

    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            sublinear_tf=True,
        )
        corpus = docs + [query]
        tfidf_matrix = vectorizer.fit_transform(corpus)
        query_vec = tfidf_matrix[-1]
        doc_matrix = tfidf_matrix[:-1]
        scores = cosine_similarity(query_vec, doc_matrix).flatten()
    except Exception as e:
        logger.warning(f"TF-IDF reranking failed, keeping original order: {e}")
        return candidates

    ranked = sorted(zip(scores, candidates), key=lambda x: x[0], reverse=True)
    return [c for _, c in ranked]


def main(user_id, tags=None, search_query=None):
    # Strip "Israel" from tags — it is already anchored in every query
    clean_tags = [t for t in (tags or []) if t.lower() not in _ISRAEL_TERMS]

    # Build (query_string, per_page) pairs — one query per tag for topic coverage
    fetch_plan = []
    if clean_tags:
        for tag in clean_tags:
            fetch_plan.append((f"trauma AND Israel AND {tag}", _PER_TAG_LIMIT))
    if search_query and str(search_query).strip():
        fetch_plan.append((str(search_query).strip(), _EXTRA_QUERY_LIMIT))
    if not fetch_plan:
        fetch_plan.append(("trauma AND Israel AND mental health", _FALLBACK_LIMIT))

    # Phase 1 — candidate generation: fetch a wide pool from OpenAlex
    seen = set()
    candidates = []

    for query_str, per_page in fetch_plan:
        try:
            works = _fetch(query_str, per_page)
            for work in works:
                work_id = work.get("id")
                if not work_id or work_id in seen:
                    continue
                seen.add(work_id)

                abstract = reconstruct_abstract(work.get("abstract_inverted_index"))
                doc = {
                    "user_id": user_id,
                    "openalex_id": work_id,
                    "title": work.get("title", "No title"),
                    "year": work.get("publication_year"),
                    "journal": ((work.get("primary_location") or {}).get("source") or {}).get("display_name"),
                    "url": work.get("doi"),
                    "pdf_url": (work.get("primary_location") or {}).get("pdf_url"),
                    "abstract": abstract,
                    "authors": [
                        a.get("author", {}).get("display_name")
                        for a in work.get("authorships", [])[:2]
                    ],
                    "persona_query": query_str,
                    "cited_by_count": work.get("cited_by_count", 0),
                }
                candidates.append(doc)
        except Exception as e:
            logger.error(f"openalex query error ({query_str!r}): {e}")

    if not candidates:
        logger.warning("No candidates fetched from OpenAlex")
        return

    # Phase 2 — reranking: score all candidates by TF-IDF cosine similarity,
    # then keep only the top _TOP_K. MongoDB stores the best articles, not just
    # whatever OpenAlex happened to return first.
    ranked = _rerank(candidates, clean_tags or ["trauma", "mental health"])
    top = ranked[:_TOP_K]

    logger.info(
        f"Fetched {len(candidates)} candidates → reranked → keeping top {len(top)}"
    )

    # Phase 3 — PDF enrichment: only for top articles that have a pdf_url
    for doc in top:
        pdf_url = doc.get("pdf_url")
        if pdf_url:
            content = _fetch_pdf_content(pdf_url)
            if content:
                doc["pdf_content"] = content
                logger.info(f"PDF extracted for: {doc['title'][:60]!r}")

    operations = [
        UpdateOne(
            {"openalex_id": doc["openalex_id"], "user_id": user_id},
            {"$set": doc},
            upsert=True,
        )
        for doc in top
    ]

    if operations:
        result = articles_collection.bulk_write(operations)
        logger.info(
            f"Upserted: {result.upserted_count}, Modified: {result.modified_count}"
        )


if __name__ == "__main__":
    main()
