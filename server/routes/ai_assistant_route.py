import time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.ai_assistant import main
from services.groq import client_groq
from services.mongo import articles_collection, chat_collection
from utils.logger import logger

# Simple per-user article cache: {user_id: (fetched_at, articles_list)}
_articles_cache: dict = {}
_ARTICLES_CACHE_TTL = 5 * 60  # seconds


ai_assistant_bp = Blueprint("ai_assistant", __name__)


@ai_assistant_bp.route('/ai/assistant', methods=['POST'])
@jwt_required()
def ai_assistant():
    try:

        user_id = get_jwt_identity()

        if not user_id:
            logger.error("AI-Assistant invalid user identify")
            return jsonify({"error": "Invalid user identity"}), 400

        # Extract user message from request body
        message = request.get_json().get("message")

        # AI assistant service
        main(user_id, question=message)

        return jsonify({"status": "success"}), 200

    except Exception as e:
        logger.error(f"AI-Assistant error: {e}")
        return jsonify({"error": "Assistant unavailable."}), 500


@ai_assistant_bp.route('/article-chat', methods=['POST'])
@jwt_required()
def article_chat():
    try:
        user_id = get_jwt_identity()
        body = request.get_json(silent=True) or {}
        question = (body.get("question") or "").strip()
        history = body.get("history") or []

        if not question:
            return jsonify({"error": "Question is required"}), 400
        if len(question) > 1000:
            return jsonify({"error": "Question too long"}), 400

        # Fetch the user's stored articles (cached for 5 min to avoid a DB
        # round-trip on every chat message within a session)
        cached = _articles_cache.get(user_id)
        if cached and time.monotonic() - cached[0] < _ARTICLES_CACHE_TTL:
            articles = cached[1]
        else:
            cursor = articles_collection.find(
                {"user_id": user_id},
                {"title": 1, "abstract": 1, "year": 1, "authors": 1, "_id": 0}
            )
            articles = list(cursor)
            _articles_cache[user_id] = (time.monotonic(), articles)

        # Fetch persona for tone calibration.
        # Primary: look up by the authenticated JWT identity (secure, no IDOR).
        # Fallback: use quiz_user_id from body for sessions stored under a
        # separate quiz-session UUID (current data model).
        persona = "informed learner"
        session = chat_collection.find_one({"user_id": user_id}, {"persona_profile": 1})
        if not session:
            quiz_user_id = body.get("quiz_user_id")
            if quiz_user_id and quiz_user_id != user_id:
                session = chat_collection.find_one({"user_id": quiz_user_id}, {"persona_profile": 1})
        if session:
            persona = (session.get("persona_profile") or {}).get("persona", "informed learner")

        # Build articles context block
        if articles:
            articles_context = "\n\n".join([
                f"[{i+1}] {a.get('title') or 'Untitled'} ({a.get('year') or 'n/a'})\n{(a.get('abstract') or 'No abstract.')[:400]}"
                for i, a in enumerate(articles)
            ])
        else:
            articles_context = "No articles available."

        # Tone instruction based on persona
        if persona == "researcher":
            tone = "Use academic language. Be precise and data-focused. Reference specific articles by number."
        elif persona == "beginner":
            tone = "Use simple, warm language. Avoid jargon. Explain concepts clearly and gently."
        else:
            tone = "Balance accessibility with depth. Reference specific articles when relevant."

        # Build message list: system carries static context, history is structured
        # properly, current question is the final user turn.
        system_content = (
            f"You are an assistant helping a user understand their personalised set of "
            f"academic articles about trauma in Israel.\n\n"
            f"How to respond: {tone}\n"
            f"Answer only based on the articles below. If the question is unrelated, say so briefly.\n\n"
            f"Articles:\n{articles_context}"
        )

        messages = [{"role": "system", "content": system_content}]
        for m in history[-4:]:
            role = m.get("role") if m.get("role") in ("user", "assistant") else "user"
            messages.append({"role": role, "content": str(m.get("content") or "")})
        messages.append({"role": "user", "content": question})

        client = client_groq()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_tokens=800,
            messages=messages,
        )
        choices = response.choices or []
        if not choices or choices[0].message.content is None:
            return jsonify({"error": "The assistant returned an empty response. Please try again."}), 503
        answer = choices[0].message.content.strip()

        return jsonify({"answer": answer}), 200

    except Exception as e:
        logger.error(f"article-chat error: {e}")
        return jsonify({"error": "Assistant unavailable."}), 500