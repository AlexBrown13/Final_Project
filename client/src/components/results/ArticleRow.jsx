import { useState } from 'react'

export default function ArticleRow({ article, index }) {
  const { title, year, journal, firstAuthor, abstract, doi, matchedTags = [] } = article
  const [expanded, setExpanded] = useState(false)
  const [doiCopied, setDoiCopied] = useState(false)

  function copyDoi() {
    navigator.clipboard?.writeText(doi)
    setDoiCopied(true)
    setTimeout(() => setDoiCopied(false), 1500)
  }

  return (
    <article className="p3-row" style={{ padding: '16px 20px', borderBottom: '1px solid #e7eef0' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: '#b3c3c9',
          flexShrink: 0,
          paddingTop: 3,
          width: 22,
        }}>{index}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title — clickable, toggles abstract */}
          <button
            type="button"
            dir="auto"
            onClick={() => setExpanded(e => !e)}
            style={{
              display: 'block',
              textAlign: 'start',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: '#1b2a31',
              lineHeight: 1.35,
              margin: '0 0 7px',
            }}
          >
            {title}
          </button>

          {/* Meta: year · journal · authors */}
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: '#5f747c',
            lineHeight: 1.6,
            marginBottom: 9,
          }}>
            <span style={{ color: '#2f6675' }}>{year}</span>
            {journal ? <> &nbsp;&middot;&nbsp; {journal}</> : null}
            {firstAuthor ? <> &nbsp;&middot;&nbsp; {firstAuthor}</> : null}
          </div>

          {/* DOI row + matched-tag pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: '#90a2a9',
            }}>
              DOI
            </span>
            {doi && (
              <>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: '#42565d',
                }}>
                  {doi}
                </span>
                <button
                  type="button"
                  onClick={copyDoi}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: '#5f747c',
                    background: 'transparent',
                    border: '1px solid #c6d6da',
                    borderRadius: 3,
                    padding: '2px 8px',
                    cursor: 'pointer',
                  }}
                >
                  {doiCopied ? 'copied ✓' : 'copy'}
                </button>
              </>
            )}
            <span style={{ flex: 1 }} />
            {matchedTags.length > 0 && matchedTags.map(tag => (
              <span
                key={tag}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  background: '#e7f0f3',
                  border: '1px solid #b9d6de',
                  color: '#2f6675',
                  borderRadius: 3,
                  padding: '2px 8px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Abstract — shown when expanded; "+ abstract" affordance when collapsed */}
          {abstract && (
            expanded ? (
              <p
                dir="auto"
                style={{
                  margin: '12px 0 4px',
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#3f5158',
                  borderLeft: '2px solid #b9d6de',
                  paddingLeft: 14,
                }}
              >
                {abstract}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setExpanded(e => !e)}
                style={{
                  marginTop: 4,
                  background: 'transparent',
                  border: 'none',
                  color: '#90a2a9',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                + abstract
              </button>
            )
          )}
        </div>
      </div>
    </article>
  )
}
