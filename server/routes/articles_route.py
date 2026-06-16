import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from bson.errors import InvalidId
from services.mongo import articles_collection, chat_collection
from services.openalex_articles import main
from utils.logger import logger

articles_bp = Blueprint("openalex_articles", __name__)

# ── Tag validation ──────────────────────────────────────────────────────────
MAX_TAGS = 5
MAX_TAG_LEN = 50
_SAFE_TAG = re.compile(r'^[\w\s\-]{1,50}$', re.UNICODE)
_ISRAEL_TERMS = {"israel", "ישראל"}


def sanitize_tags(raw):
    """Validate and sanitize a list of topic tags. Returns (tags, error_str)."""
    if not isinstance(raw, list):
        return None, "tags must be an array"
    if len(raw) > MAX_TAGS:
        return None, f"maximum {MAX_TAGS} topics allowed"
    cleaned = []
    for t in raw:
        if not isinstance(t, str):
            continue
        t = t.strip()[:MAX_TAG_LEN]
        if t and _SAFE_TAG.match(t):
            cleaned.append(t)
    if not cleaned:
        return None, "at least one valid topic is required"
    return cleaned, None


def rank_articles(articles: list, user_tags: list) -> list:
    """
    Sort articles using the content_score stored at ingestion time, combined
    with live click engagement and recency. No ML inference on reads.

    Final score:
      0.6 × content_score  (BM25+embedding, computed once at ingestion)
      0.25 × click score   (normalised, capped at 10 clicks)
      0.15 × recency       (publication year, 2000–2026 range)
    """
    if not articles:
        return articles

    scored = []
    for article in articles:
        content_score = float(article.get("content_score") or 0.0)
        click_score = min(article.get("click_count", 0) / 10.0, 1.0)
        year = article.get("year") or 2000
        recency_score = max(0.0, min((int(year) - 2000) / 26.0, 1.0))
        final = 0.6 * content_score + 0.25 * click_score + 0.15 * recency_score
        scored.append((final, article))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [a for _, a in scored]


def build_query(tags):
    clean = [t for t in tags if t.lower() not in _ISRAEL_TERMS]
    if not clean:
        return "trauma AND Israel AND mental health"
    if len(clean) == 1:
        return f"trauma AND Israel AND {clean[0]}"
    return f"trauma AND Israel AND ({' OR '.join(clean)})"


# ── Routes ──────────────────────────────────────────────────────────────────

@articles_bp.route('/articles', methods=['GET'])
@jwt_required()
def get_articles():
    try:
        user_id = get_jwt_identity()

        quiz_user_id = request.args.get("quiz_user_id")
        session = chat_collection.find_one({"user_id": quiz_user_id}, {"persona_profile": 1}) if quiz_user_id else None
        persona_profile = session.get("persona_profile", {}) if session else {}
        user_tags = (persona_profile.get("interest_tags") or [])

        articles_cursor = articles_collection.find(
            {"user_id": user_id},
            {
                "_id": 1,
                "openalex_id": 1,
                "title": 1,
                "year": 1,
                "journal": 1,
                "url": 1,
                "pdf_url": 1,
                "abstract": 1,
                "authors": 1,
                "click_count": 1,
                "content_score": 1,
            }
        )

        articles = []
        for article in articles_cursor:
            article["_id"] = str(article["_id"])
            articles.append(article)

        articles = rank_articles(articles, user_tags)

        return jsonify({"articles": articles, "persona_profile": persona_profile}), 200
    except Exception as e:
        logger.error(f"get_articles error: {e}")
        return jsonify({"error": str(e)}), 500


@articles_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()

        body = request.get_json(silent=True) or {}
        quiz_user_id = body.get("quiz_user_id")

        new_tags, err = sanitize_tags(body.get("tags"))
        if err:
            return jsonify({"error": err}), 400

        old_tags = []
        session = chat_collection.find_one({"user_id": quiz_user_id}, {"persona_profile": 1}) if quiz_user_id else None
        if session:
            old_tags = (session.get("persona_profile") or {}).get("interest_tags") or []

        old_set = set(old_tags)
        new_set = set(new_tags)
        added_tags = list(new_set - old_set)
        is_pure_addition = old_set.issubset(new_set) and added_tags

        query = build_query(new_tags)

        if is_pure_addition:
            main(user_id, tags=new_tags)
        else:
            articles_collection.delete_many({"user_id": user_id})
            main(user_id, tags=new_tags)

        if quiz_user_id:
            chat_collection.update_one(
                {"user_id": quiz_user_id},
                {"$set": {
                    "persona_profile.interest_tags": new_tags,
                    "persona_profile.search_query": query,
                }}
            )

        return jsonify({"status": "ok"}), 200
    except Exception as e:
        logger.error(f"update_profile error: {e}")
        return jsonify({"error": str(e)}), 500


@articles_bp.route('/articles', methods=['POST'])
@jwt_required()
def articles():
    try:
        user_id = get_jwt_identity()

        body = request.get_json(silent=True) or {}
        quiz_user_id = body.get("quiz_user_id")

        persona_profile = {}
        if quiz_user_id:
            session = chat_collection.find_one({"user_id": quiz_user_id}, {"persona_profile": 1})
            persona_profile = (session.get("persona_profile") or {}) if session else {}

        persona_tags = persona_profile.get("interest_tags") or None
        persona_search_query = persona_profile.get("search_query") or None

        articles_collection.delete_many({"user_id": user_id})
        main(user_id, tags=persona_tags, search_query=persona_search_query)
        return jsonify({"status": "successful"}), 200

    except Exception as e:
        logger.error(f"articles POST error: {e}")
        return jsonify({"error": str(e)}), 500


@articles_bp.route('/articles/<article_id>/click', methods=['POST'])
@jwt_required()
def track_click(article_id):
    try:
        user_id = get_jwt_identity()
        try:
            obj_id = ObjectId(article_id)
        except InvalidId:
            return jsonify({"error": "Invalid article id"}), 400

        articles_collection.update_one(
            {"_id": obj_id, "user_id": user_id},
            {"$inc": {"click_count": 1}}
        )
        return jsonify({"status": "ok"}), 200
    except Exception as e:
        logger.error(f"track_click error: {e}")
        return jsonify({"error": str(e)}), 500
