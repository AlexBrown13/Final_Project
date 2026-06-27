export default function ArticleRow({
  num,
  title,
  year,
  journal,
  authors,
  doi,
  matchedTags = [],
  abstract,
  expanded,
  doiCopied,
  onToggle,
  onCopyDoi,
}) {
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
        }}>
          {num}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            type="button"
            onClick={onToggle}
            className="p3-tlink"
            style={{
              display: 'block',
              textAlign: 'start',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: '#1b2a31',
              lineHeight: 1.35,
              marginBottom: 7,
            }}
          >
            {title}
          </button>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: '#5f747c',
            lineHeight: 1.6,
            marginBottom: 9,
          }}>
            <span style={{ color: '#2f6675' }}>{year}</span> &nbsp;&middot;&nbsp; {journal} &nbsp;&middot;&nbsp; {authors}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#90a2a9' }}>DOI</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#42565d' }}>{doi}</span>
            <button
              type="button"
              onClick={onCopyDoi}
              className="p3-copy"
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
            <span style={{ flex: 1 }} />
            {matchedTags.map(tg => (
              <span
                key={tg}
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
                {tg}
              </span>
            ))}
          </div>
          {expanded ? (
            <p style={{
              margin: '12px 0 4px',
              fontSize: 14,
              lineHeight: 1.6,
              color: '#3f5158',
              borderLeft: '2px solid #b9d6de',
              paddingLeft: 14,
            }}>
              {abstract}
            </p>
          ) : (
            <button
              type="button"
              onClick={onToggle}
              className="p3-copy"
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
          )}
        </div>
      </div>
    </article>
  )
}
