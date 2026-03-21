import os, json
from flask import Blueprint,request, jsonify
from services.mongo import get_chat_collection
from services.groq import (
    client_groq, 
    generate_dynamic_question, 
    score_user_conversation
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from utils.logger import logger
from utils.chat_prompts import (
    SCORING_SYSTEM_PROMPT,
    DYNAMIC_QUESTION_SYSTEM_PROMPT,
    SEED_QUESTIONS
)
from dotenv import load_dotenv
load_dotenv()

# ──────────────────────────────────────────────
# APP SETUP
# ──────────────────────────────────────────────

chat_bp = Blueprint("chat", __name__)

limiter = Limiter( #prevents endpoint spam
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)


# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────

def format_conversation(conversation: list) -> str:
    """Format conversation history for AI context — question first, then answer."""
    return "\n".join([
        f"System: {c['question']}\nUser: {c['answer']}"
        for c in conversation
    ])


def parse_score_response(raw: str) -> dict:
    """
    Safely parse the JSON scoring response from the AI.
    Strips markdown fences if the model adds them, validates score is 1-3,
    and falls back to score 1 if anything goes wrong.
    """
    try:
        cleaned = (
            raw.strip()
            .removeprefix("```json")
            .removeprefix("```")
            .removesuffix("```")
            .strip()
        )
        parsed = json.loads(cleaned)
        score = int(parsed.get("score", 1))
        if score not in (1, 2, 3):
            score = 1
        return {
            "score": score,
            "reason": parsed.get("reason", "")
        }
    except (json.JSONDecodeError, ValueError, TypeError) as e:
        logger.warning(f"Failed to parse score response: {e}. Raw: {raw}")
        return {
            "score": 1,
            "reason": "Could not parse scoring response — defaulting to score 1"
        }



@chat_bp.post("/")  # /chat
@limiter.limit("30 per hour") #prevents chat endpoint spam
def chat():
    """
    Main quiz endpoint. Handles the full flow:
    - First call (no session): creates session, returns first question
    - Mid-quiz: generates a dynamic AI follow-up question
    - Final call (after all questions answered): scores user 1-3 and saves result
    """
    data = request.json
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    # Use .get() to avoid KeyError crash if fields are missing
    user_id = data.get("user_id")
    message = data.get("message")

    if not user_id or not message:
        return jsonify({"error": "Missing user_id or message"}), 400

    # Input length guard — prevents abuse and runaway token usage
    if len(message) > 1000:
        return jsonify({"error": "Message too long — max 1000 characters"}), 400

    # Groq client
    try:
        client = client_groq()
    except Exception as e:
        return jsonify({"error": f"{str(e)}"}), 300

    # Mongo client
    try:
        chat_collection = get_chat_collection()
    except Exception as e:
        return jsonify({"error": str(e)})

    # Load session
    try:
        session = chat_collection.find_one({"user_id": user_id})
    except Exception as e:
        return jsonify({"error": f"MongoDB find failed: {str(e)}"}), 500

    # ── New session: create and return first question ──
    if not session:
        try:
            result = chat_collection.insert_one({
                "user_id": user_id,
                "step": 0,
                "conversation": [],
                "last_question": SEED_QUESTIONS[0],
                "score": None,
                "completed": False
            })
            if not result.acknowledged:
                return jsonify({"error": "Failed to create session"}), 500
            logger.info(f"New session created for user_id: {user_id}")
        except Exception as e:
            logger.error(f"MongoDB insert error: {e}")
            return jsonify({"error": f"MongoDB error: {str(e)}"}), 500

        return jsonify({
            "reply": SEED_QUESTIONS[0],
            "step": 0,
            "total_steps": len(SEED_QUESTIONS),
            "completed": False
        })

    # ── Guard: prevent re-submission after quiz is already done ──
    if session.get("completed"):
        return jsonify({
            "error": "Quiz already completed",
            "score": session.get("score"),
            "completed": True
        }), 400

    step = session["step"]
    conversation = session["conversation"]
    last_question = session["last_question"]

    # Record the user's answer to the previous question
    conversation.append({
        "question": last_question,
        "answer": message
    })
    step += 1

    # ── More questions remaining: generate a dynamic follow-up ──
    if step < len(SEED_QUESTIONS):
        formatted_conv = format_conversation(conversation)

        next_question = generate_dynamic_question(
            client=client,
            step=step,
            formatted_conv=formatted_conv,
            message=message,
            seed_question=SEED_QUESTIONS,
            system_prompt=DYNAMIC_QUESTION_SYSTEM_PROMPT
        )
       
        try:
            update_result = chat_collection.update_one(
                {"user_id": user_id},
                {"$set": {
                    "step": step,
                    "conversation": conversation,
                    "last_question": next_question
                }}
            )
            if update_result.matched_count == 0:
                return jsonify({"error": "Session not found for update"}), 404
        except Exception as e:
            logger.error(f"MongoDB update error: {e}")
            return jsonify({"error": f"MongoDB update failed: {str(e)}"}), 500

        return jsonify({
            "reply": next_question,
            "step": step,
            "total_steps": len(SEED_QUESTIONS),
            "completed": False
        })

    # ── All questions answered: score the user ──
    formatted_conv = format_conversation(conversation)
    logger.info(f"Scoring user_id: {user_id}")


    raw_score = score_user_conversation(
        client=client,
        formatted_conv=formatted_conv,
        system_prompt=SCORING_SYSTEM_PROMPT
    )

    if raw_score:
        score_data = parse_score_response(raw_score)
    else:
        score_data = {
            "score": 1,
            "reason": "Scoring failed — fallback to default score 1"
        }

   
    try:
        chat_collection.update_one(
            {"user_id": user_id},
            {"$set": {
                "step": step,
                "conversation": conversation,
                "score": score_data["score"],
                "score_reason": score_data["reason"],
                "completed": True
            }}
        )
        logger.info(f"User {user_id} scored: {score_data['score']}")
    except Exception as e:
        logger.error(f"Failed to save final score: {e}")
        return jsonify({"error": f"Failed to save final score: {str(e)}"}), 500

    return jsonify({
        "reply": None,
        "completed": True,
        "step": step,
        "total_steps": len(SEED_QUESTIONS),
        "score": score_data["score"],
        "score_reason": score_data["reason"]
    })



delete_session = Blueprint("del_session", __name__)

@delete_session.delete("/")
def del_session(user_id: str):
    """
    Delete a session so the user can retake the quiz.
    Useful during development and for a 'retake' button on the frontend.
    """

    # Mongo client
    try:
        chat_collection = get_chat_collection()
    except Exception as e:
        return jsonify({"error": str(e)})
    
    try:
        result = chat_collection.delete_one({"user_id": user_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Session not found"}), 404
        logger.info(f"Session deleted for user_id: {user_id}")
        return jsonify({"message": "Session deleted successfully"})
    except Exception as e:
        logger.error(f"MongoDB delete error: {e}")
        return jsonify({"error": f"MongoDB error: {str(e)}"}), 500
