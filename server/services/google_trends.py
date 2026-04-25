from pytrends.request import TrendReq
from services.mongo import trends_collection_test
from pymongo import UpdateOne

def run_trends_job():
    pytrends = TrendReq(hl='en-US', tz=180)

    trauma_index_keywords = [
        'הלם קרב',
        'מילואים',
        'אזעקות',
        'לחץ נפשי',
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
            'אזעקות': 'redAlert',
            'מילואים': 'military_reserve',
            'הלם קרב': 'shellshock',
            'לחץ נפשי': 'mentalStress'
        })

    except Exception as e:
        print(f"Error in Google trends {e}")


    try:
        records = df_new_name.to_dict(orient="records")

        # make sure data format is consistent
        for row in records:
            row["date"] = str(row["date"])

        # check if collection is empty
        if trends_collection_test.count_documents({}) == 0:
            response = trends_collection_test.insert_many(records)

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
                trends_collection_test.bulk_write(operations)
                print("Existing data updated successfully")
       
    except Exception as e:
        print("Error saving data to MongoDB")


if __name__ == "__main__":
    run_trends_job()