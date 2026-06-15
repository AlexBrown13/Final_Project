import json
from flask import Blueprint, request, jsonify
from services.mongo import chat_collection
from services.groq import (
    client_groq,
    generate_dynamic_question,
    extract_persona_profile
)
from utils.logger import logger
from utils.distress import detect_distress, get_resources
from extensions import limiter
from utils.chat_prompts import (
    DYNAMIC_QUESTION_SYSTEM_PROMPT,
    PERSONA_PROFILE_SYSTEM_PROMPT,
    SEED_QUESTIONS,
    FIRST_QUESTION
)

# ──────────────────────────────────────────────
# APP SETUP
# ──────────────────────────────────────────────

chat_bp = Blueprint("chat", __name__)

# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────

def reconstruct_conversation(client_messages: list) -> list:
    """
    Convert frontend [{role, text}] pairs into backend [{question, answer}] format.
    Pairs up consecutive assistant→user message pairs.
    """
    conversation = []
    i = 0
    while i < len(client_messages) - 1:
        current = client_messages[i]
        nxt = client_messages[i + 1]
        if current.get("role") == "assistant" and nxt.get("role") == "user":
            conversation.append({
                "question": current.get("text", ""),
                "answer": nxt.get("text", "")
            })
            i += 2
        else:
            i += 1
    return conversation


def format_conversation(conversation: list) -> str:
    """Format conversation history for AI context — question first, then answer."""
    return "\n".join([
        f"System: {c['question']}\nUser: {c['answer']}"
        for c in conversation
    ])


def clean_ai_json(raw: str) -> str:
    """Normalize AI output into plain JSON text by stripping markdown fences."""
    return (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )


# Tags that are already anchored in every OpenAlex query or are too broad
# to differentiate one article from another — filtered out after LLM extraction
_GENERIC_TAGS = {
    "trauma", "israel", "mental health", "psychology", "stress",
    "health", "support", "wellbeing", "awareness", "disorder",
    "psychiatric", "emotional", "psychological", "therapy", "treatment",
    "research", "study", "war", "conflict",
}


def _clean_tags(raw_tags, primary_topic=None):
    """
    Filter out generic/anchor tags and deduplicate.
    Falls back to primary_topic if everything gets filtered.
    """
    if not isinstance(raw_tags, list):
        raw_tags = [raw_tags] if isinstance(raw_tags, str) else []

    seen = set()
    cleaned = []
    for t in raw_tags:
        if not isinstance(t, str):
            continue
        t = t.strip()
        if not t:
            continue
        if t.lower() in _GENERIC_TAGS:
            continue
        if t.lower() in seen:
            continue
        seen.add(t.lower())
        cleaned.append(t)

    # If all tags were filtered out, use primary_topic as a fallback tag
    if not cleaned and primary_topic and isinstance(primary_topic, str):
        pt = primary_topic.strip()
        if pt and pt.lower() not in _GENERIC_TAGS:
            cleaned = [pt]

    return cleaned[:5]


def parse_persona_profile(raw: str) -> dict:
    """
    Safely parse persona JSON from the AI, filter generic tags, and normalize fields.
    """
    try:
        parsed = json.loads(clean_ai_json(raw))
        primary_topic = parsed.get("primary_topic", "")
        interest_tags = _clean_tags(parsed.get("interest_tags", []), primary_topic)

        return {
            "persona": parsed.get("persona", "beginner"),
            "interest_tags": interest_tags,
            "preferred_content": parsed.get("preferred_content", ""),
            "primary_topic": primary_topic,
            "search_query": parsed.get("search_query", "")
        }
    except (json.JSONDecodeError, ValueError, TypeError) as e:
        logger.warning(f"Failed to parse persona response: {e}. Raw: {raw}")
        return {
            "persona": "beginner",
            "interest_tags": [],
            "preferred_content": "",
            "primary_topic": "",
            "search_query": ""
        }


