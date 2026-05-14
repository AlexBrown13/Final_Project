from pymongo import UpdateOne
from pyalex import Works

from services.mongo import articles_collection
from utils.logger import logger


def reconstruct_abstract(abstract_index):
    if not abstract_index:
        return None

    word_positions = []
    for word, positions in abstract_index.items():
        for pos in positions:
            word_positions.append((pos, word))

    word_positions.sort()
    return " ".join(word for _, word in word_positions)


def main(user_id, tags=None, query=None):
    if tags:
        if len(tags) == 1:
            query = f"trauma AND Israel AND {tags[0]}"
        else:
            query = f"trauma AND Israel AND ({' OR '.join(tags)})"
    elif not query or not str(query).strip():
        query = "trauma AND Israel AND mental health"

    try:
        works = Works().search(query).filter(type="article").get(per_page=15)

        operations = []
        for work in works:
            abstract = reconstruct_abstract(work.get("abstract_inverted_index"))
            doc = {
                "user_id": user_id,
                "openalex_id": work["id"],
                "title": work.get("title", "No title"),
                "year": work.get("publication_year", None),
                "journal": (
                    ((work.get("primary_location") or {}).get("source") or {}).get("display_name")
                    or ((work.get("host_venue") or {}).get("display_name"))
                ),
                "url": work.get("doi", None),
                "pdf_url": work.get("primary_location", {}).get("pdf_url", None),
                "abstract": abstract,
                "authors": [
                    a.get("author", {}).get("display_name")
                    for a in work.get("authorships", [])[:2]
                ],
                "persona_query": query,
            }
            operations.append(
                UpdateOne(
                    {"openalex_id": work["id"], "user_id": user_id},
                    {"$set": doc},
                    upsert=True,
                )
            )

        if operations:
            result = articles_collection.bulk_write(operations)
            logger.info(f"Upserted: {result.upserted_count}, Modified: {result.modified_count}")

    except Exception as e:
        logger.error(f"openalex_articles error: {e}")


if __name__ == "__main__":
    main()
