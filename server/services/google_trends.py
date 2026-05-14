from pathlib import Path
import sys

# Finds the project folder path dynamically
project_root = str(Path(__file__).resolve().parents[1])

if project_root not in sys.path:
    sys.path.insert(0, project_root)

import time
from pathlib import Path
import pandas as pd
from pytrends.request import TrendReq
from pymongo import UpdateOne
from pytrends.exceptions import TooManyRequestsError

from utils.logger import logger
from mongo import trends_collection

# Constant parameters
GROUPS = {
    "Trauma_Index": ["טראומה",], # ["טראומה" ,"פוסט טראומה", "PTSD"]
    #"Anxiety_Index": ["חרדה",],  # ["חרדה", "לחץ נפשי", "דאגה"]
    #"Fear_Index": ["חשש",]       # ["חשש", "פחד", "אזעקות"] 
}


#===================
# MAIN
#===================

def main():

    try:
        df_trend = fetch_google_trends()
        logger.info("fetched data successfully ")

        update_database(df_trend)
        logger.info("Trends job completed successfully.")
    
    except Exception as e:
        logger.error("Job failure in main automation script")


#============================================================
# Fetch Data From Google Trends
# calls the pytrends API to retrive search trends using GROUPS parameter
# Output: DataFrame containing the date and the index fields
#============================================================

def fetch_google_trends():
    try:
        # Initializing pytrends connection
        pytrends = TrendReq(hl='en-US', tz=180)
        df = pd.DataFrame()
        
        for index, (group_name, kw_list) in enumerate(GROUPS.items()):
            logger.info(f"Processing group: {group_name}")
            print(f"Fetching {group_name}...")

            pytrends.build_payload(
                kw_list=kw_list,
                cat=0,
                timeframe='today 1-m', # now 7-d | today 1-m | today 12-m | today 5-y
                geo='IL',
                gprop=''
            )
            
            df_trends = pytrends.interest_over_time().reset_index()

            if 'isPartial' in df_trends.columns:
                df_trends.drop(columns=['isPartial'], inplace=True)

            # Calculate the average group score
            df_trends[group_name] = df_trends[kw_list].mean(axis=1)

            # first group keeps date column
            if df.empty:
                df["date"] = df_trends["date"]

            df[group_name] = df_trends[group_name]

            # avoid 429 error
            if index < len(GROUPS)-1:
                time.sleep(30)

        # avoid the function does not return a None DataFram
        if df is None:
            logger.error("Data fetched failed, returned a None value.")
            sys.exit(2)

        return df
        
    except TooManyRequestsError as e:
        logger.error(f"{group_name}: Google returned 429 (rate limited)")
        sys.exit(2)

    except Exception as e:
        logger.exception(f"Unexpected error in {group_name}: {e}")
        sys.exit(2)
    

#===================================================================
# Update Database
# Uploads or updates Google Trends records in the MongoDB collection.
# Input: DataFrame containing calculated index trends
#===================================================================

def update_database(df_new):
    try:
        # Convert DataFrame to dictionary  
        records = df_new.to_dict(orient="records")

        # check if collection is empty
        if trends_collection.count_documents({}) == 0:
            # create unique index after initial insert
            trends_collection.create_index("date", unique=True)
            response = trends_collection.insert_many(records)

            if response.acknowledged:
                logger.info("Initial data inserted into database successfully")

            else:
                logger.error("Failed to insert initial data into database")
               
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
                
       
    except Exception as e:
        logger.error("Error saving data to MongoDB")
        sys.exit(2)


if __name__ == "__main__":
    main()
    