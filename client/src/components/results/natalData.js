/**
 * Hardcoded research data drawn from:
 * Mor, Reuveni & Tuval-Mashiach (2026), "Nation under pressure: examining
 * widespread trauma exposure and resilience in Israel", European Journal of
 * Psychotraumatology, 17(1), 2659423. https://doi.org/10.1080/20008066.2026.2659423
 * (plus the prevalence figures it cites: Katsoty et al. 2024; Shapira et al. 2025).
 *
 * Every number below appears in that paper. Nothing is invented. Used by the
 * results page only — the /graphs/* pages have their own separate datasets.
 *
 * Chart objects follow the SAME schema as the graph pages:
 *   { id, chart_type, title_he, title_en, labels_he, labels_en, values,
 *     source, explain_he, explain_en, extra? }
 * Text blocks are gentle, prose-style stat callouts for low-data personas:
 *   { id, stat, label_he, label_en, body_he, body_en, source }
 */

// ── CHARTS (data-leaning personas) ───────────────────────────────────────────
export const NATAL_CHARTS = [
  {
    id: 'natal-ptsd-youth-surge',
    chart_type: 'natal_bar',
    title_he: 'PTSD משוער בגיל 18–24: לפני ואחרי 7 באוקטובר',
    title_en: 'Probable PTSD in ages 18–24: before vs. after Oct 7',
    labels_he: ['לפני 7/10', 'אחרי 7/10'],
    labels_en: ['Before Oct 7', 'After Oct 7'],
    values: [25.2, 43.3],
    source: 'Shapira et al., 2025 (cited in Mor et al., 2026)',
    explain_he:
      'שכיחות ה-PTSD המשוער בקבוצת הגיל 18–24 עלתה מ-25.2% לפני המתקפה ל-43.3% בחודשים שלאחריה. קבוצת גיל זו זוהתה כפגיעה במיוחד.',
    explain_en:
      'Probable PTSD in the 18–24 age group rose from 25.2% before the attack to 43.3% in the months after. This age group was identified as uniquely vulnerable.',
  },
  {
    id: 'natal-ptsd-population',
    chart_type: 'natal_stat_ring',
    title_he: 'הערכת PTSD באוכלוסייה הישראלית',
    title_en: 'Estimated PTSD across the Israeli population',
    labels_he: ['צפויים לפתח PTSD', 'שאר האוכלוסייה'],
    labels_en: ['Predicted to develop PTSD', 'Rest of population'],
    values: [5.3, 94.7],
    source: 'Katsoty et al., 2024 (cited in Mor et al., 2026)',
    explain_he:
      'מודל חיזוי העריך שכ-5.3% מהאוכלוסייה (כ-520,000 איש; טווח 160,000–881,000) עשויים לפתח PTSD בעקבות מתקפת 7 באוקטובר והמלחמה.',
    explain_en:
      'A predictive model estimated that about 5.3% of the population (~520,000 people; range 160,000–881,000) may develop PTSD following the October 7 attack and the war.',
  },
  {
    id: 'natal-exposure-rates',
    chart_type: 'natal_hbar',
    title_he: 'חשיפה לאירועים טראומטיים הקשורים למלחמה (כלל המדגם)',
    title_en: 'Exposure to war-related traumatic events (full sample)',
    labels_he: [
      'איום ירי רקטות',
      'בני משפחה בשירות צבאי',
      'חשיפה לתמונות קשות',
      'משפחה/חברים שנחטפו/נעדרים/נהרגו',
      'אובדן הכנסה / מצוקה כלכלית',
      'בן משפחה/חבר נפצע קשה',
    ],
    labels_en: [
      'Rocket fire threat',
      'Family in military duty',
      'Exposure to distressing images',
      'Family/friends kidnapped, missing or killed',
      'Income loss / economic hardship',
      'Family/close friend seriously injured',
    ],
    values: [50.5, 34.0, 29.6, 15.0, 13.2, 11.3],
    source: 'Mor et al., 2026 — Table 2 (N=1,647)',
    explain_he:
      'כ-60% מהמשתתפים חוו לפחות גורם דחק אחד הקשור למלחמה. איום ירי הרקטות היה הנפוץ ביותר, ולאחריו חשיפה עקיפה דרך תמונות קשות בתקשורת.',
    explain_en:
      'About 60% of participants experienced at least one war-related stressor. Rocket-fire threat was the most common, followed by indirect exposure through distressing media images.',
  },
  {
    id: 'natal-clusters',
    chart_type: 'natal_cluster',
    title_he: 'ארבעה פרופילים פסיכולוגיים (ניתוח אשכולות)',
    title_en: 'Four psychological profiles (cluster analysis)',
    labels_he: [
      'לא מושפעים (25.3%)',
      'מודאגים לאומית (26.2%)',
      'פגיעים (19.6%)',
      'חסונים (28.8%)',
    ],
    labels_en: [
      'Unaffected (25.3%)',
      'Nationally scared (26.2%)',
      'Vulnerable (19.6%)',
      'Resilient (28.8%)',
    ],
    values: [25.3, 26.2, 19.6, 28.8],
    source: 'Mor et al., 2026 — k-means clustering (N=1,647)',
    explain_he:
      'ניתוח אשכולות זיהה ארבעה פרופילים נפרדים. האשכול ה"פגיע" שילב את רמות המצוקה הגבוהות ביותר עם החוסן הנמוך ביותר; האשכול ה"חסון" הציג את המצוקה הנמוכה ביותר לצד חוסן גבוה.',
    explain_en:
      'Cluster analysis identified four distinct profiles. The "vulnerable" cluster combined the highest distress with the lowest resilience; the "resilient" cluster showed the lowest distress alongside high resilience.',
  },
  {
    id: 'natal-danger-by-cluster',
    chart_type: 'natal_bar',
    title_he: 'תחושת סכנה לפי אשכול (ציון ממוצע 1–5)',
    title_en: 'Sense of danger by cluster (mean score, 1–5)',
    labels_he: ['חסונים', 'פגיעים'],
    labels_en: ['Resilient', 'Vulnerable'],
    values: [2.76, 4.06],
    source: 'Mor et al., 2026 — Table 5',
    explain_he:
      'תחושת הסכנה עלתה באופן מונוטוני מהאשכול החסון (2.76) לאשכול הפגיע (4.06) — פער של 1.3 נקודות (Hedges g≈2.0), אחד ההבדלים החזקים בין הקבוצות.',
    explain_en:
      'Sense of danger rose monotonically from the resilient cluster (2.76) to the vulnerable cluster (4.06) — a 1.3-point gap (Hedges g≈2.0), one of the strongest differences between the groups.',
  },
  {
    id: 'natal-resilience-protective',
    chart_type: 'natal_hbar',
    title_he: 'חשיפה לאירועים — אשכול פגיע מול אשכול חסון',
    title_en: 'Event exposure — vulnerable vs. resilient cluster',
    labels_he: [
      'איום ירי רקטות',
      'חשיפה לתמונות קשות',
      'אובדן הכנסה / מצוקה כלכלית',
      'משפחה/חברים שנחטפו/נעדרים/נהרגו',
    ],
    labels_en: [
      'Rocket fire threat',
      'Exposure to distressing images',
      'Income loss / economic hardship',
      'Family/friends kidnapped, missing or killed',
    ],
    values: [72.4, 53.0, 28.5, 32.2],
    source: 'Mor et al., 2026 — Table 2 (Cluster 3, vulnerable)',
    explain_he:
      'האשכול הפגיע הציג שכיחות חשיפה גבוהה משמעותית כמעט בכל האירועים — למשל 72.4% לאיום ירי רקטות ו-53% לחשיפה לתמונות קשות, לעומת שיעורים נמוכים בהרבה באשכול החסון.',
    explain_en:
      'The vulnerable cluster showed markedly higher exposure across nearly every event — e.g. 72.4% for rocket-fire threat and 53% for distressing images — versus much lower rates in the resilient cluster.',
  },
]

