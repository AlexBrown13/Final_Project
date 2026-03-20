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

@app.post("/chat/openai")
def chat():
    data = request.json
    user_id = data["user_id"]
    message = data["message"]

    if not user_id or not message:
        return jsonify({"error": "Missing user_id or message"}), 400

    session = chat_collection.find_one({"user_id": user_id})

    # New conversation
    if not session:
        chat_collection.insert_one({
            "user_id": user_id,
            "step": 0,
            "answers": []
        })

        return jsonify({
            "reply": "אשאל אותך 5 שאלות \n" + QUESTIONS[0]
        })
    
    step = session["step"]
    answers = session["answers"]
    answers.append(message)
    step += 1

    chat_collection.update_one(
        {"user_id": user_id},
        {"$set": {"step": step, "answers": answers}}
    )

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "I want deep research about trauma"}
        ]
    )

    print(response.choices[0].message.content)

    return jsonify({"reply": response.choices[0].message.content})


if __name__ == "__main__":
    app.run(port=5500, debug=True)