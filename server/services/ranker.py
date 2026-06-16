"""
Hybrid BM25 + sentence-embedding ranker.

BM25 handles exact keyword matching ("EMDR", "CBT", specific terminology).
Embeddings handle semantic similarity ("soldiers" ≈ "veterans", "youth" ≈ "children").
Final score = 0.5 × BM25_normalised + 0.5 × embedding_cosine.

The SentenceTransformer model is loaded once on first call and cached in memory.
First call triggers a ~90 MB HuggingFace download (cached locally after that).
"""
import re
import threading
import numpy as np
from rank_bm25 import BM25Okapi
from sklearn.metrics.pairwise import cosine_similarity

from utils.logger import logger

_MODEL_NAME = "all-MiniLM-L6-v2"
_model = None
_model_lock = threading.Lock()


def _get_model():
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:  # double-checked locking
                logger.info(f"Loading sentence-transformer model '{_MODEL_NAME}' (first call: ~90 MB download if not cached)")
                from sentence_transformers import SentenceTransformer
                _model = SentenceTransformer(_MODEL_NAME)
                logger.info("Sentence-transformer model ready.")
    return _model


def _tokenize(text: str) -> list:
    return re.sub(r"[^\w\s]", " ", text.lower()).split()


def hybrid_rank(docs: list, query: str) -> np.ndarray:
    """
    Score docs against query using BM25 + embedding cosine similarity.
    Returns a numpy array of hybrid scores in [0, 1], one per doc.
    Falls back to BM25-only if the embedding model fails.
    """
    if not docs or not query.strip():
        return np.zeros(len(docs))

    # ── BM25 ──────────────────────────────────────────────────────────────
    tokenized_docs = [_tokenize(d) for d in docs]
    tokenized_query = _tokenize(query)
    bm25 = BM25Okapi(tokenized_docs)
    bm25_scores = bm25.get_scores(tokenized_query).astype(float)
    bm25_max = bm25_scores.max()
    bm25_active = bm25_max > 0
    if bm25_active:
        bm25_scores /= bm25_max  # normalise to [0, 1]

    # ── Embeddings ─────────────────────────────────────────────────────────
    try:
        model = _get_model()
        embeddings = model.encode(
            docs + [query],
            show_progress_bar=False,
            convert_to_numpy=True,
        )
        doc_embeddings = embeddings[:-1]
        query_embedding = embeddings[-1:]
        emb_scores = cosine_similarity(query_embedding, doc_embeddings).flatten().astype(float)
        emb_scores = np.clip(emb_scores, 0.0, 1.0)
    except Exception as e:
        logger.warning(f"Embedding scoring failed, using BM25 only: {e}")
        emb_scores = np.zeros(len(docs))

    # When BM25 finds no keyword matches keep scores in [0, 1] by using
    # embeddings at full weight rather than a 0.5× compressed scale.
    if not bm25_active:
        return emb_scores
    return 0.5 * bm25_scores + 0.5 * emb_scores
