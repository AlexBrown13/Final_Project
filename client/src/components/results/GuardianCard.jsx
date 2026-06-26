import { useState } from 'react'

export default function GuardianCard({ thumbnailUrl, headline, summary, date, url }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <article className="p1-guardian-card p1-card">
      <div className="p1-guardian-img-col">
        {thumbnailUrl && !imgFailed ? (
          <img
            src={thumbnailUrl}
            alt=""
            onError={() => setImgFailed(true)}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <div className="p1-guardian-stripe" />
        )}
      </div>
      <div className="p1-guardian-text">
        <div className="p1-guardian-source">
          <div className="p1-guardian-source-sq" aria-hidden="true" />
          <span className="p1-guardian-source-name">The Guardian</span>
          {date && <span className="p1-guardian-source-date">{date}</span>}
        </div>
        <p className="p1-guardian-headline" dir="auto">{headline}</p>
        {summary && <p className="p1-guardian-summary" dir="auto">{summary}</p>}
        <a
          className="p1-guardian-link p1-link"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read at The Guardian →
        </a>
      </div>
    </article>
  )
}
