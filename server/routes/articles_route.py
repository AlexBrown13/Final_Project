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


# ── Persona boost keyword groups (Revamp.md PART 4, lines 220-224) ────────────
_STORIES_KEYWORDS = ("case study", "narrative", "interview", "testimony",
                     "survivor", "personal account", "qualitative")
_RESEARCH_KEYWORDS = ("prevalence", "epidemiological", "randomized", "meta-analysis",
                      "systematic review", "cohort", "longitudinal")
_SUPPORT_KEYWORDS = ("support", "intervention", "treatment", "therapy",
                     "recovery", "coping", "resilience")
_PROFESSIONAL_KEYWORDS = ("clinical", "framework", "protocol", "evidence-based",
                          "intervention", "efficacy")
# Abstracts that are "purely epidemiological" get demoted for grieving/distressed users.
_EPIDEMIOLOGICAL_KEYWORDS = ("prevalence", "epidemiological", "incidence",
                             "meta-analysis", "systematic review", "cohort")


def persona_boost(abstract: str, emotional_state: str, content_preference: str) -> float:
    """
    Bounded [0.0, 1.0] persona-fit score from case-insensitive keyword matching on the
    article abstract (NO ML). Per Revamp.md PART 4 (lines 220-224). content_preference and
    emotional_state independently contribute; the demote rule subtracts for grieving/
    distressed users when the abstract is purely epidemiological.
    """
    text = (abstract or "").lower()
    if not text:
        return 0.0

    boost = 0.0

    # content_preference contribution (0.5 if any group keyword present)
    if content_preference == "stories" and any(k in text for k in _STORIES_KEYWORDS):
        boost += 0.5
    elif content_preference == "research" and any(k in text for k in _RESEARCH_KEYWORDS):
        boost += 0.5

    # emotional_state contribution (0.5 if any group keyword present)
    if emotional_state in ("grieving", "distressed"):
        if any(k in text for k in _SUPPORT_KEYWORDS):
            boost += 0.5
        # demote purely epidemiological abstracts for vulnerable users
        if any(k in text for k in _EPIDEMIOLOGICAL_KEYWORDS) \
                and not any(k in text for k in _SUPPORT_KEYWORDS):
            boost -= 0.5
    elif emotional_state == "professional":
        if any(k in text for k in _PROFESSIONAL_KEYWORDS):
            boost += 0.5

    # bound to [0.0, 1.0]
    return max(0.0, min(boost, 1.0))


def rank_articles(articles: list, user_tags: list,
                  emotional_state: str = "curious",
                  content_preference: str = "mixed") -> list:
    """
    Sort articles using the content_score stored at ingestion time, combined
    with live click engagement, recency, and a persona-fit boost. No ML inference
    on reads — persona_boost is case-insensitive keyword matching on the abstract.

    Final score:
      0.60 × content_score  (BM25+embedding, computed once at ingestion)
      0.25 × click score    (normalised, capped at 10 clicks)
      0.05 × recency        (publication year, 2000–2026 range)
      0.10 × persona_boost  (keyword match on abstract vs emotional_state +
                             content_preference, bounded [0.0, 1.0], no ML)
    """
    if not articles:
        return articles

    scored = []
    for article in articles:
        content_score = float(article.get("content_score") or 0.0)
        click_score = min(article.get("click_count", 0) / 10.0, 1.0)
        year = article.get("year") or 2000
        recency_score = max(0.0, min((int(year) - 2000) / 26.0, 1.0))
        boost = persona_boost(article.get("abstract"), emotional_state, content_preference)
        final = (0.60 * content_score
                 + 0.25 * click_score
                 + 0.05 * recency_score
                 + 0.10 * boost)
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

        articles = rank_articles(
            articles, user_tags,
            emotional_state=persona_profile.get("emotional_state", "curious"),
            content_preference=persona_profile.get("content_preference", "mixed"),
        )

        for article in articles:
            title = (article.get("title") or "").lower()
            abstract = (article.get("abstract") or "").lower()
            article["matched_tags"] = [
                tag for tag in user_tags
                if tag.lower() in title or tag.lower() in abstract
            ]

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
