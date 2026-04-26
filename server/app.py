import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from routes.map_route import map_bp
from routes.auth_route import auth_bp
from routes.chat_route import chat_bp
from routes.chat_score_route import chat_score
from routes.delete_session import delete_session
from routes.keep_alive import keep_alive
from routes.graphs_route import graphs_bp
from routes.trends_route import trends_bp
from jwt_blocklist import is_jti_revoked

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET_KEY')

jwt = JWTManager(app)

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

if __name__ == "__main__":
    app.run(port=5500, debug=True)
