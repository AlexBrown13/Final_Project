ISRAEL_DATA = [
    {
        "id": "treatment_gap",
        "title_he": "פער הטיפול: מי זקוק לעזרה מול מי מקבל בפועל",
        "title_en": "Treatment Gap: Mental Health Need vs. Actual Care",
        "source": "State Comptroller Report, 2025",
        "chart_type": "bar",
        "labels_he": ["זקוקים לטיפול", "קיבלו טיפול"],
        "labels_en": ["Need Treatment", "Received Treatment"],
        "values": [38, 1],
        "extra": {"y_unit": "%"},
        "explain_he": "דו\"ח מבקר המדינה (2025) חושף כשל מערכתי חריף: כ-38% מהאוכלוסייה דיווחו על תסמינים בינוניים או חמורים של דחק, דיכאון וחרדה לאחר ה-7 באוקטובר — אך פחות מאחוז אחד בלבד קיבל טיפול נפשי דרך קופות החולים ומרכזי החוסן בחצי השנה הראשונה. פער זה מייצג קריסה של קיבולת מערכת הבריאות, חסמים מערכתיים כמו זמני המתנה וסטיגמה, וסיכון ממשי להתפתחות כרונית של הפרעות.",
        "explain_en": "The State Comptroller Report (2025) exposes a severe systemic failure: approximately 38% of the population reported moderate or severe symptoms of stress, depression, and anxiety after October 7 — yet fewer than 1% received treatment in the first six months. This gap represents a collapse in healthcare capacity, systemic barriers, and a real risk of conditions becoming chronic."
    },
    {
        "id": "system_overload",
        "title_he": "עומס מערכתי: קיבולת מול ביקוש בריאות הנפש",
        "title_en": "System Overload: Mental Health Capacity vs. Demand",
        "source": "Ministry of Health estimate; State Comptroller 2025",
        "chart_type": "stacked_area",
        "labels_he": ["קיבולת קיימת", "340K PTSD", "680K סה\"כ"],
        "labels_en": ["Existing Capacity", "340K PTSD", "680K Total"],
        "values": [93000, 340000, 680000],
        "extra": {},
        "explain_he": "משרד הבריאות מעריך כי כ-340 אלף איש עלולים לפתח PTSD, וכי מספר המטופלים הכולל עשוי לגדול עד 680 אלף. הגרף מראה רוויה מערכתית: לא רק PTSD — אלא הכפלה כמעט של הביקוש הכולל. מדובר בחשיפה משנית ושלישונית המכפילה את הלחץ על המערכת.",
        "explain_en": "The Ministry of Health estimates that 340,000 people may develop PTSD, and total patients could rise to 680,000. This chart shows system saturation: it is not just about PTSD — it is about a near-doubling of total demand. Secondary and tertiary trauma exposure multiply pressure on the system far beyond the direct victims."
    },
    {
        "id": "ptsd_cost_distribution",
        "title_he": "חלוקת עלויות הטיפול: PTSD מול קבוצת ביקורת",
        "title_en": "Treatment Cost Distribution: PTSD vs. Control Group",
        "source": "Bothe et al., 2020",
        "chart_type": "donut",
        "labels_he": ["PTSD ישיר (18%)", "הפרעות נלוות (59%)", "ביקורת (19%)"],
        "labels_en": ["Direct PTSD (18%)", "Comorbid Disorders (59%)", "Control (19%)"],
        "values": [18, 59, 19],
        "extra": {},
        "explain_he": "כ-18% מן העלות יוחסה ישירות ל-PTSD, וכ-59% להפרעות נפשיות נוספות הנלוות לה. הנטל הכלכלי נובע בעיקר מקומורבידיות — לא מ-PTSD בנפרד. הדבר מחייב גישה כוללת ולא רק טיפול ב-PTSD בלבד.",
        "explain_en": "About 18% of costs were attributed directly to PTSD, while 59% were linked to comorbid mental disorders. The economic burden stems primarily from comorbidities, not PTSD in isolation. This demands a comprehensive multi-disorder approach, not targeted PTSD treatment alone."
    },
    {
        "id": "economic_breakdown",
        "title_he": "פירוק העלות הכלכלית השנתית של PTSD",
        "title_en": "Annual Economic Cost Breakdown of PTSD",
        "source": "Davis et al., 2022",
        "chart_type": "stacked_bar",
        "labels_he": ["עלויות ישירות", "עלות אבטלה", "עלויות אחרות"],
        "labels_en": ["Direct Costs", "Unemployment Cost", "Other Indirect"],
        "values": [62.5, 42.7, 127.0],
        "extra": {"total": 232.2, "y_unit": "billion USD"},
        "explain_he": "העלות השנתית הכוללת של PTSD עומדת על כ-232.2 מיליארד דולר. הגרף מציג את פירוק העלות: כ-42.7 מיליארד מיוחסים לאבטלה, והיתר כוללים טיפול רפואי ועלויות עקיפות. הנזק הכלכלי אינו רק הוצאה רפואית — שוק העבודה הוא נדבך מרכזי.",
        "explain_en": "The total annual cost of PTSD is approximately $232.2 billion. This chart decomposes the cost: $42.7 billion is unemployment alone, with the rest covering medical care and other indirect costs. The economic damage is not only healthcare expenditure — the labor market constitutes a major component."
    },
    {
        "id": "global_productivity",
        "title_he": "אובדן פרודוקטיביות גלובלי: מימדי הנזק",
        "title_en": "Global Productivity Loss: Scale of Damage",
        "source": "WHO, 2019",
        "chart_type": "lollipop",
        "labels_he": ["ימי עבודה אבודים (מיליארד)", "עלות שנתית (טריליון $)"],
        "labels_en": ["Workdays Lost (billions)", "Annual Cost (trillion $)"],
        "values": [12, 1],
        "extra": {"y_units": ["billion days", "trillion USD"]},
        "explain_he": "מדי שנה אובדים כ-12 מיליארד ימי עבודה עקב דיכאון וחרדה, בעלות של כטריליון דולר. הגרף מדגיש את העוצמה של שני ערכים קיצוניים — מדד אחד של כמות ומדד אחד של עלות — ומראה כי הבעיה חורגת בהרבה מגבולות ישראל.",
        "explain_en": "Each year, approximately 12 billion workdays are lost due to depression and anxiety, at a cost of around $1 trillion. The chart highlights the magnitude of two extreme-scale values — one measuring volume, one measuring cost — showing the problem vastly exceeds Israel's borders."
    },
    {
        "id": "cumulative_cost",
        "title_he": "עלות מצטברת לאדם עם PTSD לאורך 5 שנים",
        "title_en": "Cumulative PTSD Cost per Individual Over 5 Years",
        "source": "Bothe et al., 2020",
        "chart_type": "line",
        "labels_he": ["שנה 1", "שנה 2", "שנה 3", "שנה 4", "שנה 5"],
        "labels_en": ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
        "values": [8600, 17200, 25800, 34400, 43000],
        "extra": {"y_unit": "euro"},
        "explain_he": "העלות המצטברת הממוצעת לאדם עם PTSD לאורך חמש שנים הוערכה בכ-43,000 אירו. הגרף מעביר את הדיון מ-snapshot ל-Longitudinal Burden: אי-טיפול מוקדם יוצר חוב מצטבר. כל שקל המושקע בטיפול מוקדם חוסך עלויות גבוהות בהרבה בטווח הארוך.",
        "explain_en": "The average cumulative cost per person with PTSD over five years is approximately €43,000. This chart shifts the conversation to Longitudinal Burden: delaying treatment creates a compounding debt. Every unit invested in early treatment saves substantially greater costs in the long run."
    }
]

