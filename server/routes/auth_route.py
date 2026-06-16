from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from pymongo.errors import PyMongoError
import bcrypt
import re
import uuid
from services.mongo import users_collection, chat_collection
from jwt_blocklist import revoke_jti

auth_bp = Blueprint("auth", __name__)

# Validation function
def validate_register(data):
    errors = []
    email = data.get("email")
    password = data.get("password")

    # Email validation
    if not email:
        errors.append("Email is required")
    else:
        email = email.strip().lower()

        # format check
        email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(email_regex, email):
            errors.append("Invalid email format")

        if len(email) > 50:
            errors.append("Email too long")
    
    #Password validation
    if not password:
        errors.append("Password is required")
    else:
        if len(password) < 6:
            errors.append("Password must be at least 6 characters")

        if len(password) > 128:
            errors.append("Password too long")

        # strong password rules (recommended)
        if not re.search(r"[A-Z]", password):
            errors.append("Password must include an uppercase letter")

        if not re.search(r"[a-z]", password):
            errors.append("Password must include a lowercase letter")

        if not re.search(r"[0-9]", password):
            errors.append("Password must include a number")

    return errors


# Register route
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    # Validation input
    errors = validate_register(data)
    if errors:
        return jsonify({"errors": errors}), 400

    email = data.get("email").strip().lower()
    password = data.get("password")

    try:
        user = users_collection.find_one({"email": email})
        if user is not None:
            return jsonify({"error": "User already exists"}), 400
    except Exception as e:
        return jsonify({"error": "MongoDB find failed"}), 500

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    # generaye user_id unique
    user_id = str(uuid.uuid4())

    try:
        response = users_collection.insert_one({
            "user_id": user_id,
            "email": email,
            "password": hashed
        })
        
        if not response.acknowledged:
            return jsonify({"error": "Failed to create new user"}), 500
        return jsonify({"message": "User created"}), 201
    
    except Exception as e:
        return jsonify({"error": "Error inserting new user into MongoDB"}), 500

    


# Login route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    
    # Validation input
    errors = validate_register(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    email = data.get("email").strip().lower()
    password = data.get("password")

    try:
        user = users_collection.find_one({"email": email})
    except PyMongoError:
        return jsonify({"error": "MongoDB find failed"}), 500

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
    access_token = create_access_token(
        identity=user["user_id"],
        additional_claims={"email": email}
    )

    # Restore persona/score for the returning user.
    # 1. Try auth_user_id link — works from any device after first login.
    # 2. Fall back to quiz_user_id sent by this device — covers first-time login.
    #    When found this way, write auth_user_id so future logins skip step 2.
    persona_profile = None
    score = None

    session = chat_collection.find_one(
        {"auth_user_id": user["user_id"], "completed": True},
        {"score": 1, "persona_profile": 1}
    )
    if not session:
        quiz_user_id = data.get("quiz_user_id")
        if quiz_user_id:
            session = chat_collection.find_one(
                {"user_id": quiz_user_id, "completed": True},
                {"score": 1, "persona_profile": 1}
            )
            if session:
                try:
                    chat_collection.update_one(
                        {"user_id": quiz_user_id, "completed": True},
                        {"$set": {"auth_user_id": user["user_id"]}}
                    )
                except Exception:
                    pass  # non-critical; persona still returned below

    if session:
        score = session.get("score")
        persona_profile = session.get("persona_profile")

    return jsonify({
        "message": "Login success",
        "token": access_token,
        "user_id": user["user_id"],
        "score": score,
        "persona_profile": persona_profile,
    }), 200


# Logout route
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Invalidate the current access token (blocklist) so it cannot be reused."""
    token_claims = get_jwt()
    revoke_jti(token_claims.get("jti"))
    return jsonify({"message": "Logged out"}), 200
