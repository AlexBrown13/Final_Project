from pymongo import UpdateOne
from pyalex import Works

from services.mongo import articles_collection


def reconstruct_abstract(abstract_index):
    if not abstract_index:
        return None

    word_positions = []

    for word, positions in abstract_index.items():
        for pos in positions:
            word_positions.append((pos, word))

    word_positions.sort()
    return " ".join(word for _, word in word_positions)


def main(user_id, query=None):
    if not query or not str(query).strip():
        query = "trauma in Israel mental health support research"

    try:
        works = Works().search(query).filter(
            type='article'
        ).get(per_page=5)

        response_works = []
        operations = []

        for i, work in enumerate(works, start=1):
            abstract = reconstruct_abstract(work.get("abstract_inverted_index"))
            
            doc = {
                "openalex_id": work["id"],
                "title": work.get("title", "No title"),
                "year": work.get("publication_year", None),
                "journal": work.get("host_venue", {}).get("display_name", None),
                "url": work.get("doi", None),
                "pdf_url": work.get("primary_location", {}).get("pdf_url", None),
                "abstract": abstract,
                "authors": [
                    a.get("author", {}).get("display_name")
                    for a in work.get("authorships", [])[:2]
                ],
                "persona_query": query
            }

            response_works.append(doc)

            operations.append(
                UpdateOne(
                    {
                        "openalex_id": work["id"],
                        "user_id": user_id
                     },
                    {"$set": doc},                 
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