import { useState } from 'react'
import GuardianCard from './GuardianCard.jsx'
import AcademicCard from './AcademicCard.jsx'
import { useDirection } from '../../context/useDirection.js'
import { resetQuizSession } from '../../utils/api.js'

const MOOD_COPY = {
  grieving: {
    eyebrow: 'A gentle place to understand',
    h1: 'Understanding what your loved one carried — at your own pace.',
    sub: 'This space was put together with care — stories from people who have been there, and research written in plain language. You can read as little or as much as feels right.',
  },
  curious: {
    eyebrow: 'A place to explore, at your pace',
    h1: 'Making sense of this — one story at a time.',
    sub: 'There is a lot out there. We have gathered what we think will actually help — human stories alongside the evidence that explains them.',
  },
  distressed: {
    eyebrow: "You're in a safe place",
    h1: "Take a breath. We'll go gently, together.",
    sub: "You don't have to read anything right now. When you're ready, everything here is waiting for you.",
  },
}

function SkeletonShimmer({ height = 480 }) {
  return <div className="p1-skel" style={{ height }} />
}

function OwidFrame({ src, height = 480 }) {
  const [state, setState] = useState('loading')
  return (
    <div className="p1-owid-frame-wrap" style={{ minHeight: height }}>
      {state === 'loading' && <SkeletonShimmer height={height} />}
      {state === 'failed' && (
        <p className="p1-owid-fallback">Data visualization temporarily unavailable.</p>
      )}
      <iframe
        src={src}
        loading="lazy"
        onLoad={() => setState('ready')}
        onError={() => setState('failed')}
        title="Our World in Data chart"
        style={{
          width: '100%',
          height,
          border: 'none',
          display: 'block',
          ...(state === 'ready' ? {} : { opacity: 0, position: 'absolute', inset: 0 }),
        }}
      />
    </div>
  )
}

