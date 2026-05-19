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


# Make sure Ollama is runing
def check_ollama():
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


def ask_ollama(question, history, history_chat):
    PROMPT = f'''
    You are an AI assistant specializing in trauma related education and support.
    
    Each user has a score from 1-3 stroed in the database. your response must match the user's knowledge level,
    communication style, and informational needs based on thier score. 
    
    User score levels:

    Score 1 - General public / beginner:
        - No psychology background
        - Wants to understand what trauma is at a basic level
        - Personal curiosity or emotional motivation
        - Uses simple, non-academic language 

    Score 2 - Informed learner / student:
        - Some familiarity with psychology concepts
        - Interested in both personal stories and some data or research
        - Could be a student, educator, social worker, or engaged layperson
        - Mix of personal and intellectual interest

    Score 3 - Researcher / professional:
        - Strong academic or clinical background
        - Interested in data, studies, statistics, and clinical frameworks
        - Uses professional terminology naturally (PTSD, prevalence, efficacy, etc.)
        - Wants depth: mechanisms, prevalence rates, treatment efficacy, Israel-specific data

    User histroy quiz: {history}
    User AI chat histroy {history_chat}
    User current question: {question}
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

        # If Ollama returns 400 or 500 error, this trigger an exception
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

        if not quiz_history or not assistant_history:
            logger.error("AI-Assistant: quiz or assistant chat not found")
            raise ValueError("quiz or assistant chat not found")
        
        answer = ask_ollama(question, history=quiz_history, history_chat=assistant_history)

        save_conversation_to_db([{"question": question, 'answer': answer}], user_id)
    
    
    except Exception as e:
        logger.error(f"AI-Assistant error {e}")


if __name__ == "__main__":
    main()