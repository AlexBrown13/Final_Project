export default function AcademicCardTeal({ article }) {
  const { title, year, journal, firstAuthor, abstract, url, matchedTags = [] } = article

  return (
    <article className="p2-card" style={{
      background: '#eef1ee',
      border: '1px solid #dde3df',
      borderTop: '3px solid #7da984',
      borderRadius: '0 0 12px 12px',
      padding: '20px 22px',
    }}>
      <span style={{
        fontFamily: 'ui-monospace, monospace',
        fontSize: 10,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        color: '#7a8a82',
        fontWeight: 600,
      }}>
        Journal article
      </span>
      <h3 dir="auto" style={{
        fontFamily: "'Source Serif 4', serif",
        fontSize: 19,
        fontWeight: 600,
        lineHeight: 1.32,
        margin: '8px 0 10px',
        color: '#232a28',
      }}>
        {title}
      </h3>
      <p style={{ fontSize: 12.5, color: '#7a847f', margin: '0 0 11px', fontWeight: 500 }}>
        {firstAuthor} &middot; {journal} &middot; {year}
      </p>
      <p dir="auto" style={{ fontSize: 14, color: '#5c6561', lineHeight: 1.5, margin: '0 0 14px' }}>
        {abstract}
      </p>
      {matchedTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: '#9aa39e' }}>matched</span>
          {matchedTags.map(tag => (
            <span
              key={tag}
              style={{
                background: '#dce8de',
                color: '#3a5a42',
                borderRadius: 4,
                padding: '3px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <a
        href={url}
        className="p2-link"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#4b645f',
          textDecoration: 'none',
          display: 'block',
          textAlign: 'right',
        }}
        target="_blank"
        rel="noreferrer"
      >
        Read article &rarr;
      </a>
    </article>
  )
}