export default function BeginnerResults({ profile, guardianStories = [], academicArticles = [] }) {
  const mood = profile.emotionalState || 'grieving'
  const copy = MOOD_COPY[mood] || MOOD_COPY.grieving

  const headline = profile.headline || copy.h1
  const eyebrow = copy.eyebrow

  const { dir } = useDirection()
  const [topicsOpen, setTopicsOpen] = useState(false)
  const [topics, setTopics] = useState(profile.interestTags || [])
  const [addVal, setAddVal] = useState('')

  const atMax = topics.length >= 5

  function removeTopic(t) {
    setTopics(prev => prev.filter(x => x !== t))
  }

  function addTopic() {
    const val = addVal.trim()
    if (!val || atMax || topics.includes(val)) return
    setTopics(prev => [...prev, val])
    setAddVal('')
  }

  function handleAddKey(e) {
    if (e.key === 'Enter') addTopic()
  }

  const showSupport = mood === 'grieving' || mood === 'distressed'

  return (
    <div className="p1-root" data-mood={mood} dir={dir}>
      {/* Navbar */}
      <nav className="p1-nav">
        <a href="/" className="p1-nav-wordmark">
          <span className="p1-nav-dot" aria-hidden="true" />
          trauma education
        </a>
        <button
          type="button"
          className="p1-lang-toggle"
          onClick={async () => { await resetQuizSession(); window.location.assign('/') }}
          aria-label={dir === 'ltr' ? 'Retake the quiz' : 'מילוי השאלון מחדש'}
        >
          {dir === 'ltr' ? 'Retake quiz' : 'שאלון מחדש'}
        </button>
      </nav>

      <div className="p1-shell">
        {/* Hero */}
        <header className="p1-hero">
          <div className="p1-eyebrow">
            <span className="p1-eyebrow-dot" aria-hidden="true" />
            {eyebrow}
          </div>
          <h1 className="p1-h1">{headline}</h1>
          <p className="p1-subcopy">{copy.sub}</p>
          <div className="p1-tags-row">
            {topics.map(t => (
              <span key={t} className="p1-tag">
                {t}
                <button
                  type="button"
                  className="p1-tag-remove"
                  aria-label={`Remove ${t}`}
                  onClick={() => removeTopic(t)}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              className="p1-adjust-btn"
              onClick={() => setTopicsOpen(o => !o)}
              aria-expanded={topicsOpen}
            >
              adjust your topics
            </button>
          </div>

          {/* Inline adjust panel */}
          {topicsOpen && (
            <div className="p1-topics-panel">
              <h3>Your topics</h3>
              <div className="p1-topics-tags">
                {topics.map(t => (
                  <span key={t} className="p1-tag">
                    {t}
                    <button
                      type="button"
                      className="p1-tag-remove"
                      aria-label={`Remove ${t}`}
                      onClick={() => removeTopic(t)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {!atMax ? (
                <div className="p1-add-row">
                  <input
                    type="text"
                    className="p1-add-input"
                    placeholder="Add a topic…"
                    value={addVal}
                    onChange={e => setAddVal(e.target.value)}
                    onKeyDown={handleAddKey}
                    maxLength={40}
                  />
                  <button type="button" className="p1-add-btn" onClick={addTopic}>
                    Add
                  </button>
                </div>
              ) : (
                <p className="p1-max-msg">You can follow up to five topics.</p>
              )}
            </div>
          )}
        </header>

        {/* Support card — conditional */}
        {showSupport && (
          <div className="p1-support-card">
            <p>If today feels heavy, you don't have to sit with it alone.</p>
            <p>
              ERAN's emotional first-aid line is open any hour. Call <strong>1201</strong>.
            </p>
          </div>
        )}

        <hr className="p1-divider" />

        {/* Guardian stories */}
        {guardianStories.length > 0 && (
          <section className="p1-section">
            <h2 className="p1-section-head">Stories from people who understand</h2>
            <p className="p1-section-sub">Personal accounts and journalism, gathered with care.</p>
            <div className="p1-guardian-grid">
              {guardianStories.map((s, i) => (
                <GuardianCard key={i} {...s} />
              ))}
            </div>
          </section>
        )}

        {/* OWID chart */}
        <section className="p1-section p1-owid-section" style={{ marginTop: 40 }}>
          <h2 className="p1-section-head" style={{ marginBottom: 6 }}>You are not alone in this</h2>
          <p className="p1-section-sub">Global data on anxiety and trauma prevalence.</p>
          <OwidFrame src="https://ourworldindata.org/grapher/anxiety-disorders-prevalence" />
        </section>

        {/* Academic previews */}
        {academicArticles.length > 0 && (
          <section className="p1-section" style={{ marginTop: 40 }}>
            <h2 className="p1-section-head">Reading, made approachable</h2>
            <p className="p1-section-sub">Research that matters, explained without the jargon.</p>
            <div className="p1-academic-list">
              {academicArticles.map((a, i) => (
                <AcademicCard key={i} {...a} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="p1-section" style={{ marginTop: 40 }}>
          <div className="p1-cta">
            <div className="p1-cta-text">
              <h2>There is more waiting for you</h2>
              <p>A curated reading list, built around your topics.</p>
            </div>
            <a href="/articles" className="p1-cta-btn">
              See your full reading list
            </a>
          </div>
        </section>

        {/* Also explore */}
        <nav className="p1-explore" aria-label="Also explore">
          <p className="p1-explore-heading">Also explore</p>
          <ul className="p1-explore-list">
            <li className="p1-explore-item">
              <a href="/map" className="p1-explore-link">
                <span className="p1-explore-name">Interactive Map</span>
                <span className="p1-explore-desc">See how trauma affects communities across regions</span>
              </a>
            </li>
            <li className="p1-explore-item">
              <a href="/trends" className="p1-explore-link">
                <span className="p1-explore-name">Trends</span>
                <span className="p1-explore-desc">How awareness and research have grown over time</span>
              </a>
            </li>
            <li className="p1-explore-item">
              <a href="/graphs/israel" className="p1-explore-link">
                <span className="p1-explore-name">Data Graphs</span>
                <span className="p1-explore-desc">Explore the numbers behind the stories</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
