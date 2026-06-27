import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BackendDown from '../components/BackendDown.jsx'
import BeginnerResults from '../components/results/BeginnerResults.jsx'
import InformedResults from '../components/results/InformedResults.jsx'
import '../components/results/results-components.css'
import {
  USER_ID_KEY,
  QUIZ_MESSAGES_KEY,
  QUIZ_META_KEY,
  SCORE_CACHE_KEY,
  AUTH_TOKEN_KEY,
} from '../config/storageKeys.js'
import { usePersona } from '../context/usePersona.js'
import { fetchHealth, getResult } from '../utils/api.js'
import { getApiBase } from '../config/api.js'
import styles from './ResultsPage.module.css'

const MOCK_PROFILE = {
  persona: 'beginner',
  emotionalState: 'grieving',
  contentPreference: 'stories',
  interestTags: ['October 7', 'grief', 'PTSD', 'soldiers', 'memory'],
  primaryTopic: 'grief',
  headline: null,
}

const MOCK_STORIES = [
  {
    thumbnailUrl: null,
    headline: 'The families of fallen soldiers who are learning to grieve together',
    summary: 'Around shared tables and quiet rooms, bereaved parents are finding that the weight feels a little more bearable when it is carried alongside others.',
    date: '2 Mar 2025',
    url: '#',
  },
]

const MOCK_ARTICLES = [
  {
    title: 'Post-traumatic stress and prolonged grief in bereaved parents',
    year: 2023,
    journal: 'Journal of Traumatic Stress',
    firstAuthor: 'R. Cohen',
    abstract: 'Parents who lose a child to sudden violence often experience grief and trauma at the same time. This review describes what that looks like and what tends to help.',
    url: '#',
    matchedTags: ['grief', 'PTSD'],
  },
]

function normalizeScore(n) {
  const s = Number(n)
  if (s === 2 || s === 3) return s
  return 1
}

function scoreToPersona(s) {
  if (s === 3) return 'researcher'
  if (s === 2) return 'informed'
  return 'beginner'
}


function ResearcherResults() {
  return null
}

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setPersona } = usePersona()

  const routeScore =
    location.state?.score != null ? normalizeScore(location.state.score) : null
  const routePersona = location.state?.persona_profile ?? null
  const routeFromQuiz = location.state?.fromQuiz === true

  const [health, setHealth] = useState(null)
  const [fetchedScore, setFetchedScore] = useState(null)
  const [personaProfile, setPersonaProfile] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const score = routeScore ?? fetchedScore
  const effectiveLoadError = routeScore != null ? null : loadError

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { ok } = await fetchHealth()
      if (!cancelled) setHealth(ok)
    })()
    return () => { cancelled = true }
  }, [])

  const recheckHealth = () => {
    ;(async () => {
      const { ok } = await fetchHealth()
      setHealth(ok)
    })()
  }

  useEffect(() => {
    if (!routeFromQuiz || !score) return
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) return
    const quizUserId = localStorage.getItem(USER_ID_KEY)
    ;(async () => {
      try {
        const base = getApiBase()
        await fetch(`${base}/api/articles`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quiz_user_id: quizUserId }),
        })
      } catch (err) {
        console.warn('Auto-fetch articles failed:', err)
      }
    })()
  }, [routeFromQuiz, score])

  useEffect(() => {
    if (routeScore == null) return
    try {
      localStorage.setItem(SCORE_CACHE_KEY, String(routeScore))
    } catch {
      /* ignore */
    }
    if (routePersona) {
      setPersonaProfile(routePersona)
    }
    setPersona(routePersona?.persona || scoreToPersona(routeScore))
  }, [routeScore, routePersona])

  useEffect(() => {
    if (routeScore != null) return
    let cancelled = false
    const run = async () => {
      let userId
      try { userId = localStorage.getItem(USER_ID_KEY) } catch { userId = null }

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
        setPersonaProfile(data.persona_profile ?? null)
        setPersona(data.persona_profile?.persona || scoreToPersona(s))
        try { localStorage.setItem(SCORE_CACHE_KEY, String(s)) } catch { /* ignore */ }
        return
      }

      if (res.status === 400 && data?.completed === false) { setLoadError('incomplete'); return }
      if (res.status === 404) {
        try { localStorage.removeItem(SCORE_CACHE_KEY) } catch { /* ignore */ }
        setLoadError('incomplete')
        return
      }

      try {
        const cached = localStorage.getItem(SCORE_CACHE_KEY)
        if (cached != null && cached !== '') {
          const s = normalizeScore(cached)
          setLoadError(null)
          setFetchedScore(s)
          setPersona(scoreToPersona(s))
          return
        }
      } catch { /* ignore */ }

      setLoadError('unknown')
    }
    run()
    return () => { cancelled = true }
  }, [routeScore])

  if (health === null) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p className={styles.muted}>בודקים חיבור לשרת… / Checking server…</p>
        </main>
      </div>
    )
  }

  if (health === false) {
    return (
      <div className={styles.page}>
        <BackendDown onRetry={recheckHealth} />
      </div>
    )
  }

  if (effectiveLoadError === 'incomplete' || effectiveLoadError === 'no-user') {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.notice}>
            <h1 className={styles.noticeTitle}>נתוני שאלון חסרים</h1>
            <p className={styles.noticeBody} lang="en">
              Complete the guided quiz first so we can tailor this page for you.
            </p>
            <p className={styles.noticeBody}>
              יש להשלים תחילה את השאלון המודרך כדי שנוכל להתאים את התוכן.
            </p>
            <button type="button" className={styles.primaryBtn} onClick={() => navigate('/')}>
              Go to quiz
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (score == null && effectiveLoadError === 'unknown') {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.notice}>
            <h1 className={styles.noticeTitle}>לא הצלחנו לטעון את התוצאה</h1>
            <p className={styles.noticeBody} lang="en">Please try again, or return to the quiz.</p>
            <p className={styles.noticeBody}>אפשר לנסות שוב או לחזור לשאלון.</p>
            <button type="button" className={styles.primaryBtn} onClick={() => window.location.reload()}>
              Refresh
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={() => navigate('/')}>
              Quiz
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (score == null) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p className={styles.muted}>טוענים תוכן מותאם… / Loading…</p>
        </main>
      </div>
    )
  }

  const profile = personaProfile ?? MOCK_PROFILE
  const persona = profile.persona || scoreToPersona(score)

  if (persona === 'beginner') {
    return (
      <BeginnerResults
        profile={profile}
        guardianStories={MOCK_STORIES}
        academicArticles={MOCK_ARTICLES}
      />
    )
  }

  if (persona === 'informed') {
    return <InformedResults profile={profile} guardianStories={[]} academicArticles={[]} />
  }

  return <ResearcherResults profile={profile} academicArticles={[]} />
}
