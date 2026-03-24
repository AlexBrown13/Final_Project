import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import BackendDown from '../components/BackendDown.jsx'
import Score1Content from '../components/content/Score1Content.jsx'
import Score2Content from '../components/content/Score2Content.jsx'
import Score3Content from '../components/content/Score3Content.jsx'
import {
  USER_ID_KEY,
  QUIZ_MESSAGES_KEY,
  QUIZ_META_KEY,
  SCORE_CACHE_KEY,
} from '../config/storageKeys.js'
import { useDirection } from '../context/useDirection.js'
import { fetchHealth, getResult, deleteSession } from '../utils/api.js'
import styles from './ResultsPage.module.css'

function normalizeScore(n) {
  const s = Number(n)
  if (s === 2 || s === 3) return s
  return 1
}

function clearQuizLocalState() {
  try {
    localStorage.removeItem(QUIZ_MESSAGES_KEY)
    localStorage.removeItem(QUIZ_META_KEY)
    localStorage.removeItem(SCORE_CACHE_KEY)
  } catch {
    /* ignore */
  }
}

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { dir, locale } = useDirection()

  const routeScore =
    location.state?.score != null ? normalizeScore(location.state.score) : null

  const [health, setHealth] = useState(null)
  const [fetchedScore, setFetchedScore] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [retakeBusy, setRetakeBusy] = useState(false)

  const score = routeScore ?? fetchedScore
  const effectiveLoadError = routeScore != null ? null : loadError

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { ok } = await fetchHealth()
      if (!cancelled) setHealth(ok)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const recheckHealth = () => {
    ;(async () => {
      const { ok } = await fetchHealth()
      setHealth(ok)
    })()
  }

  useEffect(() => {
    if (routeScore == null) return
    try {
      localStorage.setItem(SCORE_CACHE_KEY, String(routeScore))
    } catch {
      /* ignore */
    }
  }, [routeScore])

  useEffect(() => {
    if (routeScore != null) {
      return
    }

    let cancelled = false
    const run = async () => {
      let userId
      try {
        userId = localStorage.getItem(USER_ID_KEY)
      } catch {
        userId = null
      }

      if (!userId) {
        if (!cancelled) setLoadError('no-user')
        return
      }

      const { res, data } = await getResult(userId)
      if (cancelled) return

      if (res.ok && data.completed && data.score != null) {
        const s = normalizeScore(data.score)
        setLoadError(null)
        setFetchedScore(s)
        try {
          localStorage.setItem(SCORE_CACHE_KEY, String(s))
        } catch {
          /* ignore */
        }
        return
      }

      if (res.status === 400 && data?.completed === false) {
        setLoadError('incomplete')
        return
      }

      if (res.status === 404) {
        try {
          localStorage.removeItem(SCORE_CACHE_KEY)
        } catch {
          /* ignore */
        }
        setLoadError('incomplete')
        return
      }

      try {
        const cached = localStorage.getItem(SCORE_CACHE_KEY)
        if (cached != null && cached !== '') {
          setLoadError(null)
          setFetchedScore(normalizeScore(cached))
          return
        }
      } catch {
        /* ignore */
      }

      setLoadError('unknown')
    }

    run()
    return () => {
      cancelled = true
    }
  }, [routeScore])

  const onRetake = async () => {
    setRetakeBusy(true)
    try {
      const userId = localStorage.getItem(USER_ID_KEY)
      if (userId) await deleteSession(userId)
    } catch {
      /* ignore */
    }
    clearQuizLocalState()
    setRetakeBusy(false)
    navigate('/', { replace: true })
  }

  if (health === null) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main} lang={locale}>
          <p className={styles.muted}>בודקים חיבור לשרת… / Checking server…</p>
        </main>
      </div>
    )
  }

  if (health === false) {
    return (
      <div className={styles.page}>
        <Navbar />
        <BackendDown onRetry={recheckHealth} dir={dir} />
      </div>
    )
  }

  if (
    effectiveLoadError === 'incomplete' ||
    effectiveLoadError === 'no-user'
  ) {
    return (
      <div className={styles.page} data-score="2">
        <Navbar />
        <main className={styles.main} lang={locale}>
          <div className={styles.notice}>
            <h1 className={styles.noticeTitle}>נתוני שאלון חסרים</h1>
            <p className={styles.noticeBody} lang="en">
              Complete the guided quiz first so we can tailor this page for
              you.
            </p>
            <p className={styles.noticeBody}>
              יש להשלים תחילה את השאלון המודרך כדי שנוכל להתאים את התוכן.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => navigate('/')}
            >
              לשאלון / Go to quiz
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (score == null && effectiveLoadError === 'unknown') {
    return (
      <div className={styles.page} data-score="2">
        <Navbar />
        <main className={styles.main} lang={locale}>
          <div className={styles.notice}>
            <h1 className={styles.noticeTitle}>לא הצלחנו לטעון את התוצאה</h1>
            <p className={styles.noticeBody} lang="en">
              Please try again, or return to the quiz.
            </p>
            <p className={styles.noticeBody}>אפשר לנסות שוב או לחזור לשאלון.</p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => window.location.reload()}
            >
              רענון / Refresh
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => navigate('/')}
            >
              לשאלון / Quiz
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (score == null) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main} lang={locale}>
          <p className={styles.muted}>טוענים תוכן מותאם… / Loading…</p>
        </main>
      </div>
    )
  }

  const Content =
    score === 1 ? Score1Content : score === 2 ? Score2Content : Score3Content

  return (
    <div className={styles.page} data-score={String(score)}>
      <Navbar />
      <main className={styles.main} lang={locale}>
        <header className={styles.hero}>
          <p className={styles.kicker}>התאמה אישית לפי תוצאת השאלון</p>
          <h1 className={styles.heroTitle}>טראומה בישראל — מסלול למידה</h1>
          <p className={styles.heroEn} lang="en">
            Trauma in Israel — a learning path shaped for you (score {score}).
          </p>
          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.retake}
              disabled={retakeBusy}
              onClick={onRetake}
            >
              {retakeBusy ? 'מאפסים…' : 'מחדשים שאלון / Retake quiz'}
            </button>
          </div>
        </header>

        <Content dir={dir} />
      </main>
    </div>
  )
}
