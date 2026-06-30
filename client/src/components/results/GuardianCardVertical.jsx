export default function GuardianCardVertical({ story }) {
  const { thumbnailUrl, headline, summary, date, url, source } = story

  return (
    <article className="p2-card" style={{
      background: '#fff',
      border: '1px solid #e0e4e1',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          style={{ width: '100%', height: 148, objectFit: 'cover', display: 'block' }}
          onError={e => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextSibling.style.display = 'block'
          }}
        />
      ) : null}
      {!thumbnailUrl && (
        <div className="p2-stripe" style={{ height: 148 }} />
      )}
      {thumbnailUrl && (
        <div className="p2-stripe" style={{ height: 148, display: 'none' }} />
      )}
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#052962' }}>{source || 'Story'}</span>
          <span style={{ color: '#c3ccc8' }}>&middot;</span>
          <span style={{ fontSize: 12, color: '#8a938f' }}>{date}</span>
        </div>
        <h3
          dir="auto"
          style={{
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.45,
            margin: '0 0 9px',
            letterSpacing: '-0.01em',
            color: '#232a28',
          }}
        >
          {headline}
        </h3>
        <p
          dir="auto"
          style={{
            fontSize: 14,
            color: '#5c6561',
            lineHeight: 1.6,
            margin: '0 0 13px',
          }}
        >
          {summary}
        </p>
        <a
          href={url}
          className="p2-link"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#4b645f',
            textDecoration: 'none',
          }}
          target="_blank"
          rel="noreferrer"
        >
          Read story &rarr;
        </a>
      </div>
    </article>
  )
}
