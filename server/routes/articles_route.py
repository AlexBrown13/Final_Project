import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.errors import InvalidId
from services.mongo import articles_collection, chat_collection
from services.openalex_articles import main
from utils.logger import logger

articles_bp = Blueprint("openalex_articles", __name__)

# ── Tag validation ──────────────────────────────────────────────────────────
MAX_TAGS = 5
MAX_TAG_LEN = 50
# Allow Unicode letters/numbers, spaces, hyphens — blocks $, {, }, operators, etc.
_SAFE_TAG = re.compile(r'^[\w\s\-]{1,50}$', re.UNICODE)


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


def build_query(tags):
    if len(tags) == 1:
        return f"trauma AND Israel AND {tags[0]}"
    return f"trauma AND Israel AND ({' OR '.join(tags)})"


# ── Routes ──────────────────────────────────────────────────────────────────

@articles_bp.route('/articles', methods=['GET'])
@jwt_required()
def get_articles():
    try:
        user_id_str = get_jwt_identity()
        try:
            user_id = user_id_str
        except InvalidId:
            return jsonify({"error": "Invalid user identity"}), 400

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
            }
        ).sort("year", -1)

        articles = []
        for article in articles_cursor:
            article["_id"] = str(article["_id"])
            articles.append(article)

        quiz_user_id = request.args.get("quiz_user_id")
        session = chat_collection.find_one({"user_id": quiz_user_id}, {"persona_profile": 1}) if quiz_user_id else None
        persona_profile = session.get("persona_profile", {}) if session else {}

        return jsonify({"articles": articles, "persona_profile": persona_profile}), 200
    except Exception as e:
        logger.error(f"get_articles error: {e}")
        return jsonify({"error": str(e)}), 500


@articles_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id_str = get_jwt_identity()
        try:
            user_id = user_id_str
        except InvalidId:
            return jsonify({"error": "Invalid user identity"}), 400

        body = request.get_json(silent=True) or {}
        quiz_user_id = body.get("quiz_user_id")

        new_tags, err = sanitize_tags(body.get("tags"))
        if err:
            return jsonify({"error": err}), 400

        # Determine whether this is a pure addition or a replacement
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
        user_id_str = get_jwt_identity()
        try:
            user_id = user_id_str
        except InvalidId:
            return jsonify({"error": "Invalid user identity"}), 400

        body = request.get_json(silent=True) or {}
        quiz_user_id = body.get("quiz_user_id")

        session = chat_collection.find_one({"user_id": quiz_user_id}, {"persona_profile": 1}) if quiz_user_id else None
        persona_tags = (session.get("persona_profile") or {}).get("interest_tags") or None if session else None

        articles_collection.delete_many({"user_id": user_id})
        main(user_id, tags=persona_tags)
        return jsonify({"status": "successful"}), 200

    except Exception as e:
        logger.error(f"articles POST error: {e}")
        return jsonify({"error": str(e)}), 500
