/**
 * Hardcoded bilingual (he/en) copy for the three results pages.
 * Indexed by persona → locale → emotional_state. Every emotional_state in the
 * Revamp.md schema is covered: grieving | distressed | curious | professional | neutral.
 *
 * Replaces the old English-only MOOD_COPY / HEADLINE constants so the hero and
 * section headings translate with the page locale.
 */

// Shared section headings + chrome, per persona per locale.
export const SECTION = {
  beginner: {
    en: {
      retake: 'Retake quiz', retakeAria: 'Retake the quiz', adjust: 'adjust your topics',
      storiesHead: 'Stories from people who understand',
      storiesSub: 'Real journalism from The Guardian, chosen with care.',
      owidHead: 'You are not alone in this',
      owidSub: 'Seeing how widely this is shared can make your own experience feel less isolating.',
      researchHead: 'What the research shows',
      researchSub: 'Findings on trauma in Israel, in plain terms.',
      academicHead: 'Reading, made approachable',
      academicSub: 'Research that matters, explained without the jargon.',
      ctaHead: 'There is more waiting for you',
      ctaSub: 'A curated reading list, built around your topics.',
      ctaBtn: 'See your full reading list',
      exploreHead: 'Also explore',
      readMore: 'Read more', readLess: 'Close',
      supportTitle: "If today feels heavy, you don't have to sit with it alone.",
      supportBody: "ERAN's emotional first-aid line is open any hour. Call 1201 — someone will listen.",
    },
    he: {
      retake: 'שאלון מחדש', retakeAria: 'מילוי השאלון מחדש', adjust: 'התאמת הנושאים',
      storiesHead: 'סיפורים מאנשים שמבינים',
      storiesSub: 'עיתונאות אמיתית מ-The Guardian, שנבחרה בקפידה.',
      owidHead: 'אינכם לבד בזה',
      owidSub: 'לראות עד כמה זה משותף לרבים יכול להפחית את תחושת הבדידות.',
      researchHead: 'מה המחקר מראה',
      researchSub: 'ממצאים על טראומה בישראל, בשפה פשוטה.',
      academicHead: 'קריאה, בגובה העיניים',
      academicSub: 'מחקר חשוב, מוסבר בלי ז\'רגון.',
      ctaHead: 'יש עוד שמחכה לכם',
      ctaSub: 'רשימת קריאה מותאמת, סביב הנושאים שלכם.',
      ctaBtn: 'לרשימת הקריאה המלאה',
      exploreHead: 'אפשר גם לחקור',
      readMore: 'קרא עוד', readLess: 'סגור',
      supportTitle: 'אם היום מרגיש כבד, אתם לא צריכים לשאת אותו לבד.',
      supportBody: 'קו הסיוע הרגשי של ער"ן פתוח בכל שעה. חייגו 1201 — מישהו יקשיב.',
    },
  },
  informed: {
    en: {
      retake: 'Retake quiz', retakeAria: 'Retake the quiz',
      storiesHead: 'Human accounts',
      storiesSub: 'Reporting from The Guardian on the people behind the data.',
      owidHead: 'The wider picture',
      owidSub: 'How trauma and mental health appear across populations.',
      researchHead: 'The evidence from Israel',
      researchSub: 'Key findings on trauma exposure and resilience after October 7.',
      academicHead: 'Selected research',
      academicSub: 'Peer-reviewed work matched to your topics.',
      academicEmpty: 'No articles yet — complete the quiz to build your reading list.',
      readMore: 'Read more', readLess: 'Close',
    },
    he: {
      retake: 'שאלון מחדש', retakeAria: 'מילוי השאלון מחדש',
      storiesHead: 'עדויות אנושיות',
      storiesSub: 'כתבות מ-The Guardian על האנשים שמאחורי הנתונים.',
      owidHead: 'התמונה הרחבה',
      owidSub: 'כיצד טראומה ובריאות הנפש מופיעות באוכלוסיות שונות.',
      researchHead: 'הממצאים מישראל',
      researchSub: 'ממצאים מרכזיים על חשיפה לטראומה וחוסן לאחר 7 באוקטובר.',
      academicHead: 'מחקר נבחר',
      academicSub: 'עבודה שעברה ביקורת עמיתים, מותאמת לנושאים שלכם.',
      academicEmpty: 'עדיין אין מאמרים — השלימו את השאלון כדי לבנות את רשימת הקריאה.',
      readMore: 'קרא עוד', readLess: 'סגור',
    },
  },
  researcher: {
    en: {
      retake: 'Retake quiz', retakeAria: 'Retake the quiz',
      storiesHead: 'Field reporting',
      storiesSub: 'Journalistic context from The Guardian.',
      owidHead: 'Epidemiology · OWID',
      owidSub: 'Cross-country prevalence series.',
      researchHead: 'Israel cohort data',
      researchSub: 'Population-level findings (Mor et al., 2026; N=1,647).',
      academicHead: 'Matched articles',
      academicSub: 'Sorted by relevance.',
      academicEmpty: 'No matched articles yet — complete the quiz to populate this set.',
      readMore: 'Read more', readLess: 'Close',
    },
    he: {
      retake: 'שאלון מחדש', retakeAria: 'מילוי השאלון מחדש',
      storiesHead: 'כתבות שטח',
      storiesSub: 'הקשר עיתונאי מ-The Guardian.',
      owidHead: 'אפידמיולוגיה · OWID',
      owidSub: 'נתוני שכיחות בין-מדינתיים.',
      researchHead: 'נתוני מדגם ישראלי',
      researchSub: 'ממצאים ברמת האוכלוסייה (Mor et al., 2026; N=1,647).',
      academicHead: 'מאמרים מותאמים',
      academicEmpty: 'עדיין אין מאמרים מותאמים — השלימו את השאלון כדי לאכלס את הרשימה.',
      academicSub: 'ממוינים לפי רלוונטיות.',
      readMore: 'קרא עוד', readLess: 'סגור',
    },
  },
}