ADDICTIONS_DATA = [
    {
        "id": "diverging_substance",
        "title_he": "שימוש בחומרים: סטייה מהבסיס בין קבוצת PTSD ללא PTSD",
        "title_en": "Substance Use: Deviation from Baseline — PTSD vs. Non-PTSD",
        "source": "Review literature (multiple studies)",
        "chart_type": "diverging_bar",
        "labels_he": ["אלכוהול", "קנאביס", "תרופות שינה", "ממריצים"],
        "labels_en": ["Alcohol", "Cannabis", "Sleep Meds", "Stimulants"],
        "values_ptsd": [33, 28, 22, 15],
        "values_base": [-8, -5, -4, -3],
        "extra": {},
        "explain_he": "אנשים עם PTSD מראים סטייה חיובית גבוהה בשימוש בחומרים לעומת בסיס אוכלוסייה. מנגנון זה נקרא Self-Medication Hypothesis: טראומה → מצוקה רגשית → שימוש בחומרים להקלה. הגרף מראה את הכיוון וגודל הסטייה עבור כל חומר בנפרד.",
        "explain_en": "People with PTSD show high positive deviation in substance use compared to population baseline. This mechanism is the Self-Medication Hypothesis: Trauma → Emotional Distress → Substance Use for relief. The chart shows the direction and magnitude of deviation for each substance individually."
    },
    {
        "id": "risk_heatmap",
        "title_he": "מטריצת סיכונים: תסמיני PTSD כמנבאי התנהגות",
        "title_en": "Risk Behavior Matrix: PTSD Symptoms as Predictors",
        "source": "Hoge et al. 2004; Dworkin et al. 2018",
        "chart_type": "heatmap",
        "labels_he": ["אלכוהול", "נהיגה בשכרות", "פציעה עצמית", "תרופות שינה"],
        "labels_en": ["Alcohol", "Drunk Driving", "Self-Harm", "Sleep Meds"],
        "row_labels_he": ["אימפולסיביות", "מחשבות פולשניות", "קשיי ריכוז", "כעס/עוררות"],
        "row_labels_en": ["Impulsivity", "Intrusive Thoughts", "Concentration", "Anger/Arousal"],
        "values": [
            [9, 7, 5, 6],
            [6, 4, 7, 8],
            [5, 6, 4, 7],
            [8, 8, 6, 5]
        ],
        "extra": {"scale": "0-10"},
        "explain_he": "הטבלה מציגה את עוצמת הקשר בין כל תסמין PTSD לבין כל התנהגות סיכון. אימפולסיביות ואלכוהול הם הזוג החזק ביותר; מחשבות פולשניות קשורות חזק לפציעה עצמית. זוהי גישת מטריצה שמאפיינת ניתוח פסיכולוגי אקדמי מתקדם.",
        "explain_en": "The matrix shows the association strength between each PTSD symptom and each risk behavior. Impulsivity and alcohol form the strongest pair; intrusive thoughts are strongly linked to self-harm. This matrix approach characterizes advanced academic psychological analysis."
    },
    {
        "id": "dui_comparison",
        "title_he": "נהיגה תחת השפעת אלכוהול: PTSD מול ללא PTSD",
        "title_en": "Drunk Driving Rates: PTSD vs. Non-PTSD",
        "source": "Van Voorhees et al. 2018",
        "chart_type": "bar",
        "labels_he": ["עם PTSD", "ללא PTSD"],
        "labels_en": ["With PTSD", "Without PTSD"],
        "values": [28, 8],
        "extra": {"y_unit": "%"},
        "explain_he": "נמצא כי תסמיני PTSD קשורים לעלייה בנהיגה תחת השפעת אלכוהול. הגרף מחבר בין התמכרות לבין השלכות חברתיות ישירות — Behavioral Externalities: ההשפעה החיצונית של ההתמכרות על כלל החברה.",
        "explain_en": "PTSD symptoms are strongly associated with increased drunk driving. The chart links addiction to direct social consequences — Behavioral Externalities: the external impact of addiction on society as a whole, not just on the individual."
    },
    {
        "id": "productivity_waterfall",
        "title_he": "שחיקה מצטברת בפריון: מנורמלי לאובדן עבודה",
        "title_en": "Cumulative Productivity Erosion: Normal to Job Loss",
        "source": "Kessler et al. 2001; WHO 2019",
        "chart_type": "waterfall",
        "labels_he": ["ביצוע תקין", "חרדה/דיכאון", "הפרעות שינה", "היעדרויות", "אובדן עבודה"],
        "labels_en": ["Baseline", "Anxiety/Depression", "Sleep Disorders", "Absenteeism", "Job Loss Impact"],
        "values": [100, -18, -12, -10, -8],
        "extra": {},
        "explain_he": "הגרף מציג ירידה שלב-אחר-שלב בפריון: מ-100% בסיס, דרך חרדה (-18%), הפרעות שינה (-12%), היעדרויות (-10%), ועד לאובדן עבודה (-8%). כל שלב מזין את הבא — ירידה בפריון מגבירה סטרס, שמגביר שימוש בחומרים.",
        "explain_en": "This chart presents step-by-step productivity erosion: from 100% baseline, through anxiety (-18%), sleep disorders (-12%), absenteeism (-10%), to job loss impact (-8%). Each stage feeds the next — reduced productivity increases stress, which increases substance use."
    },
    {
        "id": "causal_sankey",
        "title_he": "נתיב סיבתי: טראומה → PTSD → שימוש בחומרים",
        "title_en": "Causal Pathway: Trauma → PTSD → Substance Use",
        "source": "Dworkin et al. 2018; McCauley et al. 2012",
        "chart_type": "sankey",
        "labels_he": ["טראומה", "תסמיני PTSD", "פגיעה קוגניטיבית", "התנהגות מסוכנת", "שימוש בחומרים", "התמכרות"],
        "labels_en": ["Trauma", "PTSD Symptoms", "Cognitive Impair.", "Risky Behavior", "Substance Use", "Addiction"],
        "values": [100, 82, 74, 67, 71, 59],
        "extra": {},
        "explain_he": "הגרף מציג את השרשרת הסיבתית המלאה ממחקר: טראומה → תסמיני PTSD → פגיעה קוגניטיבית → התנהגות מסוכנת → שימוש בחומרים → התמכרות. הרוחב בכל שלב מייצג את עוצמת המעבר. זהו בדיוק מה שמבדיל ניתוח אקדמי — הצגת מנגנון ולא רק קורלציה.",
        "explain_en": "The chart presents the full research-grounded causal chain: Trauma → PTSD Symptoms → Cognitive Impairment → Risky Behavior → Substance Use → Addiction. Width at each stage represents transition strength. This is precisely what distinguishes academic analysis — presenting mechanism, not just correlation."
    },
    {
        "id": "bubble_externalities",
        "title_he": "השפעות חיצוניות: חומרת ותדירות התנהגויות סיכון",
        "title_en": "Behavioral Externalities: Severity × Frequency of Risk Behaviors",
        "source": "Elbogen et al. 2010",
        "chart_type": "bubble",
        "labels_he": ["נהיגה בשכרות", "עבריינות קלה", "פציעה עצמית", "סיכון לזולת", "אלימות"],
        "labels_en": ["Drunk Driving", "Minor Offenses", "Self-Harm", "Risk to Others", "Violence"],
        "values": [
            {"x": 70, "y": 75, "z": 28, "label_he": "נהיגה בשכרות", "label_en": "Drunk Driving"},
            {"x": 45, "y": 50, "z": 19, "label_he": "עבריינות קלה", "label_en": "Minor Offenses"},
            {"x": 30, "y": 65, "z": 14, "label_he": "פציעה עצמית", "label_en": "Self-Harm"},
            {"x": 55, "y": 80, "z": 22, "label_he": "סיכון לזולת", "label_en": "Risk to Others"},
            {"x": 25, "y": 40, "z": 11, "label_he": "אלימות", "label_en": "Violence"}
        ],
        "extra": {
            "x_label_he": "תדירות (%)", "x_label_en": "Frequency (%)",
            "y_label_he": "חומרה (0-100)", "y_label_en": "Severity (0-100)"
        },
        "explain_he": "בועות גדולות = שכיחות גבוהה יותר. ציר X = תדירות, ציר Y = חומרה. נהיגה בשכרות וסיכון לזולת הם הבועות הגדולות והגבוהות ביותר — הן תדירות והן חמורות. ה-Behavioral Externalities מוכיחות שהנזק חורג מהפרט ומשפיע ישירות על הסביבה החברתית.",
        "explain_en": "Bubble size = higher prevalence. X-axis = frequency, Y-axis = severity. Drunk driving and risk-to-others are the largest, highest bubbles — both frequent and severe. Behavioral Externalities demonstrate that the damage extends beyond the individual and directly impacts the social environment."
    }
]


