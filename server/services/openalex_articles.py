from mongo import articles_collection
from pymongo import UpdateOne
from pyalex import Works

def main():
    try:
        works = Works().search("PTSD").filter(
            type='article'
        ).get(per_page=1)

        response_works = []
        operations = []

        for i, work in enumerate(works, start=1):
            doc = {
                "openalex_id": work["id"],
                "title": work.get("title", "No title"),
                "year": work.get("publication_year", "N/A"),
                "journal": work.get("host_venue", {}).get("display_name", "N/A"),
                "doi": work.get("doi", "N/A"),
                "pdf_url": work.get("primary_location", {}).get("pdf_url", "N/A")
            }

            response_works.append(doc)

            operations.append(
                UpdateOne(
                    {"openalex_id": work["id"]},   # filter
                    {"$set": doc},                 # update
                    upsert=True    
                )
            )

            if operations:
                result = articles_collection.bulk_write(operations)
                print("Upserted:", result.upserted_count)
                print("Modified:", result.modified_count)

        
    except Exception as e:
        print(f"Error: {e}")
        

if __name__ == "__main__":
    main()