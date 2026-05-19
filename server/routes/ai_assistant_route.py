from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.ai_assistant import main
from utils.logger import logger


ai_assistant_bp = Blueprint("ai_assistant", __name__)


@ai_assistant_bp.route('/ai/assistant', methods=['POST'])
@jwt_required()
def ai_assistant():
    try:

        user_id = get_jwt_identity()

        if not user_id:
            logger.error("AI-Assistant invalid user identify")
            return jsonify({"error": "Invalid user identity"}), 400
       
        # Extract user message from request body
        message = request.get_json().get("message")

        # AI assistant service
        main(user_id, question=message)

        return jsonify({"status": "success"}), 200
    
    except Exception as e:
        logger.error(f"AI-Assistant error: {e}")