@chat_bp.post("")  # /chat
@limiter.limit("30 per hour")
def chat():
    """
    Main quiz endpoint. Handles the full flow:
    - First call (no session): creates session, returns first question
    - Mid-quiz: generates a dynamic AI follow-up question using the conversation
      sent by the frontend (not stored in DB until quiz is complete)
    - Final call (after all questions answered): scores user 1-3, saves full
      conversation + score + persona to DB in a single write
    """
    data = request.json
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    user_id = data.get("user_id")
    message = data.get("message")
    client_messages = data.get("messages", [])
    locale = data.get("locale", "en")
    first_question = FIRST_QUESTION.get(locale, FIRST_QUESTION["en"])

    if not user_id or not message:
        return jsonify({"error": "Missing user_id or message"}), 400

    if len(message) > 1000:
        return jsonify({"error": "Message too long — max 1000 characters"}), 400

    distress_level = detect_distress(message)
    if distress_level >= 2:
        logger.warning(f"Distress level {distress_level} detected for user_id: {user_id}")
        return jsonify({
            "crisis": True,
            "crisis_level": distress_level,
            "resources": get_resources(locale),
            "reply": None,
            "completed": False,
        }), 200

    try:
        client = client_groq()
    except Exception as e:
        return jsonify({"error": f"{str(e)}"}), 300

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
                "last_question": first_question,
                "score": None,
                "persona_profile": {},
                "completed": False
                # conversation is NOT stored here — only saved at completion
            })
            if not result.acknowledged:
                return jsonify({"error": "Failed to create session"}), 500
            logger.info(f"New session created for user_id: {user_id}")
        except Exception as e:
            logger.error(f"MongoDB insert error: {e}")
            return jsonify({"error": f"MongoDB error: {str(e)}"}), 500

        return jsonify({
            "reply": first_question,
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

    # Reconstruct conversation from the messages the frontend sent.
    # This avoids writing the conversation array to MongoDB on every step.
    conversation = reconstruct_conversation(client_messages)

    # Append the current user answer to the reconstructed conversation
    last_question = session.get("last_question", first_question if step == 0 else SEED_QUESTIONS[step] if step < len(SEED_QUESTIONS) else "")
    conversation.append({
        "question": last_question,
        "answer": message
    })
    step += 1

    EARLY_FINISH_TRIGGERS = {
        "done", "finish", "finished", "stop", "quit", "end", "enough",
        "that's enough", "thats enough", "i'm done", "im done", "skip",
        "סיימתי", "מספיק", "די", "גמרתי", "סיים", "לא רוצה להמשיך"
    }
    user_wants_to_finish = message.strip().lower() in EARLY_FINISH_TRIGGERS

    # ── More questions remaining: generate a dynamic follow-up ──
    if step < len(SEED_QUESTIONS) and not user_wants_to_finish:
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
                    "last_question": next_question
                    # conversation NOT stored — only persisted at completion
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

    # ── All questions answered: extract persona and derive score from it ──
    formatted_conv = format_conversation(conversation)
    logger.info(f"Extracting persona for user_id: {user_id}")

    raw_persona = extract_persona_profile(
        client=client,
        formatted_conv=formatted_conv,
        system_prompt=PERSONA_PROFILE_SYSTEM_PROMPT
    )

    persona_profile = parse_persona_profile(raw_persona or "")

    PERSONA_SCORE = {"beginner": 1, "informed learner": 2, "researcher": 3}
    score = PERSONA_SCORE.get(persona_profile.get("persona", "beginner"), 1)
    logger.info(f"User {user_id} persona: {persona_profile.get('persona')} → score {score}")

    try:
        # Single write to DB — full conversation stored only at completion
        chat_collection.update_one(
            {"user_id": user_id},
            {"$set": {
                "step": step,
                "conversation": conversation,
                "score": score,
                "persona_profile": persona_profile,
                "completed": True
            }}
        )
    except Exception as e:
        logger.error(f"Failed to save final score: {e}")
        return jsonify({"error": f"Failed to save final score: {str(e)}"}), 500

    return jsonify({
        "reply": None,
        "completed": True,
        "step": step,
        "total_steps": len(SEED_QUESTIONS),
        "score": score,
        "persona_profile": persona_profile
    })