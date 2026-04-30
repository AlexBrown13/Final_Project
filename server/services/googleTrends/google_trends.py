import time
import datetime
import pandas as pd
import logging
import logging.handlers

import os
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

from pytrends.request import TrendReq
#from mongo import trends_collection
from pymongo import UpdateOne
from pytrends.exceptions import TooManyRequestsError

logger = logging.getLogger("google_trends")
logger.setLevel(logging.INFO)

LOG_FILE = "status.log"

file_handler = logging.handlers.RotatingFileHandler(
    LOG_FILE,
    maxBytes=1024 * 1024, 
    backupCount=3,
    encoding="utf8",
)

formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

file_handler.setFormatter(formatter)

if not logger.handlers:
    logger.addHandler(file_handler)


# Temp connect to database
mongo_url = os.environ["MONGO_URL"]
db_name = os.environ.get("DB_NAME")
mongo_client = MongoClient(
    mongo_url,
    maxPoolSize=50, 
    minPoolSize=5,
    serverSelectionTimeoutMS=5000
)
db = mongo_client[db_name]
trends_collection = db["trends"]


def main():
    logger.info("Trnds job started")

    # index_keywords_HE = ['טראומה', 'לחץ נפשי', 'חשש', 'חרדה',]
    # index_keywords_EN = ['Trauma', 'Stress','Fear','Panic_Disorder']

    # groups = {
    #     "Trauma_Index": ["טראומה",], # ["טראומה" ,"פוסט טראומה", "PTSD"]
    #     "Anxiety_Index": ["חרדה",],  # ["חרדה", "לחץ נפשי", "דאגה"]
    #     "Fear_Index": ["חשש",]       # ["חשש", "פחד", "אזעקות"] 
    # }

    groups = {
        "Trauma_Index": ["טראומה", "PTSD"],
    }

    try:
        pytrends = TrendReq(hl='en-US', tz=180)
        final_df = pd.DataFrame()
        
        for index, (group_name, kw_list) in enumerate(groups.items()):
            logger.info(f"Processing group: {group_name}")
            print(f"Fetching {group_name}...")

            pytrends.build_payload(
                kw_list=kw_list,
                cat=0,
                timeframe='today 1-m', # now 7-d | today 1-m | today 12-m | today 5-y
                geo='IL',
                gprop=''
            )
            
            df = pytrends.interest_over_time().reset_index()

            if 'isPartial' in df.columns:
                df.drop(columns=['isPartial'], inplace=True)

            # average group score
            df[group_name] = df[kw_list].mean(axis=1)

            # first group keeps date column
            if final_df.empty:
                final_df["date"] = df["date"]

            final_df[group_name] = df[group_name]

            # avoid 429 error
            if index < len(groups)-1:
                time.sleep(60)

        logger.info("fetched data successfully ")
        return final_df
        
    except TooManyRequestsError as e:
        logger.error(f"{group_name}: Google returned 429 (rate limited)")
        print(f"Error in Google trends: {e}")
        exit()

    except Exception as e:
        logger.exception(f"Unexpected error in {group_name}: {e}")


def update_database(df_new):
    try:
        logger.info(f"mongo_url: {mongo_url}")
        logger.info(f"db_name: {db_name}")
        logger.info(f"trends_collection: {trends_collection}")

        records = df_new.to_dict(orient="records")

        # check if collection is empty
        if trends_collection.count_documents({}) == 0:
            # create unique index after initial insert
            trends_collection.create_index("date", unique=True)
            response = trends_collection.insert_many(records)

            if response.acknowledged:
                logger.info("Initial data inserted into database successfully")
                print("Initial data inserted successfully")
            else:
                logger.error("Failed to insert initial data into database")
                print("Failed to insert initial data")

        else:
            operations = []
            for row in records:
                operations.append(
                    UpdateOne(
                        {"date": row["date"]},   # find by date
                        {"$set": row},           # update fields
                        upsert=True
                    )
                )

            if operations:
                trends_collection.bulk_write(operations)
                logger.info("Existing data updated successfully in the database")
                print("Existing data updated successfully")
       
    except Exception as e:
        logger.error("Error saving data to MongoDB")
        print(f"Error saving data to MongoDB {e}")
        exit()


if __name__ == "__main__":
    df_new = main()
    update_database(df_new)