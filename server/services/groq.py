import os
from groq import Groq
from utils.logger import logger

# ──────────────────────────────────────────────
# GROQ CLIENT — singleton, one connection pool per process
# ──────────────────────────────────────────────

def client_groq():
    return _groq_client

_groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])


# ──────────────────────────────────────────────
# DYNAMIC QUESTION GENERATOR
# ──────────────────────────────────────────────

def generate_dynamic_question(
    client,
    step: int,
    formatted_conv: str,
    message: str,
    seed_question: list,
    system_prompt: str
) -> str | None:
    """
    Generates an adaptive follow-up question using Groq.
    Returns the question string or None if the API call fails.
    """
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=300,
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
            max_tokens=300,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Full conversation:\n{formatted_conv}"}
            ]
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        logger.error(f"Scoring call failed: {e}")
        return None


def extract_persona_profile(client, formatted_conv: str, system_prompt: str):
    """
    Sends the final conversation to Groq and asks for a persona and interest profile.
    Returns the raw JSON string or None on failure.
    """
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=450,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Full conversation:\n{formatted_conv}"}
            ]
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        logger.error(f"Persona extraction failed: {e}")
        return None
