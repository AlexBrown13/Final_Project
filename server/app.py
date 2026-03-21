import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# MongoDB
mongo_client = MongoClient(os.environ.get("MONGO_URL"))
db = mongo_client[os.environ.get("DB_NAME")]
chat_collection = db["conversation"]


# ──────────────────────────────────────────────
# PROMPTS
# ──────────────────────────────────────────────

SCORING_SYSTEM_PROMPT = """
You are analyzing a conversation between a user and a system about trauma in Israel.
Your job is to assign the user a score from 1 to 3 based on their responses.

Score 1 — General public / beginner:
- No psychology background
- Wants to understand what trauma is at a basic level
- Personal curiosity or emotional motivation
- Uses simple, non-academic language
- Examples: "I went through something hard and want to understand it",
  "I heard about trauma and want to know more"

Score 2 — Informed learner / student:
- Some familiarity with psychology concepts
- Interested in both personal stories and some data or research
- Could be a student, educator, social worker, or engaged layperson
- Mix of personal and intellectual interest
- Examples: "I study psychology and want to understand trauma more deeply",
  "I work with people and want to learn how trauma affects them"

Score 3 — Researcher / professional:
- Strong academic or clinical background
- Interested in data, studies, statistics, and clinical frameworks
- Uses professional terminology naturally (PTSD, prevalence, efficacy, etc.)
- Wants depth: mechanisms, prevalence rates, treatment efficacy, Israel-specific data
- Examples: "I'm researching PTSD rates post-October 7 and need peer-reviewed data",
  "I'm a clinical psychologist looking for epidemiological statistics"

Rules:
- Base your score ONLY on the content and tone of the user's answers
- If the user is vague or unclear, default to score 1
- Return ONLY valid JSON — no extra text, no markdown fences, no explanation outside the JSON

Required format:
{
  "score": 1,
  "reason": "Short explanation in the same language the user used in the conversation"
}
"""

DYNAMIC_QUESTION_SYSTEM_PROMPT = """
You are conducting a warm, natural conversation with a user to understand their level of
knowledge and interest in the topic of trauma in Israel.

Your goal is to ask follow-up questions that flow naturally from what the user just said,
in order to discover:
- How familiar they are with psychology concepts
- How interested they are in data, statistics, and research
- Whether their interest is personal, academic, or professional

Rules:
- Always respond in the SAME LANGUAGE the user is writing in (Hebrew or English)
- Reference specifically what the user just said — make it feel personal and attentive
- Ask exactly ONE question per response
- Keep a warm, curious, conversational tone — not too formal
- Ask questions that help you evaluate the user on a scale of 1 (beginner) to 3 (researcher)
- Do NOT repeat the phrasing of any previous question
- Do NOT use bullet points, numbered lists, or headers
- Write as if you are a knowledgeable friend having a real conversation
"""

# Seed questions — used as loose directional guidance for the AI, never asked verbatim
SEED_QUESTIONS = [
    "What brought you here today? What do you want to know about trauma?",
    "How interested are you in data or research about trauma in Israel?",
    "Do you have any background in psychology or related fields?",
    "How do you prefer to learn: through stories, facts, research, or statistics?",
    "How important is it to you to understand the deeper impact trauma has on people?"
]


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
    except (json.JSONDecodeError, ValueError, TypeError):
        return {
            "score": 1,
            "reason": "Could not parse scoring response — defaulting to score 1"
        }


# ──────────────────────────────────────────────
# ROUTES
# ──────────────────────────────────────────────

@app.post("/chat")
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

    session = chat_collection.find_one({"user_id": user_id})

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
        except Exception as e:
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

        try:
            dynamic_response = client.chat.completions.create(
                model="llama-3.1-8b-instant",   # fast model for conversational questions
                temperature=0.75,
                max_tokens=200,
                messages=[
                    {
                        "role": "system",
                        "content": DYNAMIC_QUESTION_SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Conversation so far:\n{formatted_conv}\n\n"
                            f"User's last answer:\n{message}\n\n"
                            f"General direction for the next question "
                            f"(do not copy verbatim): {SEED_QUESTIONS[step]}\n\n"
                            "Ask one natural follow-up question that references what "
                            "the user just said and helps evaluate their knowledge level."
                        )
                    }
                ]
            )
            next_question = dynamic_response.choices[0].message.content.strip()

        except Exception:
            # Fallback to seed question — quiz never breaks even if AI call fails
            next_question = SEED_QUESTIONS[step]

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
            return jsonify({"error": f"MongoDB update failed: {str(e)}"}), 500

        return jsonify({
            "reply": next_question,
            "step": step,
            "total_steps": len(SEED_QUESTIONS),
            "completed": False
        })

    # ── All questions answered: score the user ──
    formatted_conv = format_conversation(conversation)

    try:
        score_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",   # stronger model for the critical scoring step
            temperature=0.2,                    # low temp = consistent, reliable scoring
            max_tokens=200,
            messages=[
                {"role": "system", "content": SCORING_SYSTEM_PROMPT},
                {"role": "user", "content": f"Full conversation:\n{formatted_conv}"}
            ]
        )
        raw_result = score_response.choices[0].message.content.strip()
        score_data = parse_score_response(raw_result)

    except Exception as e:
        # Save session with fallback score — never lose the user's answers
        score_data = {
            "score": 1,
            "reason": f"Scoring failed, defaulting to score 1. Error: {str(e)}"
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
    except Exception as e:
        return jsonify({"error": f"Failed to save final score: {str(e)}"}), 500

    return jsonify({
        "reply": None,
        "completed": True,
        "step": step,
        "total_steps": len(SEED_QUESTIONS),
        "score": score_data["score"],
        "score_reason": score_data["reason"]
    })


@app.get("/result/<user_id>")
def get_result(user_id: str):
    """
    Fetch the final score for a completed session.
    Lets the frontend recover the score after a page refresh without re-running the quiz.
    """
    try:
        session = chat_collection.find_one({"user_id": user_id})
    except Exception as e:
        return jsonify({"error": f"MongoDB error: {str(e)}"}), 500

    if not session:
        return jsonify({"error": "Session not found"}), 404

    if not session.get("completed"):
        return jsonify({"error": "Quiz not yet completed", "completed": False}), 400

    return jsonify({
        "user_id": user_id,
        "score": session["score"],
        "score_reason": session.get("score_reason", ""),
        "completed": True
    })


@app.delete("/session/<user_id>")
def delete_session(user_id: str):
    """
    Delete a session so the user can retake the quiz.
    Useful during development and for a 'retake' button on the frontend.
    """
    try:
        result = chat_collection.delete_one({"user_id": user_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Session not found"}), 404
        return jsonify({"message": "Session deleted successfully"})
    except Exception as e:
        return jsonify({"error": f"MongoDB error: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(port=5500, debug=True)