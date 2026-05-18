import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from bson.errors import InvalidId
from services.ai_assistant import main
from utils.logger import logger


ai_assistant_bp = Blueprint("ai_assistant", __name__)


@ai_assistant_bp.route('/ai/assistant', methods=['POST'])
@jwt_required()
def ai_assistant():
    try:
        user_id_str = get_jwt_identity()

        try:
            user_id = ObjectId(user_id_str)
        except InvalidId:
            logger.error("AI-Assistant invalid user identify")
            return jsonify({"error": "Invalid user identity"}), 400
        
        # Extract user message from request body
        message = request.get_json().get("message")

        main(user_id, question=message)

        return jsonify({
            "status": "success",
            "user_id": user_id_str
        }), 200
    
    except Exception as e:
        pass