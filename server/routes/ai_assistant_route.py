import time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.ai_assistant import main
from services.groq import client_groq
from services.mongo import articles_collection, chat_collection
from utils.logger import logger
from extensions import limiter

# Simple per-user article cache: {user_id: (fetched_at, articles_list)}
_articles_cache: dict = {}
_ARTICLES_CACHE_TTL = 5 * 60  # seconds


ai_assistant_bp = Blueprint("ai_assistant", __name__)

# Static, token-cheap awareness of the rest of the platform so the assistant can
# point users to other sections when relevant. This is NOT a data source — the
# assistant must not invent figures from these pages; for specifics it defers to
# the user's articles or tells them to open the page.
PLATFORM_OVERVIEW = (
    "About this platform — you may direct the user to these other sections when it helps:\n"
    "- Articles (/articles): the user's personalized academic reading list (the articles below).\n"
    "- Interactive Map (/map): crisis-hotline (ERAN/NATAL) call patterns across Israeli cities over time.\n"
    "- Trends (/trends): Google Trends data for trauma-related searches in Israel.\n"
    "- Data Graphs (/graphs/israel, /graphs/addictions, /graphs/health, /graphs/sleep, "
    "/graphs/traffic, /graphs/domestic-violence): curated charts on mental health, addictions, "
    "sleep, traffic accidents, and domestic violence, sourced from the State Comptroller Report, "
    "Ministry of Health, and peer-reviewed literature."
)


@ai_assistant_bp.route('/ai/assistant', methods=['POST'])
@jwt_required()
def ai_assistant():
    try:

        user_id = get_jwt_identity()

        if not user_id:
            logger.error("AI-Assistant invalid user identify")
            return jsonify({"error": "Invalid user identity"}), 400

        # Extract user message from request body (guard against missing/!JSON body)
        body = request.get_json(silent=True) or {}
        message = (body.get("message") or "").strip()
        if not message:
            return jsonify({"error": "Message is required"}), 400

        # AI assistant service
        main(user_id, question=message)

        return jsonify({"status": "success"}), 200

    except Exception as e:
        logger.error(f"AI-Assistant error: {e}")
        return jsonify({"error": "Assistant unavailable."}), 500


@ai_assistant_bp.route('/article-chat', methods=['POST'])
@jwt_required()
@limiter.limit("40 per hour")
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

        # Resolve the id the articles are actually stored under. Articles may be
        # keyed by the auth identity OR by the quiz-session UUID (guest-ingested
        # sets). Mirror the persona fallback below: prefer auth user_id, but if it
        # has no articles, fall back to quiz_user_id so the RAG context isn't empty.
        quiz_user_id = body.get("quiz_user_id")
        articles_user_id = user_id
        if not articles_collection.find_one({"user_id": user_id}, {"_id": 1}):
            if quiz_user_id and quiz_user_id != user_id and \
                    articles_collection.find_one({"user_id": quiz_user_id}, {"_id": 1}):
                articles_user_id = quiz_user_id

        # Fetch the stored articles (cached for 5 min to avoid a DB round-trip on
        # every chat message within a session). Cache keyed by the effective id.
        cached = _articles_cache.get(articles_user_id)
        if cached and time.monotonic() - cached[0] < _ARTICLES_CACHE_TTL:
            articles = cached[1]
        else:
            cursor = articles_collection.find(
                {"user_id": articles_user_id},
                {"title": 1, "abstract": 1, "year": 1, "authors": 1, "_id": 0}
            )
            articles = list(cursor)
            _articles_cache[articles_user_id] = (time.monotonic(), articles)

        # Fetch persona for tone calibration.
        # Primary: look up by the authenticated JWT identity (secure, no IDOR).
        # Fallback: use quiz_user_id from body for sessions stored under a
        # separate quiz-session UUID (current data model).
        persona = "informed learner"
        session = chat_collection.find_one({"user_id": user_id}, {"persona_profile": 1})
        if not session and quiz_user_id and quiz_user_id != user_id:
            session = chat_collection.find_one({"user_id": quiz_user_id}, {"persona_profile": 1})
        profile = (session.get("persona_profile") or {}) if session else {}
        persona = profile.get("persona", "informed learner")
        emotional_state = profile.get("emotional_state", "curious")
        content_preference = profile.get("content_preference", "mixed")
        primary_topic = profile.get("primary_topic", "")
        interest_tags = profile.get("interest_tags", [])

        # Build articles context block
        if articles:
            articles_context = "\n\n".join([
                f"[{i+1}] {a.get('title') or 'Untitled'} ({a.get('year') or 'n/a'})\n{(a.get('abstract') or 'No abstract.')[:400]}"
                for i, a in enumerate(articles)
            ])
        else:
            articles_context = "No articles available."

        # Emotional guidance based on emotional_state
        EMOTIONAL_GUIDANCE = {
            "grieving": "This user may be processing personal loss. Be gentle and warm. Validate their emotional experience before presenting facts. Do not lead with statistics or clinical language. If they seem overwhelmed, it is appropriate to mention ERAN 1201 (crisis support line).",
            "distressed": "This user may be struggling. Keep responses short, clear, and warm. Avoid overwhelming them with information. If crisis language appears, mention ERAN 1201.",
            "curious": "This user is exploring intellectually. Be engaging, thorough, and willing to go deep on topics they ask about.",
            "professional": "This user works with trauma survivors professionally. Focus on practical clinical frameworks, intervention strategies, and citable findings they can use with clients. Be direct and information-dense.",
            "neutral": "This user has not expressed strong emotional signals. Be informative, clear, and balanced. Match their tone.",
        }
        emotional_guidance = EMOTIONAL_GUIDANCE.get(emotional_state, EMOTIONAL_GUIDANCE["neutral"])

        # Tone instruction based on persona AND emotional_state together
        if persona == "researcher":
            if emotional_state in ("grieving", "distressed"):
                tone = "Be precise but compassionate. This researcher may have a personal connection to the topic."
            else:  # professional / curious / neutral (and any other)
                tone = "Use academic language. Be precise and data-focused. Reference specific articles by number."
        elif persona == "beginner":
            if emotional_state in ("grieving", "distressed"):
                tone = "Use very simple, warm language. No jargon at all. Lead with empathy before information."
            elif emotional_state == "curious":
                tone = "Use simple, friendly language. Explain concepts clearly. Make it accessible and engaging."
            else:  # neutral (and any other)
                tone = "Use simple, clear language. Be welcoming and informative without being clinical."
        else:  # "informed learner" + any (also the safe fallback for unknown personas)
            tone = "Balance accessibility with depth. Reference articles when relevant. Match the user's tone."

        # Build message list: system carries static context, history is structured
        # properly, current question is the final user turn.
        system_content = (
            f"You are an assistant helping a user explore academic articles about trauma in Israel.\n\n"
            f"User profile:\n"
            f"- Persona: {persona}\n"
            f"- Emotional state: {emotional_state}\n"
            f"- Main topic of interest: {primary_topic}\n"
            f"- Also interested in: {', '.join(interest_tags)}\n"
            f"- Content preference: {content_preference}\n\n"
            f"Tone: {tone}\n"
            f"Emotional guidance: {emotional_guidance}\n\n"
            f"{PLATFORM_OVERVIEW}\n\n"
            f"Ground factual answers in the articles below. You may briefly point the user to one "
            f"of the platform sections above when it fits their question, but do not invent data "
            f"from those sections. If a question is unrelated to trauma or this platform, say so "
            f"briefly.\n\n"
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