ISRAEL_HEALTH_DATA = [
    {
        "id": "heart_attacks_increase",
        "title_he": "עלייה בהתקפי לב קשים",
        "title_en": "Increase in Severe Heart Attacks",
        "source": "Shaare Zedek Medical Center, 2024",
        "chart_type": "bar",
        "labels_he": ["2022", "2023"],
        "labels_en": ["2022", "2023"],
        "values": [63, 94],
        "extra": {"y_unit": "cases", "change_percent": 35},
        "explain_he": "נרשמה עלייה של כ-35% במספר התקפי הלב הקשים לאחר אירועי 7 באוקטובר. הממצא מצביע על קשר ישיר בין לחץ נפשי חריף לבין תחלואה קרדיווסקולרית חריפה.",
        "explain_en": "A ~35% increase in severe heart attacks was observed after October 7. This finding indicates a direct link between acute psychological stress and cardiovascular events."
    },

    {
        "id": "broken_heart_syndrome",
        "title_he": "תסמונת הלב השבור",
        "title_en": "Broken Heart Syndrome (Takotsubo)",
        "source": "Israeli Cardiology Conference, 2024",
        "chart_type": "bar",
        "labels_he": ["2022", "2023"],
        "labels_en": ["2022", "2023"],
        "values": [16, 30],
        "extra": {"approx_change_percent": 100},
        "explain_he": "נרשמה עלייה של כמעט פי שניים בתסמונת הלב השבור, מצב לבבי הנגרם ישירות כתוצאה ממתח נפשי קיצוני. הממצא מחזק את ההשפעה הישירה של טראומה על תפקוד הלב.",
        "explain_en": "Cases of stress-induced cardiomyopathy nearly doubled, reinforcing the direct physiological impact of extreme psychological stress on cardiac function."
    },

    {
        "id": "stroke_increase",
        "title_he": "עלייה בשבץ מוחי דימומי",
        "title_en": "Increase in Hemorrhagic Stroke",
        "source": "Rambam Health Care Campus, 2024",
        "chart_type": "bar",
        "labels_he": ["2022", "2023"],
        "labels_en": ["2022", "2023"],
        "values": [40, 56],
        "extra": {"change_percent": 17},
        "explain_he": "נרשמה עלייה של כ-17% במקרי שבץ מוחי דימומי בחודש הראשון לאחר המלחמה. הנתונים מצביעים על השפעת לחץ קיצוני גם על מערכת כלי הדם במוח.",
        "explain_en": "A ~17% increase in hemorrhagic stroke cases was observed, suggesting that extreme stress also impacts cerebrovascular health."
    },

    {
        "id": "smoking_initiation",
        "title_he": "התחלת עישון בעקבות המלחמה",
        "title_en": "Smoking Initiation After War",
        "source": "Public Health Survey, 2025",
        "chart_type": "bar",
        "labels_he": ["מפונים", "אוכלוסייה כללית"],
        "labels_en": ["Evacuees", "General Population"],
        "values": [4.5, 2.5],
        "extra": {"y_unit": "%"},
        "explain_he": "שיעור המתחילים לעשן בקרב מפונים כמעט כפול מהאוכלוסייה הכללית, מה שמעיד על שימוש בעישון כמנגנון התמודדות עם לחץ וטראומה.",
        "explain_en": "Smoking initiation among evacuees is nearly double that of the general population, indicating stress-related coping behavior."
    },

    {
        "id": "substance_use_regions",
        "title_he": "שימוש בחומרים ממכרים לפי אזור",
        "title_en": "Substance Use by Region",
        "source": "Public Health Data, 2024",
        "chart_type": "bar",
        "labels_he": ["דרום", "צפון"],
        "labels_en": ["South", "North"],
        "values": [26, 28],
        "extra": {"y_unit": "%"},
        "explain_he": "נרשמה עלייה משמעותית בשימוש בחומרים ממכרים באזורי הלחימה, כאשר הצפון מציג שיעור גבוה יותר. הדבר משקף השפעה אזורית של טראומה מתמשכת.",
        "explain_en": "Substance use increased significantly in conflict regions, with higher rates in the north, reflecting prolonged exposure to stress."
    },

    {
        "id": "diabetes_change",
        "title_he": "שינוי בשיעור סוכרת סוג 2",
        "title_en": "Change in Type 2 Diabetes Rate",
        "source": "Ministry of Health Report, 2024",
        "chart_type": "line",
        "labels_he": ["2022", "2023"],
        "labels_en": ["2022", "2023"],
        "values": [10.3, 10.5],
        "extra": {"y_unit": "%", "change_percent": 0.2},
        "explain_he": "נרשמה עלייה מתונה בשיעור הסוכרת לאחר המלחמה. למרות שהשינוי קטן, הוא משמעותי לאור יציבות קודמת ומעיד על השפעת שינויים באורח החיים ולחץ מתמשך.",
        "explain_en": "A slight increase in diabetes prevalence was observed. While small, it is significant given prior stability and reflects lifestyle disruption and chronic stress."
    },

    {
        "id": "overall_health_impact",
        "title_he": "השוואת שינוי בתחלואה",
        "title_en": "Comparison of Health Impact",
        "source": "Compiled from multiple studies (2024)",
        "chart_type": "bar",
        "labels_he": ["התקפי לב", "שבץ מוחי", "תסמונת הלב השבור"],
        "labels_en": ["Heart Attacks", "Stroke", "Broken Heart Syndrome"],
        "values": [35, 20, 100],
        "extra": {"y_unit": "% change"},
        "explain_he": "הגרף מציג את עוצמת השינוי היחסי בין סוגי תחלואה שונים. תסמונת הלב השבור מציגה את העלייה החדה ביותר, מה שמדגיש את הרגישות הגבוהה של הלב ללחץ נפשי חריף.",
        "explain_en": "This chart compares relative increases across conditions. Broken heart syndrome shows the sharpest rise, highlighting the heart’s sensitivity to acute stress."
    }
]