// ── TEXT STAT BLOCKS (low-data personas) ─────────────────────────────────────
export const NATAL_TEXT_BLOCKS = [
  {
    id: 'txt-collective',
    stat: '40,000',
    label_he: 'נחשפו ישירות לאירועי 7 באוקטובר',
    label_en: 'directly exposed to the October 7 events',
    body_he:
      'מתקפת 7 באוקטובר יצרה טראומה קולקטיבית רחבה. כ-40,000 איש נחשפו ישירות לאירועים, לצד מיליונים שחוו אותם דרך ירי רקטות וחשיפה עקיפה בתקשורת.',
    body_en:
      'The October 7 attack created a wide collective trauma. About 40,000 people were directly exposed to the events, alongside millions who experienced them through rocket fire and indirect media exposure.',
    source: 'Katsoty et al., 2024; United Nations, 2024',
  },
  {
    id: 'txt-doubled',
    stat: '×2',
    label_he: 'שיעורי PTSD, דיכאון וחרדה הוכפלו אחרי 7/10',
    label_en: 'PTSD, depression and anxiety roughly doubled after Oct 7',
    body_he:
      'מחקרים מצאו שתסמיני המצוקה זינקו חודש לאחר המתקפה, וששכיחות ה-PTSD, הדיכאון והחרדה הוכפלה לעומת התקופה שלפניה.',
    body_en:
      'Studies found that distress symptoms spiked one month after the attack, and that the prevalence of PTSD, depression and anxiety doubled compared with the period before it.',
    source: 'Levi-Belz et al., 2024',
  },
  {
    id: 'txt-resilience',
    stat: '28.8%',
    label_he: 'נמצאו בפרופיל ה"חסון" — מצוקה נמוכה וחוסן גבוה',
    label_en: 'fell into the "resilient" profile — low distress, high resilience',
    body_he:
      'לצד המצוקה, החברה הישראלית הפגינה חוסן ניכר. כמעט שליש מהמשתתפים סווגו כחסונים, עם רמות החוסן האישי, הקהילתי והלאומי הגבוהות ביותר.',
    body_en:
      'Alongside the distress, Israeli society showed considerable resilience. Almost a third of participants were classified as resilient, with the highest levels of personal, community and national resilience.',
    source: 'Mor et al., 2026',
  },
  {
    id: 'txt-who-vulnerable',
    stat: '',
    label_he: 'מי נמצא בסיכון הגבוה ביותר',
    label_en: 'Who is at highest risk',
    body_he:
      'הקבוצה הפגיעה ביותר כללה יותר נשים, צעירים ובעלי הכנסה נמוכה. גורמים אלה — מגדר נשי, גיל צעיר ומצב סוציו-אקונומי נמוך — מזוהים בספרות כגורמי סיכון מרכזיים למצוקה פוסט-טראומטית.',
    body_en:
      'The most vulnerable group included more women, young adults and lower-income individuals. These factors — female gender, young age and low socioeconomic status — are identified in the literature as key risk factors for post-trauma distress.',
    source: 'Mor et al., 2026',
  },
  {
    id: 'txt-secondary',
    stat: '35%',
    label_he: 'נחשפו לתמונות קשות בתקשורת ובמדיה החברתית',
    label_en: 'were exposed to distressing images in news and social media',
    body_he:
      'גם מי שלא היה בזירת האירועים נפגע. ההפצה הרחבה של תיעוד גרפי יצרה חשיפה חברתית מתמשכת והעלתה את הסיכון לטראומה משנית בקנה מידה רחב.',
    body_en:
      'Even those who were not at the scene were affected. The wide spread of graphic footage created a pervasive societal exposure and raised the risk of secondary trauma on a large scale.',
    source: 'Gewirtz-Meydan & Lazar, 2025',
  },
  {
    id: 'txt-help',
    stat: '',
    label_he: 'חוסן הוא לא היעדר מצוקה',
    label_en: 'Resilience is not the absence of distress',
    body_he:
      'החוקרים מדגישים שחוסן אינו אומר היעדר כאב, אלא היכולת לתפקד לצד הקושי. גם מי שמתפקד היטב עשוי לשאת מצוקה סמויה — ולכן פנייה לעזרה לגיטימית בכל שלב.',
    body_en:
      'The researchers stress that resilience does not mean an absence of pain, but the capacity to function alongside it. Even people who function well may carry hidden distress — so reaching out for help is valid at any stage.',
    source: 'Bonanno, 2012 (in Mor et al., 2026)',
  },
]

/**
 * Pick the first n items from a list (no backfill, no wraparound).
 */
export function pick(list, n) {
  return Array.isArray(list) ? list.slice(0, Math.max(0, n)) : []
}

/**
 * Content counts per content_preference. Same table for all three personas.
 * { guardian, owid, natalCharts, academic }
 *
 * NOTE: the `guardian` count is intentionally IGNORED for the researcher persona.
 * ResultsPage.jsx does not fetch Guardian stories for researchers, and
 * ResearcherResults renders no Guardian section — researcher is a data-first view.
 * The count is kept here for beginner/informed, which DO render Guardian.
 */
export const PREF_COUNTS = {
  stories:  { guardian: 6, owid: 2, natalCharts: 4, academic: 2 },
  mixed:    { guardian: 3, owid: 3, natalCharts: 4, academic: 4 },
  research: { guardian: 2, owid: 2, natalCharts: 6, academic: 4 },
}

export function getPrefCounts(pref) {
  return PREF_COUNTS[pref] || PREF_COUNTS.mixed
}
