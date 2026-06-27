import { useState } from 'react'
import ArticleRow from './ArticleRow.jsx'

const MOCK_PROFILE = {
  persona: 'researcher',
  primaryTopic: 'PTSD prevalence in conflict zones',
  contentPreference: 'research',
  interestTags: ['PTSD', 'prevalence', 'October 7', 'civilians', 'epidemiology'],
  openAlexQuery: '(PTSD OR "post-traumatic stress") AND ("armed conflict" OR "war exposure" OR civilian) AND (prevalence OR epidemiology)',
}

const MOCK_ARTICLES = [
  { title: 'Prevalence of PTSD in populations exposed to armed conflict: a systematic review and meta-analysis', year: 2024, journal: 'Lancet Psychiatry', authors: 'Charlson F, van Ommeren M, et al.', doi: '10.1016/S2215-0366(24)00112-9', matchedTags: ['PTSD', 'prevalence'], abstract: 'Pooled estimates across 129 studies (N = 1.7M) place the prevalence of PTSD among conflict-exposed populations at 22.3% (95% CI 18.1–27.0), with substantial heterogeneity attributable to exposure intensity and time since event.', url: '#' },
  { title: 'Trajectories of post-traumatic stress following mass-casualty events', year: 2023, journal: 'JAMA Psychiatry', authors: 'Galatzer-Levy I, Bonanno G.', doi: '10.1001/jamapsychiatry.2023.0455', matchedTags: ['PTSD'], abstract: 'Latent growth-mixture modeling identifies four stable response trajectories — resilient, recovering, chronic, and delayed-onset — with resilience the modal outcome even at high exposure levels.', url: '#' },
  { title: 'Civilian PTSD in protracted conflict zones: a systematic review of risk and protective factors', year: 2025, journal: 'World Psychiatry', authors: 'Hoppen T, Morina N.', doi: '10.1002/wps.21188', matchedTags: ['PTSD', 'civilians'], abstract: 'Ongoing threat, displacement, and loss of social capital emerge as the strongest predictors of chronic course; perceived social support and collective efficacy are the most consistent protective factors.', url: '#' },
  { title: 'Estimating the population mental-health burden of the October 2023 events in Israel', year: 2024, journal: 'Israel Journal of Psychiatry', authors: 'Levav I, Bleich A.', doi: '10.1234/ijp.2024.0917', matchedTags: ['October 7', 'prevalence'], abstract: 'Early modeling projects a marked increase in incident PTSD and prolonged-grief disorder, concentrated in directly exposed communities and first-responder cohorts, with implications for service capacity planning.', url: '#' },
  { title: 'Sleep disturbance and nightmares as predictors of chronic PTSD in displaced civilians', year: 2023, journal: 'Sleep Medicine Reviews', authors: 'Ben-Zur H, Gilboa-Schechtman E.', doi: '10.1016/j.smrv.2023.101802', matchedTags: ['PTSD', 'civilians'], abstract: 'Polysomnographic and self-report data converge on disrupted REM continuity as an early marker of chronic course, suggesting sleep-targeted intervention windows in the first months after displacement.', url: '#' },
  { title: 'Intergenerational transmission of trauma in families of conflict survivors', year: 2022, journal: 'Development and Psychopathology', authors: 'Dekel R, Solomon Z.', doi: '10.1017/S0954579422000451', matchedTags: ['epidemiology'], abstract: 'A three-generation cohort finds attenuated but measurable transmission of post-traumatic symptomatology, mediated more strongly by parental emotional availability than by direct disclosure of events.', url: '#' },
  { title: 'Neuroimaging correlates of PTSD symptom severity: a coordinate-based meta-analysis', year: 2024, journal: 'Biological Psychiatry', authors: 'Admon R, Hendler T.', doi: '10.1016/j.biopsych.2024.02.011', matchedTags: ['PTSD'], abstract: 'Hyperactivation of the amygdala alongside hypoactivation of the ventromedial prefrontal cortex scales with symptom severity across 64 studies, supporting a dysregulated threat-appraisal model.', url: '#' },
  { title: 'Cost-effectiveness of scaled-up trauma interventions in conflict-affected health systems', year: 2023, journal: 'Health Policy and Planning', authors: 'Chisholm D, et al.', doi: '10.1093/heapol/czad055', matchedTags: ['prevalence', 'epidemiology'], abstract: 'Task-shifted, group-delivered interventions achieve acceptable cost-per-DALY-averted thresholds even under constrained budgets, strengthening the economic case for population-level scale-up.', url: '#' },
  { title: 'Resilience and post-traumatic growth among first responders after mass-casualty deployment', year: 2024, journal: 'Journal of Anxiety Disorders', authors: 'Palgi Y, Shrira A.', doi: '10.1016/j.janxdis.2024.102788', matchedTags: ['civilians'], abstract: 'Longitudinal tracking of emergency personnel identifies peer cohesion and perceived organizational support as the strongest modifiable predictors of post-traumatic growth at twelve months.', url: '#' },
]

