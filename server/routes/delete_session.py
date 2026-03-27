from flask import Blueprint, jsonify
from services.mongo import chat_collection
from utils.logger import logger

delete_session = Blueprint("delete_session", __name__)

@delete_session.delete("/<user_id>")
def delete_session_route(user_id):
    """
    Delete a session so the user can retake the quiz.
    Useful during development and for a 'retake' button on the frontend.
    """
    
    try:
        result = chat_collection.delete_one({"user_id": user_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Session not found"}), 404
        logger.info(f"Session deleted for user_id: {user_id}")
        return jsonify({"message": "Session deleted successfully"})
    except Exception as e:
        logger.error(f"MongoDB delete error: {e}")
        return jsonify({"error": f"MongoDB error: {str(e)}"}), 500
