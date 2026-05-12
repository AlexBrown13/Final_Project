
from pyalex import Works, Authors

works = Works().search(["I want to learn about trauma", "how trauma impact on accidents?"]).filter(
    publication_year=2025,
    type='article'
).get(per_page=1)


for i, work in enumerate(works, start=1):
    title = work.get("title", "No title")
    year = work.get("publication_year", "N/A")
    journal = work.get("host_venue", {}).get("display_name", "N/A")
    doi = work.get("doi", "N/A")
    
    # Abstract
    abstract = "N/A"
    if work.get("abstract_inverted_index"):
        inverted = work["abstract_inverted_index"]

        # rebuild abstract text
        words = []
        for word, positions in inverted.items():
            for pos in positions:
                words.append((pos, word))

        abstract = " ".join(
            word for pos, word in sorted(words)
        )

    # PDF / article link
    article_url = work.get("primary_location", {}) \
                      .get("landing_page_url", "N/A")

    pdf_url = work.get("primary_location", {}) \
                  .get("pdf_url", "N/A")


    print(f"\nArticle {i}")
    print("-" * 40)
    print(f"Title   : {title}")
    print(f"Year    : {year}")
    print(f"Journal : {journal}")
    print(f"DOI     : {doi}")

    print(f"URL      : {article_url}")
    print(f"PDF      : {pdf_url}")
    print(f"Abstract :\n{abstract[:1000]}")
