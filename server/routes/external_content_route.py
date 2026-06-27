import os
import requests
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from services.mongo import guardian_cache_collection
from utils.logger import logger

external_content_bp = Blueprint("external_content", __name__)

GUARDIAN_URL = "https://content.guardianapis.com/search"
GUARDIAN_TIMEOUT = 8          # seconds (Render-friendly, mirrors openalex timeout idiom)
CACHE_TTL_SECONDS = 3600      # informational; the Mongo TTL index enforces expiry


@external_content_bp.route("/external/stories", methods=["GET"])
def external_stories():
    """
    GET /api/external/stories?topic=<primary_topic>
    PUBLIC (no auth) — see B-5 Finding D. Returns a JSON array of Guardian story
    objects, or [] on ANY failure path (missing key, timeout, HTTP error, bad JSON,
    0 results). NEVER raises to the client. English only (no Hebrew translation).
    """
    try:
        # 1. Normalize topic; empty/missing → [] (graceful)
        topic = (request.args.get("topic") or "").lower().strip()
        if not topic:
            return jsonify([]), 200

        # 2. Cache hit → return stored stories
        try:
            cached = guardian_cache_collection.find_one({"topic": topic})
            if cached and cached.get("stories"):
                return jsonify(cached["stories"]), 200
        except Exception as e:
            logger.warning(f"guardian_cache read failed: {e}")
            # fall through to live fetch

        # 3. Missing API key → [] (do not raise)
        api_key = os.environ.get("GUARDIAN_API_KEY")
        if not api_key:
            logger.warning("GUARDIAN_API_KEY not set; returning [] for external stories")
            return jsonify([]), 200

        # 4. Cache miss → query Guardian
        params = {
            "q": f"{topic} Israel trauma",
            "section": "world",
            "show-fields": "thumbnail,trailText,headline",
            "page-size": 3,
            "api-key": api_key,
        }
        resp = requests.get(GUARDIAN_URL, params=params, timeout=GUARDIAN_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()

        # 5. Parse → list of {headline, summary, thumbnail, url, date, source}
        results = (data.get("response", {}) or {}).get("results", []) or []
        stories = []
        for item in results:
            fields = item.get("fields", {}) or {}
            stories.append({
                "headline": fields.get("headline") or item.get("webTitle", ""),
                "summary": fields.get("trailText", ""),
                "thumbnail": fields.get("thumbnail", ""),
                "url": item.get("webUrl", ""),
                "date": item.get("webPublicationDate", ""),
                "source": "The Guardian",
            })

        # 6. 0 results → return [] WITHOUT caching (retry next request) — Revamp.md L275
        if not stories:
            return jsonify([]), 200

        # 7. Upsert into cache with current timestamp
        try:
            guardian_cache_collection.update_one(
                {"topic": topic},
                {"$set": {
                    "topic": topic,
                    "stories": stories,
                    "fetched_at": datetime.now(timezone.utc),
                }},
                upsert=True,
            )
        except Exception as e:
            logger.warning(f"guardian_cache write failed: {e}")
            # still return the stories — caching is best-effort

        return jsonify(stories), 200

    except Exception as e:
        # API failure / timeout / bad JSON / anything → [] (never raise to client)
        logger.warning(f"external_stories failed: {e}")
        return jsonify([]), 200
