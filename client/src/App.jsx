import { useEffect, useMemo, useState } from 'react'
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import './App.css'

const API_BASE = 'http://localhost:5500'
const USER_ID_KEY = 'trauma_user_id'
const UI_LANG_KEY = 'trauma_ui_lang'

const HE_HEBREW = 'he'
const ENGLISH = 'en'

const TEXT = {
  [HE_HEBREW]: {
    navTitle: 'טראומה בישראל',
    navQuiz: 'שאלון',
    navResults: 'תוכן מותאם',
    donate: 'תרומה',
    quizTitle: 'שאלון פתיחה קצר',
    quizSubtitle:
      'המטרה היא להתאים את התוכן לרמת הידע שלך. עונים בקצרה ובשפה שנוחה לך.',
    inputLabel: 'התשובה שלך',
    placeholder: 'כתבו כאן תשובה...',
    send: 'שליחה',
    sending: 'שולח...',
    chars: 'תווים',
    healthError: 'כרגע לא הצלחנו להתחבר לשרת. נסו שוב בעוד רגע.',
    healthRetry: 'בדיקה מחדש',
    tooMany: 'שלחת יותר מדי הודעות, נסה שוב עוד קצת',
    tooLong: 'ההודעה ארוכה מדי — עד 1000 תווים',
    genericError: 'משהו השתבש. אפשר לנסות שוב.',
    retry: 'נסה שוב',
    progress: 'התקדמות',
    restoreLoading: 'בודקים אם יש תוצאה קיימת...',
    noResultYet: 'עוד לא קיימת תוצאה. אפשר להמשיך את השאלון.',
    resultsLoading: 'טוען תוכן מותאם...',
    resultError: 'לא הצלחנו לטעון את התוצאה. נסו לרענן.',
    retake: 'ביצוע שאלון מחדש',
  },
  [ENGLISH]: {
    navTitle: 'Trauma in Israel',
    navQuiz: 'Quiz',
    navResults: 'Adaptive Content',
    donate: 'Donate',
    quizTitle: 'Short Opening Quiz',
    quizSubtitle:
      'We use your answers to match content depth and tone to your needs.',
    inputLabel: 'Your answer',
    placeholder: 'Type your answer...',
    send: 'Send',
    sending: 'Sending...',
    chars: 'characters',
    healthError: 'We cannot reach the server right now. Please try again.',
    healthRetry: 'Try again',
    tooMany: 'Too many messages, please wait',
    tooLong: 'Message too long — max 1000 characters',
    genericError: 'Something went wrong. Please retry.',
    retry: 'Retry',
    progress: 'Progress',
    restoreLoading: 'Checking for existing score...',
    noResultYet: 'No final score yet. You can continue the quiz.',
    resultsLoading: 'Loading adaptive content...',
    resultError: 'Unable to load result. Please refresh and try again.',
    retake: 'Retake quiz',
  },
}

