export default function AcademicCard({ title, year, journal, firstAuthor, abstract, url, matchedTags = [] }) {
  const meta = [firstAuthor, journal, year].filter(Boolean).join(' · ')

  return (
    <article className="p1-academic-card p1-card">
      <div className="p1-academic-kicker">Research · peer-reviewed</div>
      <h3 className="p1-academic-title">{title}</h3>
      {meta && <div className="p1-academic-meta">{meta}</div>}
      {abstract && <p className="p1-academic-abstract">{abstract}</p>}
      {matchedTags.length > 0 && (
        <div className="p1-academic-tags">
          <span className="p1-academic-tag-label">matched :</span>
          {matchedTags.map(tag => (
            <span key={tag} className="p1-academic-tag-pill">{tag}</span>
          ))}
        </div>
      )}
      <a
        className="p1-academic-link p1-link"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Read this, gently →
      </a>
    </article>
  )
}
