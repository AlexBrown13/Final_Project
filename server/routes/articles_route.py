from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from services.mongo import articles_collection
from services.openalex_articles import main

articles_bp = Blueprint("openalex_articles", __name__)

@articles_bp.route('/articles', methods=['POST'])
@jwt_required()
def articles():
    try:
        user_id_str = get_jwt_identity()
        user_id = ObjectId(user_id_str)

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        
        main(user_id) 
        return jsonify({"status": "successful"}), 200
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

