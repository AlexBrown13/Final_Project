import { useState } from 'react'
import ArticleRow from './ArticleRow.jsx'

const HEADLINE = {
  professional: 'The evidence base for trauma in conflict — organised for research.',
  curious:      'Dig into the peer-reviewed record on conflict trauma and PTSD.',
  grieving:     'The science behind what you are going through, gathered for you.',
  neutral:      'Peer-reviewed research on trauma and mental health — curated for you.',
}

const PREF_LABEL = {
  research: 'Showing you : research-first',
  mixed:    'Showing you : research-first',
  stories:  'Showing you : research-first',
}

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

export default function ResearcherResults({ profile, academicArticles = [] }) {
  const mood = profile.emotionalState || 'neutral'
  const pref = profile.contentPreference || 'research'

  const headline = profile.headline || HEADLINE[mood] || HEADLINE.neutral
  const prefLabel = PREF_LABEL[pref] || PREF_LABEL.research

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
    if (e.key === 'Enter') { e.preventDefault(); addTopic() }
  }

  return (
    <div style={{
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
            trauma_education
          </span>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: '#90a2a9',
            marginLeft: 6,
          }}>
            / results
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: '#90a2a9',
          }}>
            researcher mode
          </span>
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
                Researcher
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
              edit tags
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
                  edit interest tags
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
                    placeholder="add tag&hellip;"
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
                    add
                  </button>
                </div>
              ) : (
                <p style={{
                  margin: 0,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  color: '#90a2a9',
                }}>
                  max 5 tags
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
                [ close ]
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
              Epidemiology &middot; OWID
            </span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: '#90a2a9',
            }}>
              3 series &middot; GBD / IHME
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#e7eef0' }}>
            {/* Chart A */}
            <div style={{ background: '#fff' }}>
              <OwidChart
                src="https://ourworldindata.org/grapher/depressive-disorders-prevalence-ihme"
                title="Depressive disorders — prevalence"
                caption="share of population, by country"
                attribution="ourworldindata.org · IHME GBD 2021"
                minHeight={380}
              />
            </div>
            {/* Chart B */}
            <div style={{ background: '#fff' }}>
              <OwidChart
                src="https://ourworldindata.org/grapher/anxiety-disorders-prevalence"
                title="Anxiety disorders — prevalence"
                caption="share of population, by country"
                attribution="ourworldindata.org · IHME GBD 2021"
                minHeight={380}
              />
            </div>
            {/* Chart C — full width */}
            <div style={{ background: '#fff', gridColumn: '1 / -1' }}>
              <OwidChart
                src="https://ourworldindata.org/grapher/share-with-mental-and-substance-disorders"
                title="Disease burden from mental & substance-use disorders"
                caption="share of total DALYs, global — long-run series"
                attribution="ourworldindata.org · IHME Global Burden of Disease 2021"
                minHeight={460}
              />
            </div>
          </div>
        </section>

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
              Articles &middot; {academicArticles.length} matched
            </span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: '#90a2a9',
            }}>
              sorted: relevance &darr;
            </span>
          </div>

          {academicArticles.length > 0 ? (
            academicArticles.map((article, i) => (
              <ArticleRow key={i} article={article} index={i} />
            ))
          ) : (
            /* Skeleton placeholders when no articles yet */
            <>
              {[0, 1, 2].map(i => (
                <div key={i} className="p3-skel" style={{
                  margin: '16px 20px',
                  borderRadius: 6,
                  height: 72,
                }} />
              ))}
            </>
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
            also:
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
            interactive_map
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
            trends
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
            data_graphs
          </a>
        </section>

      </main>
    </div>
  )
}
