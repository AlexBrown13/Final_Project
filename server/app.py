from flask import Flask
from flask_cors import CORS
from routes.chat_route import chat_bp, delete_session
from routes.chat_score_route import chat_score
from routes.keep_alive import keep_alive
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(chat_bp, url_prefix="/chat")
app.register_blueprint(chat_score, url_prefix="/result/<user_id>")
app.register_blueprint(delete_session, url_prefix="/session/<user_id>")
app.register_blueprint(keep_alive, url_prefix="/health")

if __name__ == "__main__":
    app.run(port=5500, debug=True)


# @app.delete("/session/<user_id>")
# def delete_session(user_id: str):
#     """
#     Delete a session so the user can retake the quiz.
#     Useful during development and for a 'retake' button on the frontend.
#     """
#     try:
#         result = chat_collection.delete_one({"user_id": user_id})
#         if result.deleted_count == 0:
#             return jsonify({"error": "Session not found"}), 404
#         logger.info(f"Session deleted for user_id: {user_id}")
#         return jsonify({"message": "Session deleted successfully"})
#     except Exception as e:
#         logger.error(f"MongoDB delete error: {e}")
#         return jsonify({"error": f"MongoDB error: {str(e)}"}), 500


# if __name__ == "__main__":
#     app.run(port=5500, debug=True)