function makeUserId() {
  return `u_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function detectLang(value) {
  if (/[\u0590-\u05FF]/.test(value)) return HE_HEBREW
  if (/[A-Za-z]/.test(value)) return ENGLISH
  return null
}

function getOrCreateUserId() {
  const existing = localStorage.getItem(USER_ID_KEY)
  if (existing) return existing
  const newId = makeUserId()
  localStorage.setItem(USER_ID_KEY, newId)
  return newId
}

function setDocumentLanguage(lang) {
  document.documentElement.dir = lang === HE_HEBREW ? 'rtl' : 'ltr'
  document.documentElement.lang = lang
}

async function safeJson(response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

function NavBar({ lang }) {
  const t = TEXT[lang]
  return (
    <header className="navbar">
      <div className="brand">{t.navTitle}</div>
      <nav className="nav-links">
        <Link to="/">{t.navQuiz}</Link>
        <Link to="/results">{t.navResults}</Link>
      </nav>
      <button type="button" className="donate-btn">
        {t.donate}
      </button>
    </header>
  )
}

function QuizPage({ lang, setLang }) {
  const navigate = useNavigate()
  const t = TEXT[lang]
  const [userId, setUserId] = useState('')
  const [healthState, setHealthState] = useState('loading')
  const [restoreState, setRestoreState] = useState('loading')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [progress, setProgress] = useState({ step: 0, total: 1 })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem(UI_LANG_KEY)
    if (savedLang === HE_HEBREW || savedLang === ENGLISH) {
      setLang(savedLang)
    }
    const uid = getOrCreateUserId()
    setUserId(uid)
  }, [setLang])

  useEffect(() => {
    setDocumentLanguage(lang)
  }, [lang])

  const checkHealthAndRestore = async () => {
    setHealthState('loading')
    setRestoreState('loading')
    setError('')
    try {
      const healthRes = await fetch(`${API_BASE}/health`)
      if (!healthRes.ok) throw new Error('health failed')
      setHealthState('ok')

      const uid = getOrCreateUserId()
      setUserId(uid)
      const resultRes = await fetch(`${API_BASE}/result/${uid}`)
      if (resultRes.ok) {
        const data = await safeJson(resultRes)
        if (typeof data.score === 'number') {
          navigate('/results', { state: { score: data.score, userId: uid } })
          return
        }
      }
      setRestoreState('ok')
      setMessages([
        {
          role: 'assistant',
          text:
            lang === HE_HEBREW
              ? 'שלום, אני כאן כדי להתאים לך תוכן. נתחיל בשאלה ראשונה: מה את/ה כבר יודע/ת על טראומה בישראל?'
              : 'Hello, I am here to tailor content for you. First question: what do you already know about trauma in Israel?',
        },
      ])
    } catch {
      setHealthState('error')
      setRestoreState('idle')
    }
  }

  useEffect(() => {
    checkHealthAndRestore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!input.trim() || sending) return

    setSending(true)
    setError('')
    const uid = userId || getOrCreateUserId()
    const answer = input.trim()
    const guessed = detectLang(answer)
    if (guessed && guessed !== lang) {
      setLang(guessed)
      localStorage.setItem(UI_LANG_KEY, guessed)
    }

    setMessages((prev) => [...prev, { role: 'user', text: answer }])
    setInput('')

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid, message: answer }),
      })

      if (!res.ok) {
        if (res.status === 429) setError(t.tooMany)
        else if (res.status === 400) setError(t.tooLong)
        else setError(t.genericError)
        return
      }

      const data = await safeJson(res)
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || '' }])
      setProgress({
        step: data.step || 0,
        total: data.total_steps || 1,
      })

      if (data.completed && typeof data.score === 'number') {
        navigate('/results', {
          state: { score: data.score, userId: uid },
        })
      }
    } catch {
      setError(t.genericError)
    } finally {
      setSending(false)
    }
  }

  const progressPct = Math.min(
    100,
    Math.max(0, Math.round((progress.step / Math.max(1, progress.total)) * 100)),
  )

  if (healthState === 'loading' || restoreState === 'loading') {
    return (
      <main className="page-shell">
        <NavBar lang={lang} />
        <section className="card spacious">
          <h1>{t.quizTitle}</h1>
          <p>{t.restoreLoading}</p>
        </section>
      </main>
    )
  }

  if (healthState === 'error') {
    return (
      <main className="page-shell">
        <NavBar lang={lang} />
        <section className="card spacious error-screen">
          <h1>{t.quizTitle}</h1>
          <p>{t.healthError}</p>
          <button type="button" className="primary-btn" onClick={checkHealthAndRestore}>
            {t.healthRetry}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <NavBar lang={lang} />
      <section className="card spacious">
        <h1>{t.quizTitle}</h1>
        <p className="subtitle">{t.quizSubtitle}</p>
        <div className="progress-wrap">
          <span>
            {t.progress}: {progress.step}/{progress.total}
          </span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="chat-box">
          {messages.map((message, idx) => (
            <div key={`${message.role}-${idx}`} className={`bubble ${message.role}`}>
              {message.text}
            </div>
          ))}
          {messages.length === 0 && <div className="bubble assistant">{t.noResultYet}</div>}
        </div>
        <form onSubmit={handleSubmit} className="chat-form">
          <label htmlFor="answer">{t.inputLabel}</label>
          <textarea
            id="answer"
            maxLength={1000}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t.placeholder}
            rows={4}
          />
          <div className="form-footer">
            <small>
              {input.length}/1000 {t.chars}
            </small>
            <button type="submit" className="primary-btn" disabled={sending}>
              {sending ? t.sending : t.send}
            </button>
          </div>
        </form>
        {error && (
          <div className="error-row">
            <span>{error}</span>
            <button type="button" className="link-btn" onClick={() => setError('')}>
              {t.retry}
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

function PlaceholderGraph({ title, description, height = '220px' }) {
  return (
    <article className="placeholder-box graph-box" style={{ minHeight: height }}>
      <h4>{title}</h4>
      <p>{description}</p>
    </article>
  )
}

function PlaceholderVideo({ lang }) {
  const title =
    lang === HE_HEBREW
      ? 'כאן יוטמע סרטון YouTube'
      : 'YouTube video — will be added here'
  return (
    <section className="placeholder-box video-box">
      <h4>{title}</h4>
      <iframe
        title="YouTube placeholder"
        src=""
        width="100%"
        height="315"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </section>
  )
}

function ResultContent({ score, lang }) {
  if (score === 1) {
    return (
      <div className="results-content score1">
        <section className="card">
          <h2>
            {lang === HE_HEBREW
              ? 'הבנה עדינה של טראומה'
              : 'A gentle understanding of trauma'}
          </h2>
          <p>
            {lang === HE_HEBREW
              ? 'טראומה היא תגובה טבעית לאירוע קשה במיוחד. הרבה אנשים מרגישים בלבול, דפיקות לב, קושי להירדם או חוסר שקט גם זמן אחרי האירוע. זה לא אומר שמשהו לא בסדר איתך, אלא שהגוף והנפש מנסים להגן עליך.'
              : 'Trauma is a natural response to a very difficult event. Many people feel confusion, a racing heart, sleep disruption, or ongoing tension long after the event. This does not mean something is wrong with you; it means your body and mind are trying to protect you.'}
          </p>
          <p>
            {lang === HE_HEBREW
              ? 'בישראל, מצבי חירום חוזרים משפיעים על משפחות, ילדים ומבוגרים. אנשים רבים חווים תסמינים בעוצמות שונות, וחלקם זקוקים לזמן, תמיכה וטיפול כדי לחזור לתחושת יציבות.'
              : 'In Israel, repeated emergency situations impact families, children, and adults. Many people experience symptoms at different intensities, and some need time, support, and treatment to regain stability.'}
          </p>
        </section>
        <section className="card">
          <h3>{lang === HE_HEBREW ? 'סיפור אישי קצר' : 'A short personal story'}</h3>
          <p>
            {lang === HE_HEBREW
              ? 'נועה, בת 29 מדרום הארץ, סיפרה שאחרי תקופה ארוכה של אזעקות היא התחילה להימנע מנסיעות ולהישאר קרובה לבית. בטיפול היא למדה לזהות טריגרים, לתרגל נשימה, ולבנות בהדרגה תחושת ביטחון. היום היא עדיין מתמודדת, אבל מרגישה שיש לה כלים.'
              : 'Noa, 29, from southern Israel, shared that after a long period of alarms she started avoiding travel and staying close to home. In therapy, she learned to identify triggers, practice breathing tools, and gradually rebuild safety. She still copes with stress, but now feels she has practical tools.'}
          </p>
        </section>
        <section className="card">
          <h3>{lang === HE_HEBREW ? 'הסבר פשוט על תגובת הגוף' : 'Simple body response explanation'}</h3>
          <p>
            {lang === HE_HEBREW
              ? 'כשהמוח מזהה סכנה, הוא מפעיל "מצב הישרדות". לכן לפעמים יש קפיצה מכל רעש, מתח בשרירים או קושי להתרכז. תרגול עדין, שגרה ותמיכה חברתית יכולים לעזור למערכת העצבים להירגע.'
              : 'When the brain detects danger, it activates survival mode. This can cause startle reactions, muscle tension, or concentration difficulties. Gentle routines, support, and paced coping practices can help the nervous system settle.'}
          </p>
        </section>
        <PlaceholderGraph
          title={
            lang === HE_HEBREW
              ? 'כאן יופיע גרף — שיעורי PTSD לפי שנה'
              : 'Graph: PTSD rates by year — bar chart'
          }
          description={
            lang === HE_HEBREW
              ? 'גרף עמודות פשוט שמראה שינוי שנתי בשיעורי תסמינים באוכלוסייה.'
              : 'Simple bar chart showing yearly changes in symptom rates.'
          }
          height="220px"
        />
        <PlaceholderGraph
          title={
            lang === HE_HEBREW
              ? 'כאן יופיע גרף — רמות לחץ לפי גיל'
              : 'Graph: stress levels by age group — horizontal bars'
          }
          description={
            lang === HE_HEBREW
              ? 'השוואה בין קבוצות גיל שונות במדדי לחץ.'
              : 'Comparison of stress indicators across age groups.'
          }
          height="220px"
        />
        <PlaceholderVideo lang={lang} />
      </div>
    )
  }

  if (score === 2) {
    return (
      <div className="results-content score2">
        <section className="card">
          <h2>{lang === HE_HEBREW ? 'טראומה: תמונה מאוזנת' : 'Trauma: a balanced overview'}</h2>
          <p>
            {lang === HE_HEBREW
              ? 'טראומה מתפתחת כאשר אדם נחשף לאירוע מאיים במיוחד, באופן ישיר או עקיף. בישראל, חשיפה חוזרת למצבי חירום יוצרת עומס רגשי מתמשך. ההשפעה תלויה בגורמי סיכון כמו חשיפה קודמת, תמיכה חברתית ומשאבים קהילתיים.'
              : 'Trauma can develop after direct or indirect exposure to a severe threat. In Israel, repeated emergency exposure creates ongoing emotional load. Impact differs by risk factors such as previous exposure, social support, and community resources.'}
          </p>
        </section>
        <section className="card-grid">
          <article className="card">
            <h3>{lang === HE_HEBREW ? 'השפעה רגשית' : 'Emotional impact'}</h3>
            <p>
              {lang === HE_HEBREW
                ? 'חרדה, ערנות יתר וקושי בוויסות רגשי מופיעים לעיתים קרובות, במיוחד בתקופות של אי ודאות ביטחונית.'
                : 'Anxiety, hypervigilance, and emotional regulation difficulties are common, especially during security uncertainty.'}
            </p>
          </article>
          <article className="card">
            <h3>{lang === HE_HEBREW ? 'השפעה תפקודית' : 'Functional impact'}</h3>
            <p>
              {lang === HE_HEBREW
                ? 'פגיעה בשינה, ירידה בריכוז והימנעות מפעילויות יומיומיות עשויות להשפיע על עבודה, לימודים ומשפחה.'
                : 'Sleep disruption, reduced concentration, and activity avoidance can affect work, study, and family life.'}
            </p>
          </article>
          <article className="card">
            <h3>{lang === HE_HEBREW ? 'גורמי הגנה' : 'Protective factors'}</h3>
            <p>
              {lang === HE_HEBREW
                ? 'תמיכה קהילתית, תחושת שייכות והתערבות מוקדמת מפחיתים את הסיכון להחמרה ארוכת טווח.'
                : 'Community support, belonging, and early intervention reduce risk of long-term worsening.'}
            </p>
          </article>
        </section>
        <PlaceholderGraph
          title={
            lang === HE_HEBREW
              ? 'כאן יופיע גרף — מגמות פניות לטיפול לפי מחוז'
              : 'Graph: treatment referral trends by district — line chart'
          }
          description={
            lang === HE_HEBREW
              ? 'גרף קו רב-סדרתי להשוואת מגמות לאורך זמן.'
              : 'Multi-series line chart comparing trends over time.'
          }
        />
        <PlaceholderGraph
          title={
            lang === HE_HEBREW
              ? 'כאן יופיע גרף — תסמינים מרכזיים באוכלוסייה'
              : 'Graph: key symptoms in population — grouped bar chart'
          }
          description={
            lang === HE_HEBREW
              ? 'השוואה בין שכיחויות של חרדה, הימנעות והפרעות שינה.'
              : 'Comparison of anxiety, avoidance, and sleep disturbance prevalence.'
          }
        />
        <PlaceholderGraph
          title={
            lang === HE_HEBREW
              ? 'כאן יופיע גרף — שימוש בשירותי תמיכה'
              : 'Graph: use of support services — stacked bar chart'
          }
          description={
            lang === HE_HEBREW
              ? 'חלוקה לפי סוג שירות: קו חם, טיפול פרטני, קבוצות תמיכה.'
              : 'Breakdown by hotline, individual therapy, and group support.'
          }
        />
        <PlaceholderGraph
          title={
            lang === HE_HEBREW
              ? 'כאן יופיע גרף — הבדלים בין קבוצות גיל'
              : 'Graph: age-group differences — radar chart placeholder'
          }
          description={
            lang === HE_HEBREW
              ? 'השוואת פרופיל סימפטומים בין ילדים, נוער ומבוגרים.'
              : 'Symptom profile comparison across children, youth, and adults.'
          }
        />
      </div>
    )
  }

  return (
    <div className="results-content score3">
      <section className="card compact">
        <h2>
          {lang === HE_HEBREW
            ? 'סקירה קלינית: טראומה בהקשר הישראלי'
            : 'Clinical overview: trauma in the Israeli context'}
        </h2>
        <p>
          {lang === HE_HEBREW
            ? 'התמונה האפידמיולוגית מצביעה על חשיפה חוזרת לאירועים פוטנציאלית טראומטיים, עם שונות בין אזורים גיאוגרפיים ורמות פגיעות פסיכו-סוציאלית.'
            : 'Epidemiological patterns indicate repeated exposure to potentially traumatic events, with variation across geographies and psychosocial vulnerability.'}
        </p>
        <ul>
          <li>{lang === HE_HEBREW ? 'מדדי תחלואה: PTSD, דיכאון, חרדה נלווית' : 'Morbidity indicators: PTSD, depression, comorbid anxiety'}</li>
          <li>{lang === HE_HEBREW ? 'מודל רב-שכבתי: פרט, משפחה, קהילה, מערכת' : 'Multi-layer model: individual, family, community, system'}</li>
          <li>{lang === HE_HEBREW ? 'השלכות שירות: עומס על קווי סיוע ומרפאות' : 'Service implications: load on helplines and clinics'}</li>
        </ul>
      </section>
      <section className="card-grid dense">
        <PlaceholderGraph
          title={
            lang === HE_HEBREW
              ? 'כאן יופיע גרף — שכיחות PTSD לאורך עשור'
              : 'Graph: PTSD prevalence over a decade — longitudinal line chart'
          }
          description={
            lang === HE_HEBREW
              ? 'סדרת זמן עם חלוקה לפי אזורים גיאוגרפיים.'
              : 'Time series split by geographic region.'
          }
          height="180px"
        />
        <PlaceholderGraph
          title={
            lang === HE_HEBREW
              ? 'כאן יופיע גרף — יחס סיכון לפי רמת חשיפה'
              : 'Graph: risk ratio by exposure intensity — forest plot placeholder'
          }
          description={
            lang === HE_HEBREW
              ? 'השוואת קבוצות חשיפה עם רווחי סמך.'
              : 'Exposure cohorts with confidence intervals.'
          }
          height="180px"
        />
        <PlaceholderGraph
          title={
            lang === HE_HEBREW
              ? 'כאן יופיע גרף — תחלואה נלווית לפי גיל ומגדר'
              : 'Graph: comorbidity by age and gender — heatmap'
          }
          description={
            lang === HE_HEBREW
              ? 'מפת חום של עומס סימפטומים משולב.'
              : 'Heatmap of combined symptom burden.'
          }
          height="180px"
        />
        <PlaceholderGraph
          title={
            lang === HE_HEBREW
              ? 'כאן יופיע גרף — שימוש בשירותים לפי רבעון'
              : 'Graph: service utilization by quarter — stacked area chart'
          }
          description={
            lang === HE_HEBREW
              ? 'קווי מגמה לפי סוג התערבות.'
              : 'Trend layers by intervention modality.'
          }
          height="180px"
        />
        <PlaceholderGraph
          title={
            lang === HE_HEBREW
              ? 'כאן יופיע גרף — זמן ממוצע להתערבות ראשונה'
              : 'Graph: mean time to first intervention — box plot'
          }
          description={
            lang === HE_HEBREW
              ? 'פיזור זמני המתנה בין קבוצות אוכלוסייה.'
              : 'Wait-time distribution across cohorts.'
          }
          height="180px"
        />
      </section>
      <section className="card compact highlight-limited">
        <h3>{lang === HE_HEBREW ? 'טבלת נתונים (Placeholder)' : 'Data Table (Placeholder)'}</h3>
        <div className="table-placeholder">
          <table>
            <thead>
              <tr>
                <th>{lang === HE_HEBREW ? 'שנה' : 'Year'}</th>
                <th>{lang === HE_HEBREW ? 'קבוצת מדגם' : 'Sample group'}</th>
                <th>{lang === HE_HEBREW ? 'שיעור תסמינים (%)' : 'Symptom rate (%)'}</th>
                <th>{lang === HE_HEBREW ? 'מקור' : 'Source'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2022</td>
                <td>{lang === HE_HEBREW ? 'מבוגרים - דרום' : 'Adults - South'}</td>
                <td>24.6</td>
                <td>Placeholder Citation A</td>
              </tr>
              <tr>
                <td>2023</td>
                <td>{lang === HE_HEBREW ? 'נוער - מרכז' : 'Youth - Center'}</td>
                <td>18.3</td>
                <td>Placeholder Citation B</td>
              </tr>
              <tr>
                <td>2024</td>
                <td>{lang === HE_HEBREW ? 'צוותי חירום' : 'Emergency teams'}</td>
                <td>31.1</td>
                <td>Placeholder Citation C</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function ResultsPage({ lang, setLang }) {
  const navigate = useNavigate()
  const location = useLocation()
  const t = TEXT[lang]
  const [score, setScore] = useState(location.state?.score ?? null)
  const [loading, setLoading] = useState(score === null)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedLang = localStorage.getItem(UI_LANG_KEY)
    if (savedLang === HE_HEBREW || savedLang === ENGLISH) {
      setLang(savedLang)
    }
  }, [setLang])

  useEffect(() => {
    setDocumentLanguage(lang)
  }, [lang])

  useEffect(() => {
    if (score !== null) return
    const userId = getOrCreateUserId()
    const fetchResult = async () => {
      try {
        const res = await fetch(`${API_BASE}/result/${userId}`)
        if (!res.ok) throw new Error('result missing')
        const data = await safeJson(res)
        if (typeof data.score !== 'number') throw new Error('no score')
        setScore(data.score)
      } catch {
        setError(t.resultError)
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [score, t.resultError])

  const handleRetake = async () => {
    const userId = getOrCreateUserId()
    try {
      await fetch(`${API_BASE}/session/${userId}`, { method: 'DELETE' })
    } catch {
      // We still redirect to let user restart even if delete fails.
    } finally {
      navigate('/')
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <NavBar lang={lang} />
        <section className="card spacious">
          <h1>{t.resultsLoading}</h1>
        </section>
      </main>
    )
  }

  if (error || score === null) {
    return (
      <main className="page-shell">
        <NavBar lang={lang} />
        <section className="card spacious error-screen">
          <h1>{t.resultError}</h1>
          <button type="button" className="primary-btn" onClick={() => navigate('/')}>
            {t.retry}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <NavBar lang={lang} />
      <section className="results-wrap">
        <h1 className={`score-title score-${score}`}>
          {lang === HE_HEBREW
            ? `תוכן מותאם לרמת עומק ${score}`
            : `Adaptive content for depth level ${score}`}
        </h1>
        <ResultContent score={score} lang={lang} />
        <div className="retake-wrap">
          <button type="button" className="primary-btn" onClick={handleRetake}>
            {t.retake}
          </button>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem(UI_LANG_KEY)
    if (stored === HE_HEBREW || stored === ENGLISH) return stored
    return ENGLISH
  })

  useEffect(() => {
    localStorage.setItem(UI_LANG_KEY, lang)
    setDocumentLanguage(lang)
  }, [lang])

  const contextValue = useMemo(() => ({ lang, setLang }), [lang])

  return (
    <Routes>
      <Route path="/" element={<QuizPage {...contextValue} />} />
      <Route path="/results" element={<ResultsPage {...contextValue} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
