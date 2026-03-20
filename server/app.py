import os
from flask import Flask,request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from openai import OpenAI

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# Groq client
client = OpenAI(
    api_key= os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

# MongoDB
mongo_client = MongoClient(os.environ.get("MONGO_URL"))
db = mongo_client[os.environ.get("DB_NAME")]
chat_collection = db["conversation"]


SYSTEM_PROMPT = """
אתה מנתח תשובות של משתמש ומסווג אותו לאחת משתי פרסונות בלבד:

1. חוקר - אם התשובות מעמיקות, אקדמיות, מבוססות מחקר
2. סטודנט - אם התשובות כלליות, לימודיות, או סקרניות

תחזיר תשובה בפורמט JSON בלבד:
{
  "persona": "חוקר" או "סטודנט",
  "reason": "הסבר קצר"
}
"""

QUESTIONS = [
    "מה היית רוצה להבין על טראומה?",
    "מה הביא אותך לכאן היום?",
    "איזה סוג מידע על טראומה הכי מעניין אותך?",
    "עד כמה לעומק תרצה להיכנס בנושא?",
    "איך הכי נוח לך ללמוד על טראומה?"
]


def format_conversation(conversation):
    return "\n".join([
        f"משתמש: {c['answer']}\nמערכת: {c['question']}"
        for c in conversation
    ])


@app.post("/chat")
def chat():
    data = request.json
    user_id = data["user_id"]
    message = data["message"]

    if not user_id or not message:
        return jsonify({"error": "Missing user_id or message"}), 400

    # TODO try 
    session = chat_collection.find_one({"user_id": user_id})

    # New conversation
    if not session:
        try:
            new_session = {
                "user_id": user_id,
                "step": 0,
                "conversation": [],
                "last_question": QUESTIONS[0]
            }

            result = chat_collection.insert_one(new_session)
            if not result.acknowledged or not result.inserted_id:
                return jsonify({"error": "Failed to create new session in MongoDB"}), 500

            return jsonify({
                "reply": "אשאל אותך 5 שאלות \n" + QUESTIONS[0]
            })
        
        except Exception as e:
            return jsonify({"error": f"MongoDB exception: {str(e)}"}), 500
    

    step = session["step"]
    conversation = session["conversation"]
    last_question = session["last_question"]

    conversation.append({
        "question": last_question,
        "answer": message
    })
    step += 1

    
    if step < len(QUESTIONS):
        formatted_conv = format_conversation(conversation)
        last_answer = conversation[-1]["answer"]

        try:
            dynamic_question_response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                temperature=0.8,
                messages=[
                    {
                        "role": "system", 
                        "content": (
                            "אתה מנהל שיחה טבעית ואנושית עם משתמש בנושא טראומה. "
                            "המטרה שלך היא לשאול שאלות בהמשך ישיר למה שהמשתמש כתב, "
                            "כאילו זו שיחה אמיתית ולא שאלון."

                            "חוקים חשובים:"
                            "- התייחס ספציפית לתשובה האחרונה של המשתמש"
                            "- חבר את השאלה לנאמר"
                            "- שאל שאלה אחת בלבד"
                            "- כתוב בצורה זורמת, טבעית, ולא רשמית מדי"
                            "- אל תחזור על הניסוח של השאלה המקורית"
                            "- תרגיש חופשי לשנות ניסוח כדי שזה ירגיש כמו שיחה"
                        )
                    },
                    {
                        "role": "user", 
                        "content": (
                            f"שיחה עד כה:\n{formatted_conv}\n\n"
                            f"תשובה אחרונה של המשתמש:\n{last_answer}\n\n"
                            f"כיוון כללי לשאלה הבאה (לא חובה להיצמד): {QUESTIONS[step]}\n\n"
                            "שאל שאלה המשך טבעית שמתייחסת למה שהמשתמש אמר."
                        )
                    }
                ]
            )

            next_question = dynamic_question_response.choices[0].message.content.strip()

            # Save the current conversation
            try:
                result = chat_collection.update_one(
                    {"user_id": user_id},
                    {"$set": {"step": step, "conversation": conversation, "last_question": next_question}}
                )

                if result.matched_count == 0:
                    return jsonify({"error": "Session not found for update"}), 404
            
            except Exception as e:
                return jsonify({"error": f"MongoDB update failed: {str(e)}"}), 500
            
            return jsonify({"reply": next_question})

        except Exception as e:
            return jsonify({"error": f"AI model request failed {str(e)}"}), 500

    # Persona classification
    formatted_conv = format_conversation(conversation)
    persona_response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"שיחה מלאה: {formatted_conv}"}
        ]
    )

    persona_result = persona_response.choices[0].message.content.strip()
    
    chat_collection.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "step": step,
                "conversation": conversation,
                "persona": persona_result
            }
        }
    )

    return jsonify({"reply": persona_result})


if __name__ == "__main__":
    app.run(port=5500, debug=True)