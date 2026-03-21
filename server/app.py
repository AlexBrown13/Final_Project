from flask import Flask
from flask_cors import CORS
from routes.chat_route import chat_bp, delete_session
from routes.chat_score_route import chat_score
from routes.keep_alive import keep_alive
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(chat_bp, url_prefix="/chat")
app.register_blueprint(chat_score, url_prefix="/result")
app.register_blueprint(delete_session, url_prefix="/session")
app.register_blueprint(keep_alive, url_prefix="/health")

if __name__ == "__main__":
    app.run(port=5500, debug=True)
