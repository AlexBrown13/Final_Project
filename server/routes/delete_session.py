from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from bson.errors import InvalidId
from services.mongo import chat_collection, articles_collection
from utils.logger import logger

delete_session = Blueprint("delete_session", __name__)

@delete_session.delete("/<user_id>")
@jwt_required(optional=True)
def delete_session_route(user_id):
    """
    Delete a quiz session (by quiz UUID) and all associated articles (by JWT ObjectId).
    JWT is optional — unauthenticated users can still reset their quiz session,
    but articles are only deleted when a valid token is present.
    """
    try:
        result = chat_collection.delete_one({"user_id": user_id})

        if result.deleted_count == 0:
            return jsonify({"error": "Session not found"}), 404

        logger.info(f"Session deleted for quiz user_id: {user_id}")

        articles_deleted = 0
        auth_user_id_str = get_jwt_identity()
        if auth_user_id_str:
            try:
                auth_user_id = ObjectId(auth_user_id_str)
                articles_result = articles_collection.delete_many({"user_id": auth_user_id})
                articles_deleted = articles_result.deleted_count
                logger.info(f"Deleted {articles_deleted} articles for user: {auth_user_id_str}")
            except InvalidId as e:
                logger.warning(f"Invalid ObjectId when deleting articles: {e}")

        return jsonify({
            "message": "Session deleted successfully",
            "articles_deleted": articles_deleted
        })
    except Exception as e:
        logger.error(f"MongoDB delete error: {e}")
        return jsonify({"error": f"MongoDB error: {str(e)}"}), 500
