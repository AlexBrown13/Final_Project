from flask import Blueprint, jsonify
from services.mongo import get_chat_collection
from utils.logger import logger

chat_score = Blueprint("get_result", __name__)

@chat_score.get("/<user_id>") 
def get_result(user_id):
    """
    Fetch the final score for a completed session.
    Lets the frontend recover the score after a page refresh without re-running the quiz.
    """
    # Mongo client
    try:
        chat_collection = get_chat_collection()
        print(chat_collection)
    except Exception as e:
        return jsonify({"error": str(e)})
    
    try:
        session = chat_collection.find_one({"user_id": user_id})
    except Exception as e:
        logger.error(f"MongoDB find error: {e}")
        return jsonify({"error": f"MongoDB error: {str(e)}"}), 500

    if not session:
        return jsonify({"error": "Session not found"}), 404

    if not session.get("completed"):
        return jsonify({"error": "Quiz not yet completed", "completed": False}), 400

    return jsonify({
        "user_id": user_id,
        "score": session["score"],
        "score_reason": session.get("score_reason", ""),
        "completed": True
    })