ISRAEL_SLEEP_DATA = [
    {
        "id": "sleep_disorders_prevalence",
        "title_he": "שכיחות הפרעות שינה ב-PTSD",
        "title_en": "Prevalence of Sleep Disorders in PTSD",
        "source": "National Center for PTSD",
        "chart_type": "bar",
        "labels_he": ["נדודי שינה", "סיוטי לילה", "עוררות יתר", "שינה מקוטעת"],
        "labels_en": ["Insomnia", "Nightmares", "Hyperarousal", "Fragmented Sleep"],
        "values": [85, 75, 70, 65],
        "extra": {"y_unit": "%"},
        "explain_he": "כמעט כל אדם עם PTSD חווה הפרעות שינה, כאשר נדודי שינה וסיוטים הם התסמינים השכיחים ביותר.",
        "explain_en": "Nearly all individuals with PTSD experience sleep disturbances, with insomnia and nightmares being the most common symptoms."
    },

    {
        "id": "sleep_disorder_causes",
        "title_he": "גורמים להפרעות שינה",
        "title_en": "Causes of Sleep Disorders",
        "source": "Germain, 2013",
        "chart_type": "bar",
        "labels_he": ["מחשבות טורדניות", "עוררות פיזיולוגית", "סיוטים טראומטיים"],
        "labels_en": ["Intrusive Thoughts", "Physiological Arousal", "Trauma Nightmares"],
        "values": [90, 80, 90],
        "extra": {"y_unit": "impact score"},
        "explain_he": "הגורמים המרכזיים להפרעות שינה כוללים מחשבות טורדניות, עוררות יתר וסיוטים הקשורים לטראומה.",
        "explain_en": "Key causes of sleep disruption include intrusive thoughts, hyperarousal, and trauma-related nightmares."
    },

    {
        "id": "daily_function_impact",
        "title_he": "השפעת חוסר שינה על התפקוד",
        "title_en": "Impact of Sleep Deprivation on Daily Function",
        "source": "Mahfoud et al., 2009",
        "chart_type": "bar",
        "labels_he": ["עייפות", "עצבנות", "חרדה", "פגיעה בתפקוד"],
        "labels_en": ["Fatigue", "Irritability", "Anxiety", "Functional Impairment"],
        "values": [80, 70, 90, 85],
        "extra": {"y_unit": "severity"},
        "explain_he": "מחסור בשינה מחמיר חרדה, עייפות ופוגע בתפקוד היומיומי, מה שיוצר מעגל שלילי.",
        "explain_en": "Sleep deprivation worsens anxiety, fatigue, and daily functioning, creating a negative cycle."
    },

    {
        "id": "substance_use_for_sleep",
        "title_he": "שימוש בחומרים לצורך שינה",
        "title_en": "Substance Use for Sleep",
        "source": "Brower, 2001",
        "chart_type": "pie",
        "labels_he": ["אלכוהול", "תרופות שינה", "תרופות הרגעה"],
        "labels_en": ["Alcohol", "Sleeping Pills", "Sedatives"],
        "values": [50, 30, 20],
        "extra": {"y_unit": "%"},
        "explain_he": "רבים מהסובלים מהפרעות שינה פונים לחומרים פסיכו-אקטיביים, כאשר אלכוהול הוא הנפוץ ביותר.",
        "explain_en": "Many individuals with sleep issues turn to psychoactive substances, with alcohol being the most common."
    },

    {
        "id": "alcohol_sleep_effect",
        "title_he": "השפעת אלכוהול על שינה",
        "title_en": "Alcohol Effect on Sleep",
        "source": "Brower, 2001",
        "chart_type": "bar",
        "labels_he": ["הירדמות מהירה", "פגיעה בשינה עמוקה", "יקיצות בלילה"],
        "labels_en": ["Faster Sleep Onset", "Reduced Deep Sleep", "Night Awakenings"],
        "values": [70, 85, 80],
        "extra": {"y_unit": "impact"},
        "explain_he": "אלכוהול עשוי לעזור להירדם מהר אך פוגע משמעותית באיכות השינה וגורם ליקיצות.",
        "explain_en": "Alcohol may help fall asleep faster but significantly harms sleep quality and increases awakenings."
    },

    {
        "id": "sleep_to_addiction_cycle",
        "title_he": "מעגל שינה והתמכרות",
        "title_en": "Sleep–Addiction Cycle",
        "source": "Compiled from studies",
        "chart_type": "line",
        "labels_he": ["טראומה", "הפרעות שינה", "עייפות וחרדה", "שימוש בחומרים", "החמרה"],
        "labels_en": ["Trauma", "Sleep Disorders", "Fatigue & Anxiety", "Substance Use", "Worsening"],
        "values": [100, 90, 85, 70, 95],
        "extra": {"y_unit": "cycle intensity"},
        "explain_he": "הגרף מציג את המעגל השלילי שבו טראומה מובילה להפרעות שינה, שימוש בחומרים והחמרה חוזרת.",
        "explain_en": "This chart illustrates the negative cycle where trauma leads to sleep issues, substance use, and further deterioration."
    }
]

