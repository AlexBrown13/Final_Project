from flask import Blueprint, jsonify
from pyalex import Works
from services.mongo import articles_collection, users_collection
from pymongo import UpdateOne

articles_bp = Blueprint("openalex_articles", __name__)


@articles_bp.route('/articles', methods=['GET'])
def articles():
    try:
        works = Works().search("I want to learn about trauma").filter(
            publication_year=2025,
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

            print(f"\n {operations} \n")

            if operations:
                result = articles_collection.bulk_write(operations)
                print("Upserted:", result.upserted_count)
                print("Modified:", result.modified_count)

        return jsonify(response_works), 200
            
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