const MONO = "'IBM Plex Mono', monospace"
const SANS = "'IBM Plex Sans', -apple-system, sans-serif"

const CONTENT_PREF_LABEL = {
  research: 'Research & data only',
  mixed: 'Balanced mix',
  stories: 'Stories, with research',
}

function OwidChart({ src, title, subtitle, attribution, minHeight, state, onLoad, onError, fallbackText }) {
  return (
    <div style={{ background: '#fff', ...(minHeight >= 460 ? { gridColumn: '1 / -1' } : null) }}>
      <div style={{ padding: '11px 16px', borderBottom: '1px solid #eef3f4' }}>
        <span style={{ display: 'block', fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#1b2a31' }}>
          {title}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: '#90a2a9' }}>{subtitle}</span>
      </div>
      <div style={{ position: 'relative', minHeight }}>
        {state === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, background: '#fff', padding: 18 }}>
            <div className="p3-skel" style={{ height: 14, width: '46%', borderRadius: 4, marginBottom: 16 }} />
            <div className="p3-skel" style={{ height: minHeight >= 460 ? 360 : 288, width: '100%', borderRadius: 6 }} />
            <p style={{ textAlign: 'center', fontFamily: MONO, color: '#90a2a9', fontSize: 11, marginTop: 12 }}>
              fetching grapher&hellip;
            </p>
          </div>
        )}
        {state === 'failed' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight, background: '#f7fafb', textAlign: 'center', padding: minHeight >= 460 ? 36 : 28 }}>
            <p style={{ fontFamily: MONO, fontSize: minHeight >= 460 ? 13 : 12, color: '#5f747c', maxWidth: minHeight >= 460 ? '48ch' : '34ch', margin: 0 }}>
              {fallbackText}
            </p>
          </div>
        )}
        <iframe
          src={src}
          loading="lazy"
          title={title}
          onLoad={onLoad}
          onError={onError}
          style={state === 'ready'
            ? { width: '100%', height: minHeight, border: 'none', display: 'block' }
            : { width: '100%', height: minHeight, border: 'none', display: 'block', opacity: 0, position: 'absolute', inset: 0 }
          }
        />
      </div>
      <div style={{ padding: '8px 16px', borderTop: '1px solid #eef3f4' }}>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: '#90a2a9' }}>{attribution}</span>
      </div>
    </div>
  )
}