// Hero copy per persona → locale → emotional_state.
export const HERO = {
  beginner: {
    en: {
      grieving: {
        eyebrow: 'A gentle place to understand',
        headline: 'Understanding what your loved one carried — at your own pace.',
        subcopy: "There is no right way to do this, and no timeline. We've gathered stories and findings that may help you make sense of what they lived through. Take what helps. Leave the rest.",
      },
      distressed: {
        eyebrow: "You're in a safe place",
        headline: "Take a breath. We'll go gently, together.",
        subcopy: "There's nothing you need to do right now. When you're ready, a few stories and findings are here — and they'll wait for you. There is no rush at all.",
      },
      curious: {
        eyebrow: 'A place to explore, at your pace',
        headline: 'Making sense of this — one story at a time.',
        subcopy: "You don't need any background to begin. We've gathered stories and findings to help you understand what so many people are living through. Follow whatever draws you in.",
      },
      professional: {
        eyebrow: 'A clear starting point',
        headline: 'A grounded introduction to trauma in Israel.',
        subcopy: 'Accessible stories and clear findings, gathered so you can build a working understanding before going deeper.',
      },
      neutral: {
        eyebrow: 'A place to begin',
        headline: 'Understanding trauma in Israel — at your own pace.',
        subcopy: "We've gathered human stories and clear findings to help you make sense of it. Take what's useful, and explore at whatever pace feels right.",
      },
    },
    he: {
      grieving: {
        eyebrow: 'מקום עדין להבין בו',
        headline: 'להבין את מה שיקיריכם נשאו — בקצב שלכם.',
        subcopy: 'אין דרך נכונה אחת ואין לוח זמנים. אספנו סיפורים וממצאים שעשויים לעזור להבין את מה שהם עברו. קחו את מה שמועיל, והשאירו את השאר.',
      },
      distressed: {
        eyebrow: 'אתם במקום בטוח',
        headline: 'קחו נשימה. נתקדם בעדינות, יחד.',
        subcopy: 'אין שום דבר שאתם צריכים לעשות עכשיו. כשתהיו מוכנים, כמה סיפורים וממצאים מחכים כאן — והם יחכו לכם. אין שום מיהירות.',
      },
      curious: {
        eyebrow: 'מקום לחקור בו, בקצב שלכם',
        headline: 'להבין את זה — סיפור אחר סיפור.',
        subcopy: 'אין צורך בידע מוקדם כדי להתחיל. אספנו סיפורים וממצאים שיעזרו להבין את מה שכל כך הרבה אנשים חווים. עקבו אחרי מה שמושך אתכם.',
      },
      professional: {
        eyebrow: 'נקודת התחלה ברורה',
        headline: 'מבוא מבוסס לטראומה בישראל.',
        subcopy: 'סיפורים נגישים וממצאים ברורים, שנאספו כדי לבנות הבנה בסיסית לפני העמקה.',
      },
      neutral: {
        eyebrow: 'מקום להתחיל בו',
        headline: 'להבין טראומה בישראל — בקצב שלכם.',
        subcopy: 'אספנו סיפורים אנושיים וממצאים ברורים שיעזרו להבין. קחו את מה שמועיל, וחקרו בקצב שנוח לכם.',
      },
    },
  },
  informed: {
    en: {
      grieving: {
        eyebrow: 'Both the human story and the evidence',
        headline: 'This is personal as well as factual. Here is the human side, and the evidence.',
      },
      distressed: {
        eyebrow: 'Steady, at your own pace',
        headline: 'The stories and the evidence — when you are ready for them.',
      },
      curious: {
        eyebrow: 'Stories and evidence, side by side',
        headline: 'A balanced look at trauma — the accounts and the research together.',
      },
      professional: {
        eyebrow: 'For practitioners and informed readers',
        headline: 'The human story and the evidence behind it, organised for you.',
      },
      neutral: {
        eyebrow: 'A balanced view',
        headline: 'Trauma in Israel — the stories and the research, side by side.',
      },
    },
    he: {
      grieving: {
        eyebrow: 'גם הסיפור האנושי וגם העדויות',
        headline: 'זה אישי לא פחות מאשר עובדתי. הנה הצד האנושי, והעדויות.',
      },
      distressed: {
        eyebrow: 'בנחת, בקצב שלכם',
        headline: 'הסיפורים והעדויות — כשתהיו מוכנים אליהם.',
      },
      curious: {
        eyebrow: 'סיפורים ועדויות זה לצד זה',
        headline: 'מבט מאוזן על טראומה — העדויות והמחקר יחד.',
      },
      professional: {
        eyebrow: 'לאנשי מקצוע ולקוראים מתעניינים',
        headline: 'הסיפור האנושי והעדויות שמאחוריו, מסודרים עבורכם.',
      },
      neutral: {
        eyebrow: 'מבט מאוזן',
        headline: 'טראומה בישראל — הסיפורים והמחקר, זה לצד זה.',
      },
    },
  },
  researcher: {
    en: {
      grieving: { headline: 'The science behind what you are going through, gathered for you.' },
      distressed: { headline: 'The evidence base on conflict trauma — available when you need it.' },
      curious: { headline: 'Dig into the peer-reviewed record on conflict trauma and PTSD.' },
      professional: { headline: 'The evidence base for trauma in conflict — organised for research.' },
      neutral: { headline: 'Peer-reviewed research on trauma and mental health — curated for you.' },
    },
    he: {
      grieving: { headline: 'המדע שמאחורי מה שאתם עוברים, נאסף עבורכם.' },
      distressed: { headline: 'בסיס הראיות על טראומת לחימה — זמין כשתצטרכו אותו.' },
      curious: { headline: 'צללו אל הספרות שעברה ביקורת עמיתים על טראומת לחימה ו-PTSD.' },
      professional: { headline: 'בסיס הראיות לטראומה בלחימה — מאורגן למחקר.' },
      neutral: { headline: 'מחקר שעבר ביקורת עמיתים על טראומה ובריאות הנפש — נאסף עבורכם.' },
    },
  },
}

const FALLBACK_MOOD = { beginner: 'neutral', informed: 'neutral', researcher: 'neutral' }

export function getHero(persona, locale, mood) {
  const loc = locale === 'he' ? 'he' : 'en'
  const table = (HERO[persona] || HERO.beginner)[loc]
  return table[mood] || table[FALLBACK_MOOD[persona] || 'neutral']
}

export function getSection(persona, locale) {
  const loc = locale === 'he' ? 'he' : 'en'
  return (SECTION[persona] || SECTION.beginner)[loc]
}
