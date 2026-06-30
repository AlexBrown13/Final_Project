import { useState } from 'react'
import ArticleRow from './ArticleRow.jsx'
import { useDirection } from '../../context/useDirection.js'
import { resetQuizSession } from '../../utils/api.js'
import { getHero, getSection } from './resultsCopy.js'
import { getUiStrings } from '../../config/uiStrings.js'
import { NATAL_CHARTS, pick, getPrefCounts } from './natalData.js'
import { NatalChartCard } from './NatalCharts.jsx'

const PREF_LABEL = {
  en: 'Showing you : research-first',
  he: 'מוצג לכם : מחקר תחילה',
}

const N3_CARD_STYLE = { background: '#fff', border: '1px solid #d7e1e4', borderRadius: 8, padding: '16px 18px' }
const N3_TITLE_STYLE = { fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: 14, margin: '0 0 12px', color: '#1b2a31' }
const N3_SOURCE_STYLE = { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: '#90a2a9', margin: '12px 0 0' }

function OwidChart({ src, title, caption, attribution, minHeight = 380 }) {
  const [state, setState] = useState('loading')

  return (
    <div style={{ border: '1px solid #d7e1e4', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '11px 16px', borderBottom: '1px solid #eef3f4' }}>
        <span style={{
          display: 'block',
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: '#1b2a31',
        }}>
          {title}
        </span>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: '#90a2a9',
        }}>
          {caption}
        </span>
      </div>
      <div style={{ position: 'relative', minHeight }}>
        {state === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, background: '#fff', padding: 18 }}>
            <div className="p3-skel" style={{ height: 14, width: '46%', borderRadius: 4, marginBottom: 16 }} />
            <div className="p3-skel" style={{ height: minHeight - 80, width: '100%', borderRadius: 6 }} />
            <p style={{
              textAlign: 'center',
              fontFamily: "'IBM Plex Mono', monospace",
              color: '#90a2a9',
              fontSize: 11,
              marginTop: 12,
            }}>
              fetching grapher&hellip;
            </p>
          </div>
        )}
        {state === 'failed' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight,
            background: '#f7fafb',
            textAlign: 'center',
            padding: 28,
          }}>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              color: '#5f747c',
              maxWidth: '34ch',
              margin: 0,
            }}>
              [ series unavailable ]
            </p>
          </div>
        )}
        <iframe
          src={src}
          loading="lazy"
          title={title}
          onLoad={() => setState('ready')}
          onError={() => setState('failed')}
          style={state === 'ready'
            ? { width: '100%', height: minHeight, border: 'none', display: 'block' }
            : { opacity: 0, position: 'absolute', inset: 0, width: '100%', height: minHeight, border: 'none' }
          }
        />
      </div>
      <div style={{ padding: '8px 16px', borderTop: '1px solid #eef3f4' }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10.5,
          color: '#90a2a9',
        }}>
          {attribution}
        </span>
      </div>
    </div>
  )
}

