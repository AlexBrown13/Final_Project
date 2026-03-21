import os
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

mongo_url = os.environ["MONGO_URL"]
if not mongo_url:
    raise ValueError("Missing MONGO_URL environment variable")

mongo_client = MongoClient(
    mongo_url,
    maxPoolSize=50, 
    minPoolSize=5,
    serverSelectionTimeoutMS=5000
)

def get_chat_collection():
    db_name = os.environ.get("DB_NAME")
    if not db_name:
        raise ValueError("Missing DB_NAME environment variable")

    db = mongo_client[db_name]
    return db["conversation"]