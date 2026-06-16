from pathlib import Path
import sys
import requests 
from pymongo import UpdateOne

# Finds the project folder path dynamically
project_root = str(Path(__file__).resolve().parents[1])
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from services.mongo import ai_assistant_collection, chat_collection
from utils.logger import logger


# Ollama local server
OLLAMA_URL  = "http://localhost:11434"        
# Model to use
MODEL = "llama3" 


_ollama_checked_at = 0.0
_OLLAMA_CHECK_TTL = 60  # re-check at most once per minute

def check_ollama():
    import time
    global _ollama_checked_at
    if time.monotonic() - _ollama_checked_at < _OLLAMA_CHECK_TTL:
        return
    try:
        res = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if res.status_code == 200:
            models = [m['name'] for m in res.json().get("models", [])]
            logger.info(f"Ollama is runing. Available models {models}")
            if not any(MODEL in m for m in models):
                logger.warning(f"Model not found")
                sys.exit(2)
        else:
            logger.error("Connection to Ollama failed")
            raise ConnectionError()
    except Exception:
        logger.error(f"Ollma is not running or not reachable at {OLLAMA_URL}")
        sys.exit(2)
    _ollama_checked_at = time.monotonic()


def ask_ollama(question, persona_profile, history_chat):
    persona = persona_profile.get("persona", "beginner")
    interest_tags = persona_profile.get("interest_tags", [])
    preferred_content = persona_profile.get("preferred_content", "")
    primary_topic = persona_profile.get("primary_topic", "")

    tags_str = ", ".join(interest_tags) if interest_tags else "general trauma topics"

    if persona == "researcher":
        level_instruction = (
            "Use academic and clinical language. Lead with data, mechanisms, and research findings. "
            "Cite specific statistics, prevalence rates, or clinical frameworks where relevant. "
            "Assume the user has professional literacy — do not over-explain basic concepts."
        )
    elif persona == "informed learner":
        level_instruction = (
            "Balance accessible explanations with references to research and real-world data. "
            "Use some professional terms but always explain them briefly. "
            "Mix human stories with factual context."
        )
    else:
        level_instruction = (
            "Use simple, warm, non-academic language. Avoid clinical jargon entirely. "
            "Focus on relatable explanations, personal stories, and practical support. "
            "Be compassionate — this user may have a personal connection to the topic."
        )

    topic_line = f"The user's primary focus is: {primary_topic}." if primary_topic else ""
    content_line = f"They prefer: {preferred_content}." if preferred_content else ""

    PROMPT = f'''You are an AI assistant specializing in trauma-related education and support in Israel.

User profile:
- Knowledge level: {persona}
- Interests: {tags_str}
{topic_line}
{content_line}

How to respond:
{level_instruction}
Connect your answer to the user's specific interests and primary focus wherever relevant.
Keep your response focused and useful — do not pad with unnecessary reassurances or disclaimers.

Previous conversation:
{history_chat}

User question: {question}
'''

    try:
        payload = {
            "model": 'llama3.1',
            "prompt": PROMPT,
            "stream": False
        }

        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json=payload
        )

        response.raise_for_status()
        return response.json().get('response', "").strip()

    except Exception as e:
        logger.error(f"Error communication with Ollama {e}")


def save_conversation_to_db(convs, user_id):
    try:

        messages = []
        
        for conv in convs:
           
            messages.append(
                UpdateOne(
                    {"user_id": user_id},
                    {
                        "$push": {
                            "conversations": conv
                        }
                    },
                    upsert=True,
                )
            )
        
        if messages:
            response = ai_assistant_collection.bulk_write(messages)
            logger.info(f"Upserted: {response.upserted_count}, Modified: {response.modified_count}")

    except Exception:
        logger.error("AI-Assistant: error saving data to database")


def main(user_id=None, question=None):
    try:
        check_ollama()

        quiz_history = chat_collection.find_one({"user_id": user_id})
        assistant_history = ai_assistant_collection.find_one({"user_id": user_id})

        if not quiz_history:
            logger.error("AI-Assistant: quiz history not found")
            raise ValueError("quiz history not found")

        persona_profile = quiz_history.get("persona_profile") or {}

        # Format the last 6 assistant exchanges as readable context
        prev_conversations = ""
        if assistant_history and assistant_history.get("conversations"):
            recent = assistant_history["conversations"][-6:]
            prev_conversations = "\n".join([
                f"User: {c.get('question', '')}\nAssistant: {c.get('answer', '')}"
                for c in recent
            ])

        answer = ask_ollama(question, persona_profile=persona_profile, history_chat=prev_conversations)

        save_conversation_to_db([{"question": question, 'answer': answer}], user_id)
    
    
    except Exception as e:
        logger.error(f"AI-Assistant error {e}")


if __name__ == "__main__":
    main()