export default function ResearcherResults({ profile, academicArticles = [], articlesLoading = false }) {
  const { dir, locale } = useDirection()
  const mood = profile.emotionalState || 'neutral'
  const pref = profile.contentPreference || 'research'

  const copy = getHero('researcher', locale, mood)
  const s = getSection('researcher', locale)
  const ui = getUiStrings(locale)
  const headline = profile.headline || copy.headline
  const prefLabel = PREF_LABEL[locale === 'he' ? 'he' : 'en']

  // Preference-driven counts (no backfill).
  const counts = getPrefCounts(pref)
  const articles = pick(academicArticles, counts.academic)
  const natalCharts = pick(NATAL_CHARTS, counts.natalCharts)
  const owidSrcs = [
    'https://ourworldindata.org/grapher/depressive-disorders-prevalence-ihme',
    'https://ourworldindata.org/grapher/anxiety-disorders-prevalence',
    'https://ourworldindata.org/grapher/share-with-mental-and-substance-disorders',
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
    if (e.key === 'Enter') { e.preventDefault(); addTopic() }
  }

  return (
    <div dir={dir} style={{
      fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
      background: '#eef3f5',
      color: '#1b2a31',
      minHeight: '100vh',
      fontSize: 15,
      lineHeight: 1.5,
    }}>

      {/* NAV */}
      <nav className="p3-nav" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '13px 32px',
        borderBottom: '1px solid #dce5e8',
        position: 'sticky',
        top: 0,
        background: 'rgba(238,243,245,.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 18,
            height: 18,
            border: '2px solid #2f6675',
            borderRadius: 3,
          }} />
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '.02em',
            color: '#1b2a31',
          }}>
            {ui.resultsBrandResearcher}
          </span>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: '#90a2a9',
            marginLeft: 6,
          }}>
            / {ui.resultsNavResults.toLowerCase()}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: '#90a2a9',
          }}>
            {ui.resultsResearcherMode}
          </span>
          <button
            type="button"
            onClick={async () => { await resetQuizSession(); window.location.assign('/') }}
            aria-label={s.retakeAria}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              color: '#2f6675',
              background: 'transparent',
              border: '1px solid #c6d6da',
              borderRadius: 4,
              padding: '5px 12px',
              cursor: 'pointer',
            }}
          >
            {s.retake}
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '30px 32px 70px' }}>

        {/* EXTRACTED PROFILE / HERO SECTION */}
        <section className="p3-hero" style={{
          border: '1px solid #d7e1e4',
          borderRadius: 8,
          background: '#fff',
          marginBottom: 26,
        }}>
          {/* Header row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid #e7eef0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: '#2f6675',
              }}>
                {ui.resultsBadgeResearcher}
              </span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#90a2a9' }} />
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: '#90a2a9',
              }}>
                {profile.primaryTopic || 'PTSD'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTopicsOpen(o => !o)}
              aria-expanded={topicsOpen}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: '#5f747c',
                background: 'transparent',
                border: '1px solid #c6d6da',
                borderRadius: 4,
                padding: '4px 10px',
                cursor: 'pointer',
              }}
            >
              {ui.resultsEditTagsShort}
            </button>
          </div>

          {/* Profile grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {/* H1 headline — spans full width conceptually, but placed in left cell */}
            <div style={{ padding: '16px 20px', borderRight: '1px solid #e7eef0', borderBottom: '1px solid #e7eef0' }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: '#90a2a9',
                marginBottom: 5,
              }}>
                research focus
              </div>
              <h1 style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 17,
                fontWeight: 600,
                lineHeight: 1.35,
                color: '#1b2a31',
                margin: 0,
              }}>
                {headline}
              </h1>
            </div>

            {/* Content preference */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e7eef0' }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: '#90a2a9',
                marginBottom: 5,
              }}>
                content preference
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  background: '#e7f0f3',
                  border: '1px solid #b9d6de',
                  borderRadius: 5,
                  padding: '5px 12px',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2f6675' }} />
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#2f6675',
                  }}>
                    {prefLabel}
                  </span>
                </span>
              </div>
            </div>

            {/* Interest tags */}
            <div style={{ padding: '16px 20px', gridColumn: '1 / -1' }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: '#90a2a9',
                marginBottom: 8,
              }}>
                interest tags
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {topics.map(t => (
                  <span
                    key={t}
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      background: '#e7f0f3',
                      border: '1px solid #b9d6de',
                      color: '#2f6675',
                      borderRadius: 4,
                      padding: '3px 9px',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ADJUST PANEL */}
          {topicsOpen && (
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e7eef0',
              background: '#f7fafb',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 11,
              }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: '#2f6675',
                }}>
                  {ui.resultsEditTags}
                </span>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  color: '#90a2a9',
                }}>
                  {topics.length}/5
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {topics.map(t => (
                  <span
                    key={t}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      background: '#e7f0f3',
                      border: '1px solid #b9d6de',
                      color: '#2f6675',
                      borderRadius: 4,
                      padding: '3px 6px 3px 9px',
                    }}
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTopic(t)}
                      aria-label={`Remove ${t}`}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#7c919a',
                        fontSize: 13,
                        cursor: 'pointer',
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              {!atMax ? (
                <div style={{ display: 'flex', gap: 7, maxWidth: 420 }}>
                  <input
                    type="text"
                    value={addVal}
                    onChange={e => setAddVal(e.target.value)}
                    onKeyDown={handleAddKey}
                    placeholder={ui.resultsAddTopic}
                    maxLength={40}
                    style={{
                      flex: 1,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      background: '#fff',
                      border: '1px solid #c6d6da',
                      borderRadius: 5,
                      padding: '8px 11px',
                      color: '#1b2a31',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTopic}
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      background: '#2f6675',
                      border: '1px solid #2f6675',
                      color: '#fff',
                      borderRadius: 5,
                      padding: '8px 16px',
                      cursor: 'pointer',
                    }}
                  >
                    {ui.resultsAddBtn}
                  </button>
                </div>
              ) : (
                <p style={{
                  margin: 0,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  color: '#90a2a9',
                }}>
                  {ui.resultsMaxTopicsShort}
                </p>
              )}
              <button
                type="button"
                onClick={() => setTopicsOpen(false)}
                style={{
                  marginTop: 11,
                  background: 'transparent',
                  border: 'none',
                  color: '#90a2a9',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                [ {ui.resultsCloseEdit} ]
              </button>
            </div>
          )}
        </section>

        {/* OWID DATA-CONTEXT SECTION */}
        <section style={{
          border: '1px solid #d7e1e4',
          borderRadius: 8,
          background: '#fff',
          marginBottom: 26,
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid #e7eef0',
          }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: '#2f6675',
            }}>
              {s.owidHead}
            </span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: '#90a2a9',
            }}>
              {owidSrcs.length} series &middot; GBD / IHME
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#e7eef0' }}>
            {owidSrcs.map((src, i) => (
              <div key={src} style={{ background: '#fff', gridColumn: i === 2 ? '1 / -1' : 'auto' }}>
                <OwidChart
                  src={src}
                  title={s.owidHead}
                  caption={s.owidSub}
                  attribution="ourworldindata.org · IHME GBD 2021"
                  minHeight={i === 2 ? 460 : 380}
                />
              </div>
            ))}
          </div>
        </section>

        {/* NATAL ISRAEL COHORT RESEARCH (count-driven charts) */}
        {natalCharts.length > 0 && (
          <section style={{
            border: '1px solid #d7e1e4',
            borderRadius: 8,
            background: '#fff',
            marginBottom: 26,
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: '1px solid #e7eef0',
            }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: '#2f6675',
              }}>
                {s.researchHead}
              </span>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: '#90a2a9',
              }}>
                {s.researchSub}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1, background: '#e7eef0' }}>
              {natalCharts.map((chart) => (
                <div key={chart.id} style={{ background: '#fff' }}>
                  <NatalChartCard
                    chart={chart}
                    locale={locale}
                    tone="dark"
                    cardStyle={N3_CARD_STYLE}
                    titleStyle={N3_TITLE_STYLE}
                    sourceStyle={N3_SOURCE_STYLE}
                    explainOpen={openCharts.has(chart.id)}
                    onToggle={() => toggleChart(chart.id)}
                    readMoreLabel={s.readMore}
                    readLessLabel={s.readLess}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ARTICLE RESULTS STACK */}
        <section className="p3-reveal" style={{
          border: '1px solid #d7e1e4',
          borderRadius: 8,
          background: '#fff',
          overflow: 'hidden',
          marginBottom: 26,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid #e7eef0',
          }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: '#2f6675',
            }}>
              {s.academicHead} &middot; {articles.length}
            </span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: '#90a2a9',
            }}>
              sorted: relevance &darr;
            </span>
          </div>

          {articles.length > 0 ? (
            articles.map((article, i) => (
              <ArticleRow key={i} index={String(i + 1).padStart(2, '0')} article={article} />
            ))
          ) : articlesLoading ? (
            /* Skeleton placeholders only while a fetch/ingest is in flight */
            <>
              {[0, 1, 2].map(i => (
                <div key={i} className="p3-skel" style={{
                  margin: '16px 20px',
                  borderRadius: 6,
                  height: 72,
                }} />
              ))}
            </>
          ) : (
            <p style={{
              margin: '16px 20px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              color: '#90a2a9',
            }}>
              {s.academicEmpty}
            </p>
          )}

          {/* CTA to /articles */}
          <div style={{ padding: '14px 20px' }}>
            <a
              href="/articles"
              className="p3-link"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 13,
                color: '#2f6675',
                textDecoration: 'none',
              }}
            >
              &rarr; open your full curated article set
            </a>
          </div>
        </section>

        {/* ALSO EXPLORE */}
        <section style={{
          marginTop: 24,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 22px',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: '#90a2a9',
          }}>
            {ui.resultsExploreHead}:
          </span>
          <a
            href="/map"
            className="p3-link"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              color: '#42565d',
              textDecoration: 'none',
            }}
          >
            {ui.resultsExploreMap}
          </a>
          <a
            href="/trends"
            className="p3-link"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              color: '#42565d',
              textDecoration: 'none',
            }}
          >
            {ui.resultsExploreTrends}
          </a>
          <a
            href="/graphs/israel"
            className="p3-link"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              color: '#42565d',
              textDecoration: 'none',
            }}
          >
            {ui.resultsExploreGraphs}
          </a>
        </section>

      </main>
    </div>
  )
}