TRAFFIC_ACCIDENT_DATA = [
    {
        "id": "road_accident_trend",
        "title_he": "מגמת הרוגים בתאונות דרכים בישראל (2021–2024)",
        "title_en": "Road Accident Fatalities Trend in Israel (2021–2024)",
        "source": "הלשכה המרכזית לסטטיסטיקה; אור ירוק, 2024",
        "chart_type": "line",
        "labels_he": ["2021", "2022", "2023", "2024"],
        "labels_en": ["2021", "2022", "2023", "2024"],
        "values": [364, 351, 361, 439],
        "extra": {"y_unit": "number of fatalities"},
        "explain_he": "הגרף מציג את מספר ההרוגים בתאונות דרכים בישראל בין השנים 2021–2024. לאחר ירידה קלה ב-2022, נרשמה עלייה משמעותית בשנת 2024 עם 439 הרוגים – העלייה החדה ביותר בשנים האחרונות.",
        "explain_en": "This graph shows the number of road accident fatalities in Israel between 2021–2024. After a slight decrease in 2022, there is a sharp increase in 2024, reaching 439 deaths—the most significant rise in recent years."
    },
    {
        "id": "road_accident_change",
        "title_he": "שינוי שנתי במספר ההרוגים בתאונות דרכים",
        "title_en": "Year-over-Year Change in Road Accident Fatalities",
        "source": "מבוסס על נתוני הדו\"ח",
        "chart_type": "bar",
        "labels_he": ["2022", "2023", "2024"],
        "labels_en": ["2022", "2023", "2024"],
        "values": [-3.6, 2.8, 21.6],
        "extra": {"y_unit": "percent change"},
        "explain_he": "הגרף מציג את אחוז השינוי במספר ההרוגים בכל שנה ביחס לשנה הקודמת. בשנת 2024 נרשמה עלייה חדה במיוחד של כ-21.6%, המעידה על החמרה משמעותית בבטיחות בדרכים.",
        "explain_en": "This chart presents the yearly percentage change in road fatalities. In 2024, there is a sharp increase of about 21.6%, indicating a significant deterioration in road safety."
    },
    {
        "id": "young_driver_fatalities",
        "title_he": "הרוגים בקרב נהגים צעירים (2021–2024)",
        "title_en": "Young Driver Fatalities (2021–2024)",
        "source": "אור ירוק; הלמ\"ס",
        "chart_type": "bar",
        "labels_he": ["2021", "2022", "2023", "2024 (עד יולי)"],
        "labels_en": ["2021", "2022", "2023", "2024 (partial)"],
        "values": [57, 49, 42, 46],
        "extra": {"y_unit": "number of fatalities"},
        "explain_he": "הגרף מציג את מספר הנהגים הצעירים שנהרגו בתאונות דרכים. למרות ירידה בשנים 2022–2023, הנתונים של 2024 מצביעים על עלייה מחודשת ומדאיגה.",
        "explain_en": "This chart shows fatalities among young drivers. After a decline in 2022–2023, 2024 data already indicates a worrying increase."
    },
    {
        "id": "road_total_fatalities",
        "title_he": "סך ההרוגים בתאונות דרכים (2021–2024)",
        "title_en": "Total Road Accident Fatalities (2021–2024)",
        "source": "הלמ\"ס; אור ירוק",
        "chart_type": "bar",
        "labels_he": ["סה\"כ"],
        "labels_en": ["Total"],
        "values": [1515],
        "extra": {"y_unit": "fatalities"},
        "explain_he": "בין השנים 2021–2024 נהרגו כ-1,515 בני אדם בתאונות דרכים בישראל. הנתון מדגיש את ההיקף המצטבר של התופעה.",
        "explain_en": "Between 2021–2024, approximately 1,515 people were killed in road accidents in Israel, highlighting the cumulative scale of the issue."
    },
    {
        "id": "road_distribution",
        "title_he": "התפלגות הרוגים לפי שנה",
        "title_en": "Distribution of Fatalities by Year",
        "source": "מבוסס על נתוני הדו\"ח",
        "chart_type": "pie",
        "labels_he": ["2021", "2022", "2023", "2024"],
        "labels_en": ["2021", "2022", "2023", "2024"],
        "values": [364, 351, 361, 439],
        "extra": {"total": 1515},
        "explain_he": "הגרף מציג את חלקה של כל שנה מתוך סך ההרוגים. שנת 2024 מהווה את הנתח הגדול ביותר.",
        "explain_en": "This chart shows each year's share of total fatalities. 2024 accounts for the largest portion."
    },
    {
        "id": "young_driver_share",
        "title_he": "חלקם של נהגים צעירים מכלל ההרוגים",
        "title_en": "Share of Young Drivers Among Fatalities",
        "source": "אור ירוק; הלמ\"ס",
        "chart_type": "bar",
        "labels_he": ["2021", "2022", "2023"],
        "labels_en": ["2021", "2022", "2023"],
        "values": [15.7, 14.0, 11.6],
        "extra": {"y_unit": "percent"},
        "explain_he": "נהגים צעירים מהווים שיעור גבוה יחסית מההרוגים, במיוחד בשנת 2021. למרות ירידה מסוימת, מדובר בקבוצת סיכון משמעותית.",
        "explain_en": "Young drivers represent a disproportionately high share of fatalities, especially in 2021. Despite some decline, they remain a high-risk group."
    }
]

