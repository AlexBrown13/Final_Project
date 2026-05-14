"""JWT blocklist backed by MongoDB so revoked tokens survive server restarts.

An in-memory set is kept as a fast-path cache; MongoDB is the source of truth.
"""

from datetime import datetime, timezone
from utils.logger import logger

# Fast-path cache populated at runtime
_cache: set = set()


def _get_collection():
    from services.mongo import token_blocklist_collection
    return token_blocklist_collection


def revoke_jti(jti: str) -> None:
    if not jti:
        return
    _cache.add(jti)
    try:
        _get_collection().update_one(
            {"jti": jti},
            {"$set": {"jti": jti, "revoked_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
    except Exception as e:
        logger.error(f"Failed to persist revoked JTI to MongoDB: {e}")


def is_jti_revoked(jti: str) -> bool:
    if not jti:
        return False
    if jti in _cache:
        return True
    try:
        found = _get_collection().find_one({"jti": jti}, {"_id": 0, "jti": 1})
        if found:
            _cache.add(jti)
            return True
    except Exception as e:
        logger.error(f"Failed to check JTI in MongoDB: {e}")
    return False
