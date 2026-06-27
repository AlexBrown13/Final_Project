import { useState } from 'react'
import GuardianCardVertical from './GuardianCardVertical.jsx'
import AcademicCardTeal from './AcademicCardTeal.jsx'

const HEADLINE = {
  professional: 'As a social worker, you want both the human story and the evidence behind it.',
  curious:      'A balanced look at PTSD — the stories and the evidence, side by side.',
  grieving:     'This work is personal as well as professional. Here is the human side, and the evidence.',
}

const PREF_LABEL = {
  mixed:    'Showing you : a balanced mix of stories and research',
  stories:  'Showing you : stories, with supporting research',
  research: 'Showing you : research, with human context',
}

function OwidChart({ src, title, caption, attribution }) {
  const [state, setState] = useState('loading')

  return (
    <div style={{ border: '1px solid #e0e4e1', borderRadius: 14, background: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px 12px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 2px', color: '#232a28' }}>{title}</h3>
        <p style={{ fontSize: 12.5, color: '#7a847f', margin: 0 }}>{caption}</p>
      </div>
      <div style={{ position: 'relative', borderTop: '1px solid #eef1ee', minHeight: 440 }}>
        {state === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, padding: 20 }}>
            <div className="p2-skel" style={{ height: 18, width: '50%', borderRadius: 5, marginBottom: 18 }} />
            <div className="p2-skel" style={{ height: 340, width: '100%', borderRadius: 8 }} />
            <p style={{ textAlign: 'center', color: '#9aa39e', fontSize: 12, marginTop: 14 }}>
              Loading Our World in Data&hellip;
            </p>
          </div>
        )}
        {state === 'failed' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 440, textAlign: 'center', padding: 32 }}>
            <p style={{ fontSize: 14, color: '#5c6561', maxWidth: '36ch', margin: 0 }}>
              This chart is unavailable right now. The other views are unaffected.
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
            ? { width: '100%', height: 440, border: 'none', display: 'block' }
            : { opacity: 0, position: 'absolute', inset: 0, width: '100%', height: 440, border: 'none' }
          }
        />
      </div>
      <p style={{ fontSize: 11.5, color: '#9aa39e', padding: '10px 20px', margin: 0, borderTop: '1px solid #eef1ee' }}>
        {attribution}
      </p>
    </div>
  )
}

