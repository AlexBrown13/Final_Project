from pytrends.request import TrendReq
from mongo import trends_collection
from pymongo import UpdateOne

def main():
    pytrends = TrendReq(hl='en-US', tz=180)

    trauma_index_keywords = [
        'לחץ',
        'טראומה',
        'חרדה',
        'חשש',
    ]

    try:
        pytrends.build_payload(
            kw_list=trauma_index_keywords,
            cat=0,
            timeframe='today 5-y',
            geo='IL'
        )

        df_temp = pytrends.interest_over_time().reset_index()
        
        if 'isPartial' in df_temp.columns:
            df_temp.drop(columns=['isPartial'], inplace=True)


        df_new_name = df_temp.rename(columns={
            'לחץ': 'Stress',
            'טראומה': 'Trauma',
            'חרדה': 'Panic_Disorder',
            'חשש': 'Fear'
        })

    except Exception as e:
        print(f"Error in Google trends {e}")
        exit()


    try:
        records = df_new_name.to_dict(orient="records")

        # check if collection is empty
        if trends_collection.count_documents({}) == 0:
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
        print("Error saving data to MongoDB")
        exit()


if __name__ == "__main__":
    main()