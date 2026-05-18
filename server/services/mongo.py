import os
from pymongo import MongoClient
from dotenv import load_dotenv, find_dotenv
from pymongo.errors import ConnectionFailure
load_dotenv(dotenv_path=find_dotenv())
from utils.logger import logger

mongo_url = os.environ.get("MONGO_ATLAS_URL") 
db_name = os.environ.get("DB_ATLAS_NAME") 

if not mongo_url:
    logger.error("Initialization failed: Missing MONGO_ATLAS_URL environment variable.")
    raise ValueError("Missing MONGO_ATLAS_URL environment variable")
if not db_name:
    logger.error("Initialization failed: Missing DB_ATLAS_NAME environment variable.")
    raise ValueError("Missing DB_ATLAS_NAME environment variable")

try:
    mongo_client = MongoClient(
        mongo_url,
        maxPoolSize=os.environ.get("MAX_POOL_SIZE"), 
        minPoolSize=os.environ.get("MIN_POOL_SIZE"),
        serverSelectionTimeoutMS=os.environ.get("MONGO_TIMEOUT")
    )

    # Test the connection
    mongo_client.admin.command('ping')
    logger.info("MongoDB Atlas: connection established successfully.")
    
except ValueError as type_err:
    logger.error("MongoDB Atlas: configuration pool sizes or timeout variables")
    pass
except ConnectionFailure:
    logger.error(f"MongoDB Atlas: server not available")
except Exception as e:
    logger.error(f"MongoDB Atlas: connection failed {e}")


db = mongo_client[db_name]

chat_collection = db["conversation"]

try:
    chat_collection.create_index("user_id", unique=True)
    chat_collection.create_index("completed")
except Exception as e:
    logger.warning(f"Failed to create chat collection indexes: {e}")

users_collection = db["users"]
calls_collection = db['calls']
trends_collection = db["trends"]
articles_collection = db["articles"]
token_blocklist_collection = db["token_blocklist"]
ai_assistant_collection = db["ai_assistant"]

try:
    # Auto-expire revoked JTIs after 1 day
    token_blocklist_collection.create_index("revoked_at", expireAfterSeconds=86400)
    token_blocklist_collection.create_index("jti", unique=True)
except Exception as e:
    logger.warning(f"Failed to create token_blocklist indexes: {e}")