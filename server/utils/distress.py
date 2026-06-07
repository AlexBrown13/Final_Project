"""
Distress detection via weighted keyword scoring.

Each keyword carries a severity weight. The total score determines the
distress level (0 = none, 1 = mild, 2 = moderate, 3 = severe).
Thresholds: severe >= 8, moderate >= 4, mild >= 2.
"""

KEYWORD_WEIGHTS: dict[str, int] = {
    # ── Severe (weight 10) ────────────────────────────────────────────────
    "suicide": 10, "suicidal": 10,
    "kill myself": 10, "killing myself": 10,
    "end my life": 10, "end my pain": 10,
    "want to die": 10, "going to die": 9,
    "better off dead": 10, "don't want to live": 10,
    "no reason to live": 10, "don't want to wake up": 9,
    "wish i was dead": 10, "rather be dead": 10,
    # Hebrew
    "להתאבד": 10, "אתאבד": 10,
    "רוצה למות": 10, "לסיים את חיי": 10,
    "אין לי סיבה לחיות": 10,
    "רוצה להיעלם": 9, "לא רוצה להתעורר": 9,
    "מוות": 8, "להרוג את עצמי": 10,

    # ── Moderate (weight 5–7) ─────────────────────────────────────────────
    "self-harm": 7, "hurt myself": 7, "cutting myself": 7,
    "hopeless": 5, "no way out": 6, "giving up": 5,
    "can't go on": 6, "can't take it anymore": 6,
    "nothing to live for": 7, "i give up": 5,
    "i can't do this anymore": 6, "everything is pointless": 5,
    "nobody cares": 4, "no one cares": 4,
    "can't keep going": 6, "don't want to be here": 7,
    # Hebrew
    "לפגוע בעצמי": 7, "אין מוצא": 6,
    "אין טעם": 5, "לא יכול להמשיך": 6, "מוותר": 5,
    "אף אחד לא אכפת": 4, "הכל חסר טעם": 5,
    "לא רוצה להיות פה": 7, "לא יכול יותר": 6,

    # ── Mild (weight 2–3) ─────────────────────────────────────────────────
    "can't cope": 3, "falling apart": 3, "breaking down": 3,
    "desperate": 2, "overwhelmed": 2, "in crisis": 3,
    "not okay": 2, "i'm not okay": 3,
    "losing it": 2, "at my limit": 3, "can't handle this": 3,
    # Hebrew
    "לא מסוגל": 2, "מתמוטט": 3, "לא בסדר": 2, "נואש": 3,
    "על הקצה": 3, "לא מצליח להתמודד": 3, "נשבר": 3,
}

CRISIS_RESOURCES = {
    "en": [
        {"name": "ERAN — Emotional First Aid", "number": "1201", "available": "24/7"},
        {"name": "NATAL — Trauma & War Hotline", "number": "1800-363-363", "available": "24/7"},
        {"name": "SAHAR — Online Emotional Support", "url": "https://www.sahar.org.il", "available": "24/7"},
    ],
    "he": [
        {"name": "ער\"ן — עזרה ראשונה רגשית", "number": "1201", "available": "24/7"},
        {"name": "נט\"ל — קו תמיכה לטראומה ומלחמה", "number": "1800-363-363", "available": "24/7"},
        {"name": "סהר — תמיכה רגשית מקוונת", "url": "https://www.sahar.org.il", "available": "24/7"},
    ],
}

THRESHOLDS = {3: 8, 2: 4, 1: 2}


def detect_distress(text: str) -> int:
    """
    Score the text against weighted distress keywords.
    Returns distress level 0–3 (0 = none, 3 = severe).
    """
    text_lower = text.lower()
    score = sum(
        weight
        for keyword, weight in KEYWORD_WEIGHTS.items()
        if keyword in text_lower
    )
    for level in (3, 2, 1):
        if score >= THRESHOLDS[level]:
            return level
    return 0


def get_resources(locale: str) -> list:
    return CRISIS_RESOURCES.get(locale, CRISIS_RESOURCES["en"])
