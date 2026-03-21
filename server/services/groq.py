import os
from groq import Groq
from dotenv import load_dotenv
from utils.logger import logger

load_dotenv()

# ──────────────────────────────────────────────
# GROQ CLIENT
# ──────────────────────────────────────────────

def client_groq():
    api_key = os.environ["GROQ_API_KEY"]
    if not api_key:
        raise ValueError("Missing api_key")
    return Groq(api_key=api_key)


# ──────────────────────────────────────────────
# DYNAMIC QUESTION GENERATOR
# ──────────────────────────────────────────────

def generate_dynamic_question(
    client,
    step: int,
    formatted_conv: str,
    message: str,
    seed_question: str,
    system_prompt: str
) -> str | None:
    """
    Generates an adaptive follow-up question using Groq.
    Returns the question string or None if the API call fails.
    """
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # fast model for conversational questions
            temperature=0.75,
            max_tokens=200,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": (
                        f"Conversation so far:\n{formatted_conv}\n\n"
                        f"User's last answer:\n{message}\n\n"
                        f"General direction for the next question "
                        f"(do not copy verbatim): {seed_question[step]}\n\n"
                        "Ask one natural follow-up question that references what "
                        "the user just said and helps evaluate their knowledge level."
                    )
                }
            ]
        )

        next_q = response.choices[0].message.content.strip()
        logger.info("Generated dynamic question successfully")
        return next_q

    except Exception as e:
        logger.warning(f"Dynamic question generation failed: {e}")
        return seed_question[step]

    
# ──────────────────────────────────────────────
# SCORING FUNCTION
# ──────────────────────────────────────────────

def score_user_conversation(client, formatted_conv: str, system_prompt: str):
    """
    Sends the conversation to Groq to generate a JSON scoring result.
    Returns raw model content (string) OR None on failure.
    """
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=200,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Full conversation:\n{formatted_conv}"}
            ]
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        logger.error(f"Scoring call failed: {e}")
        return None
