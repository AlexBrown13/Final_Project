import { useState } from 'react'
import GuardianCard from './GuardianCard.jsx'
import AcademicCard from './AcademicCard.jsx'
import { useDirection } from '../../context/useDirection.js'
import { resetQuizSession } from '../../utils/api.js'
import { getHero, getSection } from './resultsCopy.js'
import { getUiStrings } from '../../config/uiStrings.js'
import { NATAL_CHARTS, NATAL_TEXT_BLOCKS, pick, getPrefCounts } from './natalData.js'
import { NatalChartCard, NatalTextBlock } from './NatalCharts.jsx'
import { POST_TRAUMA_INFO } from './postTraumaInfo.js'
import { localizeStory } from './storiesData.js'

const NATAL_CARD_STYLE = { background: '#fffdf9', border: '1px solid #ece4d6', borderRadius: 16, padding: '20px 22px' }
const NATAL_TITLE_STYLE = { fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: 18, margin: '0 0 12px', color: '#3f3a32' }
const NATAL_SOURCE_STYLE = { fontFamily: 'ui-monospace, monospace', fontSize: 11, color: '#9b937f', margin: '12px 0 0' }
const TEXT_CARD_STYLE = { background: '#f3efe6', border: '1px solid #e6ddcf', borderLeft: '4px solid #7da984', borderRadius: '0 14px 14px 0', padding: '20px 24px' }
const TEXT_STAT_STYLE = { fontFamily: "'Newsreader', serif", fontWeight: 600, fontSize: 34, color: '#7da984', lineHeight: 1 }
const TEXT_LABEL_STYLE = { fontFamily: "'Newsreader', serif", fontSize: 18, fontWeight: 500, color: '#3f4639', margin: '8px 0 8px' }
const TEXT_BODY_STYLE = { fontSize: 15, lineHeight: 1.6, color: '#6b6457', margin: 0 }
const TEXT_SOURCE_STYLE = { fontFamily: 'ui-monospace, monospace', fontSize: 11, color: '#9b937f', margin: '12px 0 0' }
const EDU_CARD_STYLE = { background: '#fffdf9', border: '1px solid #ece4d6', borderRadius: 16, padding: '22px 24px' }
const EDU_LEAD_STYLE = { fontFamily: "'Newsreader', serif", fontSize: 18, fontWeight: 500, color: '#3f3a32', margin: '0 0 12px', lineHeight: 1.5 }
const EDU_BODY_STYLE = { fontSize: 15, lineHeight: 1.6, color: '#6b6457', margin: '0 0 4px' }
const EDU_GRID_STYLE = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 16 }
const EDU_GROUP_STYLE = { background: '#f3efe6', border: '1px solid #e6ddcf', borderRadius: 12, padding: '14px 16px' }
const EDU_GROUP_LABEL_STYLE = { fontFamily: "'Newsreader', serif", fontSize: 16, fontWeight: 600, color: '#7da984', margin: '0 0 8px' }
const EDU_LIST_STYLE = { margin: 0, paddingInlineStart: 18, fontSize: 14, lineHeight: 1.55, color: '#6b6457' }
const EDU_CLOSING_STYLE = { fontSize: 14.5, lineHeight: 1.6, color: '#6b6457', margin: '16px 0 0', fontStyle: 'italic' }

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

// Language-matched beginner video — swaps automatically when the locale toggles.
const BEGINNER_VIDEO = {
  he: 'https://www.youtube.com/embed/weGwVP8JETg',
  en: 'https://www.youtube.com/embed/KptE6doAJrA',
}

function VideoFrame({ src, title, height = 360 }) {
  const [state, setState] = useState('loading')
  return (
    <div className="p1-owid-frame-wrap" style={{ minHeight: height }}>
      {state === 'loading' && <SkeletonShimmer height={height} />}
      {state === 'failed' && (
        <p className="p1-owid-fallback">Video temporarily unavailable.</p>
      )}
      <iframe
        src={src}
        title={title}
        loading="lazy"
        onLoad={() => setState('ready')}
        onError={() => setState('failed')}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{
          width: '100%',
          height,
          border: 'none',
          display: 'block',
          borderRadius: 14,
          ...(state === 'ready' ? {} : { opacity: 0, position: 'absolute', inset: 0 }),
        }}
      />
    </div>
  )
}