DOMESTIC_VIOLENCE_DATA = [
    {
        "id": "domestic_violence_calls_trend",
        "title_he": "עלייה בפניות למוקדי סיוע (אלימות במשפחה)",
        "title_en": "Increase in Domestic Violence Help-Seeking",
        "source": "משרד הרווחה (מוקד 118), 2024",
        "chart_type": "line",
        "labels_he": ["לפני המלחמה", "תחילת המלחמה", "2024"],
        "labels_en": ["Pre-war", "War onset", "2024"],
        "values": [100, 135, 160],
        "extra": {"y_unit": "index (base=100)"},
        "explain_he": "נרשמה עלייה משמעותית בפניות לעזרה בעקבות מצבי לחץ לאומיים, המעידים על החרפת האלימות במשפחה.",
        "explain_en": "There is a significant increase in help-seeking following national stress events, indicating worsening domestic violence."
    },
    {
        "id": "ptsd_domestic_violence_link",
        "title_he": "קשר בין PTSD לאלימות במשפחה",
        "title_en": "Link Between PTSD and Domestic Violence",
        "source": "סקירת מחקרים",
        "chart_type": "bar",
        "labels_he": ["עם PTSD", "ללא PTSD"],
        "labels_en": ["With PTSD", "Without PTSD"],
        "values": [65, 35],
        "extra": {"y_unit": "relative risk index"},
        "explain_he": "מחקרים מצביעים על סיכון גבוה יותר להתנהגות אלימה בקרב אנשים עם PTSD.",
        "explain_en": "Research shows higher risk of violent behavior among individuals with PTSD."
    },
    {
        "id": "violence_impact_types",
        "title_he": "סוגי הפגיעה באלימות במשפחה",
        "title_en": "Types of Impact in Domestic Violence",
        "source": "ספרות מחקרית",
        "chart_type": "pie",
        "labels_he": ["פיזי", "נפשי", "כלכלי"],
        "labels_en": ["Physical", "Psychological", "Economic"],
        "values": [30, 50, 20],
        "extra": {},
        "explain_he": "הפגיעה הנפשית היא הנפוצה ביותר, אך קיימים גם היבטים פיזיים וכלכליים משמעותיים.",
        "explain_en": "Psychological harm is the most prevalent, though physical and economic impacts are also significant."
    },
    {
        "id": "reporting_barriers",
        "title_he": "חסמים לפנייה לעזרה",
        "title_en": "Barriers to Seeking Help",
        "source": "סקירת מחקרים",
        "chart_type": "bar",
        "labels_he": ["פחד", "תלות כלכלית", "בושה"],
        "labels_en": ["Fear", "Economic dependence", "Shame"],
        "values": [45, 30, 25],
        "extra": {"y_unit": "percent"},
        "explain_he": "פחד מהפוגע הוא החסם המרכזי לפנייה לעזרה.",
        "explain_en": "Fear of the abuser is the primary barrier to seeking help."
    },
    {
        "id": "children_exposure_impact",
        "title_he": "השפעת חשיפה לאלימות על ילדים",
        "title_en": "Impact of Exposure to Domestic Violence on Children",
        "source": "סקירת מחקרים",
        "chart_type": "bar",
        "labels_he": ["PTSD", "בעיות התנהגות", "קשיים לימודיים"],
        "labels_en": ["PTSD", "Behavioral issues", "Learning difficulties"],
        "values": [40, 35, 25],
        "extra": {"y_unit": "percent"},
        "explain_he": "חשיפה לאלימות משפחתית משפיעה משמעותית על התפתחות ילדים.",
        "explain_en": "Exposure to domestic violence significantly affects child development."
    }
]
