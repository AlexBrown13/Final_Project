from flask import Blueprint, jsonify, request
from datetime import datetime
from services.mongo import trends_collection

trends_bp = Blueprint("trends", __name__)

@trends_bp.route('/trends')
def trends():
    try:
        data = list(
            trends_collection.find({}, {"_id": 0}) 
        )
        features = [key for key in data[0].keys() if key != "date"] if data else []

        return jsonify({"data_trends": data, "features": features}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500