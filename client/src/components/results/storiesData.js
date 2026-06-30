/**
 * Curated personal stories for the results page.
 *
 * These REPLACE the live Guardian API fetch. Every entry is a REAL, published
 * article that was reviewed by hand for: genuine personal/human-interest content,
 * a reputable + appropriately-framed source, and a recovery-respectful tone.
 * Nothing here is invented.
 *
 * Bilingual fields:
 *   - For Hebrew-original articles, *_he is the source text (verbatim headline,
 *     faithfully condensed summary) and *_en is a careful human translation.
 *   - For English-original articles it is the reverse.
 * The `url` always points to the real article in its original language.
 *
 * Shape (consumed by the Guardian-style story cards after locale selection):
 *   { id, source, date, url, thumbnail,
 *     headline_he, headline_en, summary_he, summary_en, origin_lang }
 * Stories are hard-coded (not fetched), so there is no per-topic matching — the
 * results page just shows them by persona / content-preference count.
 */

export const CURATED_STORIES = [
  {
    id: 'story-yosef-officer-ptsd',
    source: 'Ynet',
    date: '2024-10-06',
    url: 'https://www.ynet.co.il/news/article/bjy7ni6ac',
    thumbnail:
      'https://ynet-pic1.yit.co.il/cdn-cgi/image/f=auto,w=740,q=75/picserver5/crop_images/2024/09/17/H1tkSBwaC/H1tkSBwaC_0_0_850_190_0_x-large.jpg',
    origin_lang: 'he',
    headline_he: 'חזרתי הביתה והבנתי מהי פוסט-טראומה. בנפש אני שם, בעוטף',
    headline_en:
      "I came home and understood what post-trauma is. In my soul, I'm still there, on the Gaza border",
    summary_he:
      'קצין קרבי בקבע שהוקפץ לעוטף בבוקר 7 באוקטובר מתאר את המחיר הנפשי שבא אחר כך — פלשבקים, סיוטים והתרחקות מהמשפחה והילדים — ואת דרכו אל הטיפול ואל שבירת מחסום הבושה בפנייה לעזרה נפשית.',
    summary_en:
      'A career combat officer called up to the Gaza-border communities on the morning of October 7 describes the emotional toll that followed — flashbacks, nightmares, and growing distance from his wife and children — and his path into treatment and toward breaking the stigma around seeking psychological help.',
  },
  {
    id: 'story-yuval-bennun-medic-ptsd',
    source: 'IDF',
    date: '2025-10-07',
    url: 'https://www.idf.il/אתרי-יחידות/שנתיים-למלחמה/שנתיים-למלחמה/יובל-לומד-לחיות-לצד-הפוסט-טראומה/',
    thumbnail:
      'https://www.idf.il/media/wjtl5jno/עותק-של-itayshaked-wounded_project-1-3.jpg',
    origin_lang: 'he',
    headline_he:
      'יובל לומד לחיות לצד הפוסט-טראומה: "הפלאשבקים לא עוזבים, ועדיין החלטתי לא לשתוק - בשביל מתמודדי הנפש"',
    headline_en:
      "Yuval is learning to live alongside post-trauma: 'The flashbacks don't leave — and still I chose not to stay silent, for others living with mental-health struggles'",
    summary_he:
      'יובל בן נון, לוחם וחובש צנחנים לשעבר ומתמודד נפש מאז 7 באוקטובר, בחר לספר את סיפורו כדי לשבור את השתיקה. הוא מתאר את ההתמודדות עם פלאשבקים וחרדה, את אובדן אחיו התאום סגן שחר בן נון ז"ל, ואת הדרך שבה טיפול וכלב השירות שלו רג\'י עוזרים לו ללמוד לחיות לצד הפוסט-טראומה — עם תקווה ומסר למתמודדים אחרים.',
    summary_en:
      'Yuval Ben Nun, a former paratrooper combat medic living with PTSD since October 7, chose to share his story to break the silence. He describes coping with flashbacks and anxiety, the loss of his twin brother Lt. Shahar Ben Nun, and how treatment and his service dog Reggie help him learn to live alongside post-trauma — ending with hope and a message for others who are struggling.',
  },
  {
    id: 'story-lisa-zarnik-rehab',
    source: 'IDF',
    date: '2025-10-07',
    url: 'https://www.idf.il/אתרי-יחידות/שנתיים-למלחמה/שנתיים-למלחמה/הלידה-מחדש-של-ליזה/',
    thumbnail:
      'https://www.idf.il/media/e5omuvqp/עותק-של-itayshaked-wounded_project-3876.jpg',
    origin_lang: 'he',
    headline_he:
      'הלידה מחדש של ליזה: "כאב לי, בכיתי, אבל היה תהליך טוב. במצב קיצון כזה - אין לך ברירה"',
    headline_en:
      "Lisa's rebirth: 'It hurt, I cried, but it was a good process. In an extreme situation like that — you have no choice'",
    summary_he:
      'ליזה בזרניק, טכנאית רשתות שנפצעה מפצמ"ר של חיזבאללה סמוך לגבול לבנון, מספרת על מסע השיקום שלה בתוכנית \'חוזרים לחיים\' בבית החולים שיבא — ניתוחים, חזרה לביטחון העצמי ולגוף, והכוח שמצאה בפילאטיס ובקהילת נכי צה"ל. היא בוחרת לספר את סיפורה בתנאים שלה, ורואה בפציעה \'סוג של לידה מחדש\'.',
    summary_en:
      "Lisa Zarnik, a network technician wounded by a Hezbollah rocket near the Lebanon border, describes her rehabilitation in Sheba Hospital's 'Returning to Life' program — surgeries, rebuilding her confidence and her relationship with her body, and the strength she found in Pilates and in the community of IDF wounded. She tells her story on her own terms, and sees her injury as 'a kind of rebirth.'",
  },
  {
    id: 'story-avital-shapira-daughter-ptsd',
    source: 'HaGesher',
    date: '2023-11-30',
    url: 'https://ha-gesher.co.il/הסיפור-של-אביטל-שפירא-נשים-עם-פוסט-טראו/',
    thumbnail: '',
    origin_lang: 'he',
    headline_he: 'הסיפור של אביטל שפירא: הבת שלי עם פוסט טראומה',
    headline_en: "Avital Shapira's story: my daughter is living with PTSD",
    summary_he:
      'אביטל שפירא מספרת על בתה, קצינה צעירה בצה"ל שקרסה תחת רצף אירועים טראומטיים ואובחנה עם פוסט-טראומה צבאית. אחרי שנים של טיפול והתמודדות עם החמרה, אביטל הפכה את הכאב למעשה — והקימה עמותה שמלווה נשים שחוו אירועים טראומטיים בשירותן בכוחות הביטחון, מצוקה שלדבריה נמצאת "מתחת לראדר".',
    summary_en:
      "Avital Shapira tells the story of her daughter, a young IDF officer who broke down under a relentless series of traumatic events and was diagnosed with military PTSD. After years of treatment and a painful relapse, Avital turned her pain into action — founding an organization to support women who experienced trauma during their security-forces service, a struggle she says flies 'under the radar.'",
  },
]

/**
 * Map a curated story to the card-ready shape for the active locale. Called in
 * the card render so toggling the language updates the stories live.
 */
export function localizeStory(s, locale) {
  const he = locale === 'he'
  return {
    headline: he ? s.headline_he : s.headline_en,
    summary: he ? s.summary_he : s.summary_en,
    thumbnailUrl: s.thumbnail || '',
    date: s.date,
    url: s.url,
    source: s.source,
  }
}
