import os
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv(dotenv_path='../.env')

mongo_url = os.environ.get("MONGO_URL") #MONGO_ATLAS_URL
db_name = os.environ.get("DB_NAME") #DB_ATLAS_NAME

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
users_collection = db["users"]
calls_collection = db['calls']
trends_collection = db["trends"]