export default function BeginnerResults({ profile, guardianStories = [], academicArticles = [], articlesLoading = false }) {
  const { dir, locale } = useDirection()
  const mood = profile.emotionalState || 'grieving'
  const pref = profile.contentPreference || 'mixed'
  const copy = getHero('beginner', locale, mood)
  const s = getSection('beginner', locale)
  const ui = getUiStrings(locale)

  const headline = profile.headline || copy.headline
  const eyebrow = copy.eyebrow

  // Preference-driven counts (no backfill — show what exists).
  const counts = getPrefCounts(pref)
  const stories = pick(guardianStories, counts.guardian)
  const articles = pick(academicArticles, counts.academic)
  const natalCharts = pick(NATAL_CHARTS, counts.natalCharts)
  const natalTexts = pick(NATAL_TEXT_BLOCKS, counts.natalCharts)
  const owidSrcs = [
    'https://ourworldindata.org/grapher/anxiety-disorders-prevalence',
    'https://ourworldindata.org/grapher/depressive-disorders-prevalence-ihme',
  ].slice(0, counts.owid)

  const [topicsOpen, setTopicsOpen] = useState(false)
  const [topics, setTopics] = useState(profile.interestTags || [])
  const [addVal, setAddVal] = useState('')
  const [openCharts, setOpenCharts] = useState(() => new Set())
  const toggleChart = (id) => setOpenCharts(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
  })

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
          {ui.resultsBrand}
        </a>
        <button
          type="button"
          className="p1-lang-toggle"
          onClick={async () => { await resetQuizSession(); window.location.assign('/') }}
          aria-label={s.retakeAria}
        >
          {s.retake}
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
          <p className="p1-subcopy">{copy.subcopy}</p>
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
              {s.adjust}
            </button>
          </div>

          {/* Inline adjust panel */}
          {topicsOpen && (
            <div className="p1-topics-panel">
              <h3>{ui.resultsTopicsPanelTitle}</h3>
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
                    placeholder={ui.resultsAddTopic}
                    value={addVal}
                    onChange={e => setAddVal(e.target.value)}
                    onKeyDown={handleAddKey}
                    maxLength={40}
                  />
                  <button type="button" className="p1-add-btn" onClick={addTopic}>
                    {ui.resultsAddBtn}
                  </button>
                </div>
              ) : (
                <p className="p1-max-msg">{ui.resultsMaxTopics}</p>
              )}
            </div>
          )}
        </header>

        {/* Support card — conditional */}
        {showSupport && (
          <div className="p1-support-card">
            <p>{s.supportTitle}</p>
            <p>{s.supportBody}</p>
          </div>
        )}

        <hr className="p1-divider" />

        {/* What is post-trauma — beginner-only psychoeducation (validate before informing) */}
        <section className="p1-section">
          <h2 className="p1-section-head">
            {locale === 'he' ? POST_TRAUMA_INFO.title_he : POST_TRAUMA_INFO.title_en}
          </h2>
          <div style={EDU_CARD_STYLE}>
            <p style={EDU_LEAD_STYLE}>
              {locale === 'he' ? POST_TRAUMA_INFO.lead_he : POST_TRAUMA_INFO.lead_en}
            </p>
            <p style={EDU_BODY_STYLE}>
              {locale === 'he' ? POST_TRAUMA_INFO.body_he : POST_TRAUMA_INFO.body_en}
            </p>
            <div style={EDU_GRID_STYLE}>
              {POST_TRAUMA_INFO.groups.map((g, i) => (
                <div key={i} style={EDU_GROUP_STYLE}>
                  <p style={EDU_GROUP_LABEL_STYLE}>
                    {locale === 'he' ? g.label_he : g.label_en}
                  </p>
                  <ul style={EDU_LIST_STYLE}>
                    {(locale === 'he' ? g.items_he : g.items_en).map((it, j) => (
                      <li key={j} style={{ marginBottom: 4 }}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p style={EDU_CLOSING_STYLE}>
              {locale === 'he' ? POST_TRAUMA_INFO.closing_he : POST_TRAUMA_INFO.closing_en}
            </p>
          </div>
        </section>

        {/* Language-matched video (swaps with the language toggle) */}
        <section className="p1-section" style={{ marginTop: 40 }}>
          <h2 className="p1-section-head">{locale === 'he' ? 'כדאי לצפות' : 'Worth watching'}</h2>
          <VideoFrame
            src={BEGINNER_VIDEO[locale] || BEGINNER_VIDEO.en}
            title={locale === 'he' ? 'סרטון' : 'Video'}
          />
        </section>

        {/* Guardian stories */}
        {stories.length > 0 && (
          <section className="p1-section">
            <h2 className="p1-section-head">{s.storiesHead}</h2>
            <p className="p1-section-sub">{s.storiesSub}</p>
            <div className="p1-guardian-grid">
              {stories.map((story, i) => (
                <GuardianCard key={i} {...localizeStory(story, locale)} />
              ))}
            </div>
          </section>
        )}

        {/* OWID charts */}
        {owidSrcs.length > 0 && (
          <section className="p1-section p1-owid-section" style={{ marginTop: 40 }}>
            <h2 className="p1-section-head" style={{ marginBottom: 6 }}>{s.owidHead}</h2>
            <p className="p1-section-sub">{s.owidSub}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {owidSrcs.map((src) => <OwidFrame key={src} src={src} />)}
            </div>
          </section>
        )}

        {/* NATAL research — charts + gentle text blocks (preference-driven count) */}
        {(natalCharts.length > 0 || natalTexts.length > 0) && (
          <section className="p1-section" style={{ marginTop: 40 }}>
            <h2 className="p1-section-head">{s.researchHead}</h2>
            <p className="p1-section-sub">{s.researchSub}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
              {natalCharts.map((chart) => (
                <NatalChartCard
                  key={chart.id}
                  chart={chart}
                  locale={locale}
                  tone="warm"
                  cardStyle={NATAL_CARD_STYLE}
                  titleStyle={NATAL_TITLE_STYLE}
                  sourceStyle={NATAL_SOURCE_STYLE}
                  explainOpen={openCharts.has(chart.id)}
                  onToggle={() => toggleChart(chart.id)}
                  readMoreLabel={s.readMore}
                  readLessLabel={s.readLess}
                />
              ))}
              {natalTexts.map((block) => (
                <NatalTextBlock
                  key={block.id}
                  block={block}
                  locale={locale}
                  tone="warm"
                  cardStyle={TEXT_CARD_STYLE}
                  statStyle={TEXT_STAT_STYLE}
                  labelStyle={TEXT_LABEL_STYLE}
                  bodyStyle={TEXT_BODY_STYLE}
                  sourceStyle={TEXT_SOURCE_STYLE}
                />
              ))}
            </div>
          </section>
        )}

        {/* Academic previews */}
        {(articles.length > 0 || articlesLoading) && (
          <section className="p1-section" style={{ marginTop: 40 }}>
            <h2 className="p1-section-head">{s.academicHead}</h2>
            <p className="p1-section-sub">{s.academicSub}</p>
            <div className="p1-academic-list">
              {articles.length > 0 ? (
                articles.map((a, i) => (
                  <AcademicCard key={i} {...a} />
                ))
              ) : (
                [0, 1].map(i => (
                  <div key={i} className="p1-skel" style={{ height: 120, borderRadius: 12 }} />
                ))
              )}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="p1-section" style={{ marginTop: 40 }}>
          <div className="p1-cta">
            <div className="p1-cta-text">
              <h2>{s.ctaHead}</h2>
              <p>{s.ctaSub}</p>
            </div>
            <a href="/articles" className="p1-cta-btn">
              {s.ctaBtn}
            </a>
          </div>
        </section>

        {/* Also explore */}
        <nav className="p1-explore" aria-label={s.exploreHead}>
          <p className="p1-explore-heading">{s.exploreHead}</p>
          <ul className="p1-explore-list">
            <li className="p1-explore-item">
              <a href="/map" className="p1-explore-link">
                <span className="p1-explore-name">{ui.resultsExploreMap}</span>
                <span className="p1-explore-desc">{ui.resultsExploreMapDesc}</span>
              </a>
            </li>
            <li className="p1-explore-item">
              <a href="/trends" className="p1-explore-link">
                <span className="p1-explore-name">{ui.resultsExploreTrends}</span>
                <span className="p1-explore-desc">{ui.resultsExploreTrendsDesc}</span>
              </a>
            </li>
            <li className="p1-explore-item">
              <a href="/graphs/israel" className="p1-explore-link">
                <span className="p1-explore-name">{ui.resultsExploreGraphs}</span>
                <span className="p1-explore-desc">{ui.resultsExploreGraphsDesc}</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
