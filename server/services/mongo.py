import os
from pymongo import MongoClient
from utils.logger import logger

mongo_url = os.environ.get("MONGO_ATLAS_URL") 
db_name = os.environ.get("DB_ATLAS_NAME") 

if not mongo_url:
    raise ValueError("Missing MONGO_URL environment variable")
if not db_name:
    raise ValueError("Missing DB_NAME environment variable")

mongo_client = MongoClient(
    mongo_url,
    maxPoolSize=50, 
    minPoolSize=5,
    serverSelectionTimeoutMS=5000
)

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