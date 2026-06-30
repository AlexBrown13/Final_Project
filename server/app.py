import os
import threading
from dotenv import load_dotenv

load_dotenv()

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.map_route import map_bp
from routes.auth_route import auth_bp
from routes.chat_route import chat_bp
from routes.chat_score_route import chat_score
from routes.delete_session import delete_session
from routes.keep_alive import keep_alive
from routes.graphs_route import graphs_bp
from routes.trends_route import trends_bp
from routes.articles_route import articles_bp
from routes.ai_assistant_route import ai_assistant_bp
from routes.external_content_route import external_content_bp

from jwt_blocklist import is_jti_revoked
from extensions import limiter

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET_KEY')

jwt = JWTManager(app)
limiter.init_app(app)

@jwt.token_in_blocklist_loader
def check_if_token_revoked(_jwt_header, jwt_payload):
    return is_jti_revoked(jwt_payload.get("jti"))


CORS(app)


app.register_blueprint(map_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(chat_bp, url_prefix="/chat")
app.register_blueprint(chat_score, url_prefix="/result")
app.register_blueprint(delete_session, url_prefix="/session")
app.register_blueprint(keep_alive, url_prefix="/health")
app.register_blueprint(graphs_bp, url_prefix="/graphs")
app.register_blueprint(trends_bp, url_prefix="/api")
app.register_blueprint(articles_bp, url_prefix="/api")
app.register_blueprint(ai_assistant_bp, url_prefix='/api')
app.register_blueprint(external_content_bp, url_prefix="/api")


# Warm the embedding model in the background so the server starts accepting
# requests immediately and no single user eats the ~30s cold model load on the
# first article ingestion after a restart.
def _warm_embedding_model():
    from services.ranker import warm_model
    warm_model()

threading.Thread(target=_warm_embedding_model, daemon=True).start()


if __name__ == "__main__":
    app.run(port=5500, debug=True)
