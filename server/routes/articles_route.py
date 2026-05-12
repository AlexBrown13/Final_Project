from flask import Blueprint, jsonify
from services.mongo import articles_collection

articles_bp = Blueprint("openalex_articles", __name__)

@articles_bp.route('/articles', methods=['GET'])
def articles():
    try:
        pass
        
            
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

