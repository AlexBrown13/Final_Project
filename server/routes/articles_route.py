from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from services.mongo import articles_collection
from services.openalex_articles import main

articles_bp = Blueprint("openalex_articles", __name__)

@articles_bp.route('/articles', methods=['GET'])
@jwt_required()
def get_articles():
    try:
        user_id_str = get_jwt_identity()
        user_id = ObjectId(user_id_str)

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
            }
        ).sort("year", -1)

        articles = []
        for article in articles_cursor:
            article["_id"] = str(article["_id"])
            articles.append(article)

        session = chat_collection.find_one({"user_id": user_id}, {"persona_profile": 1})
        persona_profile = session.get("persona_profile", {}) if session else {}

        return jsonify({"articles": articles, "persona_profile": persona_profile}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@articles_bp.route('/articles', methods=['POST'])
@jwt_required()
def articles():
    try:
        user_id_str = get_jwt_identity()
        user_id = ObjectId(user_id_str)

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        session = chat_collection.find_one({"user_id": user_id}, {"persona_profile": 1})
        persona_query = None
        if session and session.get("persona_profile"):
            persona_query = session["persona_profile"].get("search_query")

        main(user_id, query=persona_query)
        return jsonify({"status": "successful"}), 200
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

