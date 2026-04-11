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
