/**
 * UI copy for quiz and shared screens — one language at a time (he | en) from page dir.
 */
const STRINGS = {
  he: {
    serverDownTitle: 'השרת אינו זמין כרגע',
    serverDownBody:
      'אנחנו לא מצליחים להתחבר לשרת. ודאו שהמערכת פועלת (פורט 5500) ונסו שוב.',
    serverDownRetry: 'נסו שוב',
    quizChecking: 'בודקים חיבור לשרת…',
    quizTitle: 'שאלון מודרך',
    quizSubtitle: 'ענו בשקט ובקצב שנוח לכם — אין תשובה נכונה או לא נכונה.',
    progressLabel: 'התקדמות',
    chatAriaLabel: 'שיחת השאלון',
    answerLabel: 'תשובה',
    placeholder: 'כתבו כאן את תשובתכם…',
    send: 'שליחה',
    dismiss: 'סגירה',
    retry: 'נסו שוב',
    errorRateLimit: 'שלחת יותר מדי הודעות, נסה שוב עוד קצת',
    errorMessageTooLong: 'ההודעה ארוכה מדי — עד 1000 תווים',
    errorGeneric: 'משהו השתבש. נסו שוב בעוד רגע.',
    navBrand: 'טראומה בישראל',
    navQuiz: 'שאלון',
    navContent: 'תוכן',
    navDonate: 'תרומה',
    navLanguageGroup: 'בחירת שפה',
    navMain: 'ניווט ראשי',
    navLangHe: 'עברית',
    navLangEn: 'English',
  },
  en: {
    serverDownTitle: 'The server is unavailable',
    serverDownBody:
      "We can't reach the learning server right now. Make sure the backend is running on port 5500, then try again.",
    serverDownRetry: 'Retry',
    quizChecking: 'Checking server connection…',
    quizTitle: 'Guided questionnaire',
    quizSubtitle: 'Answer gently and at your own pace — there are no wrong answers.',
    progressLabel: 'Progress',
    chatAriaLabel: 'Quiz conversation',
    answerLabel: 'Your answer',
    placeholder: 'Type your answer here…',
    send: 'Send',
    dismiss: 'Close',
    retry: 'Retry',
    errorRateLimit: 'Too many messages, please wait a little while',
    errorMessageTooLong: 'Message too long — maximum 1000 characters',
    errorGeneric: 'Something went wrong. Please try again.',
    navBrand: 'Trauma in Israel',
    navQuiz: 'Quiz',
    navContent: 'Content',
    navDonate: 'Donate',
    navLanguageGroup: 'Choose language',
    navMain: 'Main navigation',
    navLangHe: 'עברית',
    navLangEn: 'English',
  },
}

export function getUiStrings(dirOrLocale) {
  if (dirOrLocale === 'he' || dirOrLocale === 'en') {
    return STRINGS[dirOrLocale]
  }
  return STRINGS[dirOrLocale === 'rtl' ? 'he' : 'en']
}