export default function ResearcherResults({ profile, academicArticles = [] }) {
  const data = profile || MOCK_PROFILE
  const articles = academicArticles.length > 0 ? academicArticles : MOCK_ARTICLES

  const [dir, setDir] = useState('ltr')
  const [topicsOpen, setTopicsOpen] = useState(false)
  const [topics, setTopics] = useState(data.interestTags || [])
  const [addVal, setAddVal] = useState('')
  const [owidA, setOwidA] = useState('loading')
  const [owidB, setOwidB] = useState('loading')
  const [owidC, setOwidC] = useState('loading')
  const [queryCopied, setQueryCopied] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [doiCopied, setDoiCopied] = useState({})

  const atMax = topics.length >= 5
  const canAdd = topics.length < 5

  function removeTopic(t) {
    setTopics(prev => prev.filter(x => x !== t))
  }

  function addTopic() {
    const v = addVal.trim()
    if (!v || atMax || topics.includes(v)) { setAddVal(''); return }
    setTopics(prev => [...prev, v])
    setAddVal('')
  }

  function handleAddKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); addTopic() }
  }

  function copyQuery() {
    try { navigator.clipboard && navigator.clipboard.writeText(data.openAlexQuery || '') } catch { /* ignore */ }
    setQueryCopied(true)
    setTimeout(() => setQueryCopied(false), 1500)
  }

  function copyDoi(i, doi) {
    try { navigator.clipboard && navigator.clipboard.writeText(doi) } catch { /* ignore */ }
    setDoiCopied(prev => ({ ...prev, [i]: true }))
    setTimeout(() => setDoiCopied(prev => ({ ...prev, [i]: false })), 1500)
  }

  function toggleExpanded(i) {
    setExpanded(prev => ({ ...prev, [i]: !prev[i] }))
  }

  const prefLabel = CONTENT_PREF_LABEL[data.contentPreference] || CONTENT_PREF_LABEL.research

  return (
    <div dir={dir} style={{
      fontFamily: SANS,
      background: '#eef3f5',
      color: '#1b2a31',
      minHeight: '100vh',
      fontSize: 15,
      lineHeight: 1.5,
    }}>

      {/* NAV */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '13px 32px',
        borderBottom: '1px solid #dce5e8',
        position: 'sticky',
        top: 0,
        background: 'rgba(238,243,245,.92)',
        backdropFilter: 'blur(8px)',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 18, height: 18, border: '2px solid #2f6675', borderRadius: 3 }} />
          <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500, letterSpacing: '.02em', color: '#1b2a31' }}>
            trauma_education
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#90a2a9', marginLeft: 6 }}>/ results</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#90a2a9' }}>researcher mode</span>
          <button
            type="button"
            onClick={() => setDir(d => (d === 'ltr' ? 'rtl' : 'ltr'))}
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: '#2f6675',
              background: 'transparent',
              border: '1px solid #c6d6da',
              borderRadius: 4,
              padding: '5px 12px',
              cursor: 'pointer',
            }}
          >
            {dir === 'ltr' ? 'עברית' : 'EN'}
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '30px 32px 70px' }}>

        {/* EXTRACTED PROFILE */}
        <section style={{ border: '1px solid #d7e1e4', borderRadius: 8, background: '#fff', marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #e7eef0' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#2f6675' }}>
              Extracted profile
            </span>
            <button
              type="button"
              onClick={() => setTopicsOpen(true)}
              className="p3-copy"
              style={{ fontFamily: MONO, fontSize: 11, color: '#5f747c', background: 'transparent', border: '1px solid #c6d6da', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
            >
              edit tags
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '16px 20px', borderRight: '1px solid #e7eef0', borderBottom: '1px solid #e7eef0' }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#90a2a9', marginBottom: 5 }}>persona</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Researcher</div>
            </div>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e7eef0' }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#90a2a9', marginBottom: 5 }}>primary topic</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{data.primaryTopic || 'PTSD prevalence in conflict zones'}</div>
            </div>
            <div style={{ padding: '16px 20px', borderRight: '1px solid #e7eef0', borderBottom: '1px solid #e7eef0' }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#90a2a9', marginBottom: 5 }}>content preference</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{prefLabel}</div>
            </div>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e7eef0' }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#90a2a9', marginBottom: 8 }}>interest tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(data.interestTags || []).map(t => (
                  <span
                    key={t}
                    style={{ fontFamily: MONO, fontSize: 12, background: '#e7f0f3', border: '1px solid #b9d6de', color: '#2f6675', borderRadius: 4, padding: '3px 9px' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* OpenAlex query */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#90a2a9' }}>
                OpenAlex boolean query
              </span>
              <button
                type="button"
                onClick={copyQuery}
                className="p3-copy"
                style={{ fontFamily: MONO, fontSize: 11, color: '#5f747c', background: 'transparent', border: '1px solid #c6d6da', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
              >
                {queryCopied ? 'copied ✓' : 'copy'}
              </button>
            </div>
            <pre style={{
              margin: 0,
              fontFamily: MONO,
              fontSize: 12.5,
              lineHeight: 1.7,
              color: '#2a4750',
              background: '#f3f7f8',
              border: '1px solid #dce5e8',
              borderRadius: 6,
              padding: '13px 15px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {data.openAlexQuery}
            </pre>
          </div>

          {/* EDIT TAGS PANEL */}
          {topicsOpen && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid #e7eef0', background: '#f7fafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#2f6675' }}>
                  edit interest tags
                </span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#90a2a9' }}>{topics.length}/5</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {topics.map(t => (
                  <span
                    key={t}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: MONO, fontSize: 12, background: '#e7f0f3', border: '1px solid #b9d6de', color: '#2f6675', borderRadius: 4, padding: '3px 6px 3px 9px' }}
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTopic(t)}
                      className="p3-x"
                      aria-label={`remove ${t}`}
                      style={{ background: 'transparent', border: 'none', color: '#7c919a', fontSize: 13, cursor: 'pointer', lineHeight: 1, padding: 0 }}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              {canAdd ? (
                <div style={{ display: 'flex', gap: 7, maxWidth: 420 }}>
                  <input
                    type="text"
                    value={addVal}
                    onChange={e => setAddVal(e.target.value)}
                    onKeyDown={handleAddKey}
                    placeholder="add tag…"
                    style={{ flex: 1, fontFamily: MONO, fontSize: 12, background: '#fff', border: '1px solid #c6d6da', borderRadius: 5, padding: '8px 11px', color: '#1b2a31', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={addTopic}
                    style={{ fontFamily: MONO, fontSize: 12, background: '#2f6675', border: '1px solid #2f6675', color: '#fff', borderRadius: 5, padding: '8px 16px', cursor: 'pointer' }}
                  >
                    add
                  </button>
                </div>
              ) : (
                <p style={{ margin: 0, fontFamily: MONO, fontSize: 11, color: '#90a2a9' }}>max 5 tags</p>
              )}
              <button
                type="button"
                onClick={() => setTopicsOpen(false)}
                style={{ marginTop: 11, background: 'transparent', border: 'none', color: '#90a2a9', fontFamily: MONO, fontSize: 11, cursor: 'pointer', padding: 0 }}
              >
                [ close ]
              </button>
            </div>
          )}
        </section>

        {/* OWID */}
        <section style={{ border: '1px solid #d7e1e4', borderRadius: 8, background: '#fff', marginBottom: 26, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #e7eef0' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#2f6675' }}>
              Epidemiology &middot; OWID
            </span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: '#90a2a9' }}>3 series &middot; GBD / IHME</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#e7eef0' }}>
            <OwidChart
              src="https://ourworldindata.org/grapher/depressive-disorders-prevalence-ihme"
              title="Depressive disorders — prevalence"
              subtitle="share of population, by country"
              attribution="ourworldindata.org · IHME GBD 2021"
              minHeight={380}
              state={owidA}
              onLoad={() => setOwidA('ready')}
              onError={() => setOwidA('failed')}
              fallbackText="[ series unavailable ]"
            />
            <OwidChart
              src="https://ourworldindata.org/grapher/anxiety-disorders-prevalence"
              title="Anxiety disorders — prevalence"
              subtitle="share of population, by country"
              attribution="ourworldindata.org · IHME GBD 2021"
              minHeight={380}
              state={owidB}
              onLoad={() => setOwidB('ready')}
              onError={() => setOwidB('failed')}
              fallbackText="[ series unavailable ]"
            />
            <OwidChart
              src="https://ourworldindata.org/grapher/share-with-mental-and-substance-disorders"
              title="Disease burden from mental & substance-use disorders"
              subtitle="share of total DALYs, global — long-run series"
              attribution="ourworldindata.org · IHME Global Burden of Disease 2021"
              minHeight={460}
              state={owidC}
              onLoad={() => setOwidC('ready')}
              onError={() => setOwidC('failed')}
              fallbackText="[ series unavailable ] — this grapher could not be reached. Other series and article results are unaffected."
            />
          </div>
        </section>

        {/* ARTICLE RESULTS */}
        <section style={{ border: '1px solid #d7e1e4', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #e7eef0' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#2f6675' }}>
              Articles &middot; {articles.length} matched
            </span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: '#90a2a9' }}>sorted: relevance &darr;</span>
          </div>
          {articles.map((a, i) => (
            <ArticleRow
              key={i}
              num={String(i + 1).padStart(2, '0')}
              title={a.title}
              year={a.year}
              journal={a.journal}
              authors={a.authors}
              doi={a.doi}
              matchedTags={a.matchedTags}
              abstract={a.abstract}
              expanded={!!expanded[i]}
              doiCopied={!!doiCopied[i]}
              onToggle={() => toggleExpanded(i)}
              onCopyDoi={() => copyDoi(i, a.doi)}
            />
          ))}
          <div style={{ padding: '14px 20px' }}>
            <a href="#" className="p3-tlink" style={{ fontFamily: MONO, fontSize: 13, color: '#2f6675', textDecoration: 'none' }}>
              &rarr; open full result set (47 articles)
            </a>
          </div>
        </section>

        {/* ALSO EXPLORE */}
        <section style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: '6px 22px', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#90a2a9' }}>also:</span>
          <a href="#" className="p3-tlink" style={{ fontFamily: MONO, fontSize: 13, color: '#42565d', textDecoration: 'none' }}>interactive_map</a>
          <a href="#" className="p3-tlink" style={{ fontFamily: MONO, fontSize: 13, color: '#42565d', textDecoration: 'none' }}>trends</a>
          <a href="#" className="p3-tlink" style={{ fontFamily: MONO, fontSize: 13, color: '#42565d', textDecoration: 'none' }}>data_graphs</a>
        </section>
      </main>
    </div>
  )
}
