import { useState } from 'react'

export default function ArticleRow({ article }) {
  const { title, year, journal, firstAuthor, abstract, url, matchedTags = [] } = article
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="p3-row" style={{ padding: '16px 20px', borderBottom: '1px solid #e7eef0' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <p
            dir="auto"
            style={{
              fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              color: '#1b2a31',
              lineHeight: 1.35,
              margin: '0 0 7px',
            }}
          >
            {title}
          </p>

          {/* Meta: author · journal · year */}
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: '#5f747c',
            lineHeight: 1.6,
            marginBottom: 8,
          }}>
            <span style={{ color: '#2f6675' }}>{year}</span>
            {firstAuthor ? <> &nbsp;&middot;&nbsp; {firstAuthor}</> : null}
            {journal ? <> &nbsp;&middot;&nbsp; {journal}</> : null}
          </div>

          {/* Abstract — 1 line clamped, toggle to expand */}
          {abstract && (
            <>
              {expanded ? (
                <p
                  dir="auto"
                  style={{
                    margin: '0 0 6px',
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: '#3f5158',
                    borderLeft: '2px solid #b9d6de',
                    paddingLeft: 12,
                  }}
                >
                  {abstract}
                </p>
              ) : (
                <p
                  dir="auto"
                  style={{
                    margin: '0 0 6px',
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: '#3f5158',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {abstract}
                </p>
              )}
              <button
                type="button"
                onClick={() => setExpanded(e => !e)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#90a2a9',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: 6,
                }}
              >
                {expanded ? '− abstract' : '+ abstract'}
              </button>
            </>
          )}

          {/* Matched-tag pills + read link */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
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
            <span style={{ flex: 1 }} />
            {url && url !== '#' ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p3-link"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: '#2f6675',
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                Read source &rarr;
              </a>
            ) : (
              <span
                className="p3-link"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: '#90a2a9',
                  flexShrink: 0,
                }}
              >
                Read source &rarr;
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
