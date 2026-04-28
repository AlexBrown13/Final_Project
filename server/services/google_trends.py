from pytrends.request import TrendReq
from mongo import trends_collection
from pymongo import UpdateOne
import time
import pandas as pd

def main():
    
    index_keywords_HE = ['טראומה', 'לחץ נפשי', 'חשש', 'חרדה',]
    index_keywords_EN = ['Trauma', 'Stress','Fear','Panic_Disorder']

    groups = {
        "Trauma_Index": ["טראומה",], # ["טראומה" ,"פוסט טראומה", "PTSD"]
        "Anxiety_Index": ["חרדה",],  # ["חרדה", "לחץ נפשי", "דאגה"]
        "Fear_Index": ["חשש",]       # ["חשש", "פחד", "אזעקות"] 
    }

    try:
        pytrends = TrendReq(hl='en-US', tz=180)
        final_df = pd.DataFrame()
        
        for index, (group_name, kw_list) in enumerate(groups.items()):
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
            
        return final_df
        
    except Exception as e:
        print(f"Error in Google trends: {e}")
        exit()


def update_database(df_new):
    try:
        records = df_new.to_dict(orient="records")

        # check if collection is empty
        if trends_collection.count_documents({}) == 0:
            # create unique index after initial insert
            trends_collection.create_index("date", unique=True)
            response = trends_collection.insert_many(records)

            if response.acknowledged:
                print("Initial data inserted successfully")
            else:
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
                print("Existing data updated successfully")
       
    except Exception as e:
        print(f"Error saving data to MongoDB {e}")
        exit()


if __name__ == "__main__":
    df_new = main()
    update_database(df_new)