export default function InformedResults({ profile, guardianStories = [], academicArticles = [] }) {
  const mood = profile.emotionalState || 'professional'
  const pref = profile.contentPreference || 'mixed'

  const headline = profile.headline || HEADLINE[mood] || HEADLINE.professional
  const prefLabel = PREF_LABEL[pref] || PREF_LABEL.mixed

  const showSecondStory    = pref !== 'research'
  const showSecondResearch = pref !== 'stories'
  const showThirdResearch  = pref === 'research'

  const [dir, setDir] = useState('ltr')
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
    <div dir={dir} style={{
      fontFamily: "'Archivo', -apple-system, sans-serif",
      background: '#f4f5f3',
      color: '#232a28',
      minHeight: '100vh',
      fontSize: 16,
      lineHeight: 1.55,
    }}>

      {/* NAV */}
      <nav className="p2-nav" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 44px',
        background: '#4b645f',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 24, height: 24, borderRadius: 5, background: '#9bb0aa' }} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>trauma education</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <span style={{ fontSize: 13, color: '#b9c6c2', fontWeight: 500 }}>Results</span>
          <button
            type="button"
            onClick={() => setDir(d => d === 'ltr' ? 'rtl' : 'ltr')}
            aria-label="Toggle language direction"
            style={{
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              background: 'rgba(255,255,255,.12)',
              border: '1px solid rgba(255,255,255,.25)',
              borderRadius: 6,
              padding: '6px 14px',
              cursor: 'pointer',
            }}
          >
            {dir === 'ltr' ? 'עברית' : 'English'}
          </button>
        </div>
      </nav>

      {/* HERO BAND */}
      <header style={{ background: '#4b645f', color: '#fff', padding: '14px 44px 52px' }}>
        <div className="p2-hero" style={{ maxWidth: 1120, margin: '0 auto' }}>

          {/* Badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              color: '#b9c6c2',
            }}>
              Informed Learner
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#7da984' }} />
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.04em', color: '#9bb0aa' }}>
              Primary topic &mdash; {profile.primaryTopic || 'PTSD'}
            </span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontFamily: "'Source Serif 4', serif",
            fontWeight: 500,
            fontSize: 38,
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
            margin: '0 0 24px',
            maxWidth: '24ch',
          }}>
            {headline}
          </h1>

          {/* Pref + tags row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.2)',
              borderRadius: 8,
              padding: '9px 15px',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7da984' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#eaf0ee' }}>{prefLabel}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {topics.map(t => (
                <span
                  key={t}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,.14)',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '6px 13px',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {t}
                </span>
              ))}
              <button
                type="button"
                className="p2-link"
                onClick={() => setTopicsOpen(o => !o)}
                aria-expanded={topicsOpen}
                style={{
                  background: 'transparent',
                  border: '1px dashed rgba(255,255,255,.4)',
                  borderRadius: 6,
                  color: '#cdd9d5',
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: '6px 13px',
                  fontFamily: 'inherit',
                }}
              >
                adjust
              </button>
            </div>
          </div>

          {/* ADJUST PANEL */}
          {topicsOpen && (
            <div style={{
              marginTop: 18,
              background: '#fff',
              color: '#232a28',
              borderRadius: 10,
              padding: '20px 22px',
              maxWidth: 580,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 13 }}>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.02em' }}>EDIT INTEREST TAGS</span>
                <span style={{ fontSize: 13, color: '#8a938f' }}>{topics.length} / 5</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {topics.map(t => (
                  <span
                    key={t}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      background: '#eef1ee',
                      color: '#3a4a45',
                      borderRadius: 6,
                      padding: '6px 8px 6px 13px',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTopic(t)}
                      aria-label={`Remove ${t}`}
                      style={{
                        width: 17,
                        height: 17,
                        borderRadius: 4,
                        border: 'none',
                        background: '#cbd5d1',
                        color: '#3a4a45',
                        fontSize: 12,
                        cursor: 'pointer',
                        lineHeight: 1,
                      }}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              {!atMax ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={addVal}
                    onChange={e => setAddVal(e.target.value)}
                    onKeyDown={handleAddKey}
                    placeholder="add a tag…"
                    maxLength={40}
                    style={{
                      flex: 1,
                      fontFamily: 'inherit',
                      fontSize: 13,
                      border: '1px solid #d4dcd8',
                      borderRadius: 7,
                      padding: '9px 12px',
                      background: '#f8faf9',
                      color: '#232a28',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTopic}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 13,
                      fontWeight: 600,
                      background: '#4b645f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 7,
                      padding: '9px 18px',
                      cursor: 'pointer',
                    }}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: '#8a938f' }}>
                  Maximum of five tags. Remove one to add another.
                </p>
              )}
              <button
                type="button"
                onClick={() => setTopicsOpen(false)}
                style={{
                  marginTop: 14,
                  background: 'transparent',
                  border: 'none',
                  color: '#7a847f',
                  fontSize: 13,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                close
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main className="p2-reveal" style={{ maxWidth: 1120, margin: '0 auto', padding: 44 }}>

        {/* TWO-COLUMN FEED */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34 }}>

          {/* STORIES COLUMN */}
          <div>
            <div className="p2-feed-head" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingBottom: 13,
              borderBottom: '2px solid #4b645f',
              marginBottom: 22,
            }}>
              <span style={{ width: 16, height: 16, borderRadius: 3, background: '#052962' }} />
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                Stories &middot; The Guardian
              </span>
            </div>
            <div className="p2-feedcol" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {guardianStories.length > 0 ? (
                <>
                  <GuardianCardVertical story={guardianStories[0]} />
                  {showSecondStory && guardianStories[1] && (
                    <GuardianCardVertical story={guardianStories[1]} />
                  )}
                </>
              ) : (
                /* placeholder card when no stories yet */
                <article className="p2-card" style={{
                  background: '#fff',
                  border: '1px solid #e0e4e1',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  <div className="p2-stripe" style={{ height: 148 }} />
                  <div style={{ padding: '18px 20px' }}>
                    <div className="p2-skel" style={{ height: 12, width: '40%', borderRadius: 4, marginBottom: 10 }} />
                    <div className="p2-skel" style={{ height: 18, width: '90%', borderRadius: 4, marginBottom: 8 }} />
                    <div className="p2-skel" style={{ height: 14, width: '70%', borderRadius: 4 }} />
                  </div>
                </article>
              )}
            </div>
          </div>

          {/* RESEARCH COLUMN */}
          <div>
            <div className="p2-feed-head" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingBottom: 13,
              borderBottom: '2px solid #7da984',
              marginBottom: 22,
            }}>
              <span style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '3px solid #7da984',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                Research &middot; peer-reviewed
              </span>
            </div>
            <div className="p2-feedcol" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {academicArticles.length > 0 ? (
                <>
                  <AcademicCardTeal article={academicArticles[0]} />
                  {showSecondResearch && academicArticles[1] && (
                    <AcademicCardTeal article={academicArticles[1]} />
                  )}
                  {showThirdResearch && academicArticles[2] && (
                    <AcademicCardTeal article={academicArticles[2]} />
                  )}
                </>
              ) : (
                /* placeholder card when no articles yet */
                <article className="p2-card" style={{
                  background: '#eef1ee',
                  border: '1px solid #dde3df',
                  borderTop: '3px solid #7da984',
                  borderRadius: '0 0 12px 12px',
                  padding: '20px 22px',
                }}>
                  <div className="p2-skel" style={{ height: 10, width: '30%', borderRadius: 4, marginBottom: 10 }} />
                  <div className="p2-skel" style={{ height: 19, width: '85%', borderRadius: 4, marginBottom: 10 }} />
                  <div className="p2-skel" style={{ height: 12, width: '55%', borderRadius: 4, marginBottom: 12 }} />
                  <div className="p2-skel" style={{ height: 14, width: '100%', borderRadius: 4 }} />
                </article>
              )}
            </div>
          </div>
        </div>

        {/* OWID SECTION */}
        <section style={{ marginTop: 48 }}>
          <div style={{ marginBottom: 18 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: '#7a847f',
            }}>
              Data context
            </span>
            <h2 style={{ fontSize: 21, fontWeight: 600, margin: '7px 0 4px', letterSpacing: '-0.01em', color: '#232a28' }}>
              Mental health in the wider picture
            </h2>
            <p style={{ fontSize: 14, color: '#5c6561', margin: 0, maxWidth: '62ch' }}>
              Two views to set the populations you work with against the global picture &mdash; overall burden,
              and how depression prevalence compares across countries.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
            <OwidChart
              src="https://ourworldindata.org/grapher/share-with-mental-and-substance-disorders"
              title="Living with a mental or substance-use disorder"
              caption="Share of population, global picture."
              attribution="Source: Our World in Data · Global Burden of Disease."
            />
            <OwidChart
              src="https://ourworldindata.org/grapher/depressive-disorders-prevalence-ihme"
              title="Depression prevalence, by country"
              caption="Where Israel sits in an international comparison."
              attribution="Source: Our World in Data · IHME GBD 2021."
            />
          </div>
        </section>

        {/* CTA */}
        <section style={{
          marginTop: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 30,
          background: '#4b645f',
          borderRadius: 14,
          padding: '32px 38px',
          color: '#fff',
        }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
              Your complete personalized reading list
            </h2>
            <p style={{ fontSize: 15, color: '#cdd9d5', margin: 0 }}>
              Stories and research, organized around the tags you follow.
            </p>
          </div>
          <a
            href="/articles"
            style={{
              flexShrink: 0,
              background: '#fff',
              color: '#4b645f',
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
              borderRadius: 8,
              padding: '13px 26px',
              whiteSpace: 'nowrap',
            }}
          >
            See your curated article set &rarr;
          </a>
        </section>

        {/* ALSO EXPLORE */}
        <section style={{ marginTop: 42 }}>
          <p style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: '#9aa39e',
            margin: '0 0 16px',
          }}>
            Also explore
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <a
              href="/map"
              className="p2-card"
              style={{
                display: 'block',
                background: '#fff',
                border: '1px solid #e0e4e1',
                borderRadius: 10,
                padding: '18px 20px',
                textDecoration: 'none',
                color: '#232a28',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                Interactive Map
              </span>
              <span style={{ fontSize: 13, color: '#7a847f', lineHeight: 1.45 }}>
                Crisis-line call records across Israeli cities, over time.
              </span>
            </a>
            <a
              href="/trends"
              className="p2-card"
              style={{
                display: 'block',
                background: '#fff',
                border: '1px solid #e0e4e1',
                borderRadius: 10,
                padding: '18px 20px',
                textDecoration: 'none',
                color: '#232a28',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                Trends
              </span>
              <span style={{ fontSize: 13, color: '#7a847f', lineHeight: 1.45 }}>
                Search interest in trauma terms across Israel.
              </span>
            </a>
            <a
              href="/graphs/israel"
              className="p2-card"
              style={{
                display: 'block',
                background: '#fff',
                border: '1px solid #e0e4e1',
                borderRadius: 10,
                padding: '18px 20px',
                textDecoration: 'none',
                color: '#232a28',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                Data Graphs
              </span>
              <span style={{ fontSize: 13, color: '#7a847f', lineHeight: 1.45 }}>
                Addictions, sleep, domestic violence, system load.
              </span>
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
