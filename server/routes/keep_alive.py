from flask import Blueprint, jsonify

keep_alive = Blueprint("health", __name__)

@keep_alive.get("/")
def health():
    """Health check endpoint — confirms the server is running."""
    return jsonify({"status": "ok"})