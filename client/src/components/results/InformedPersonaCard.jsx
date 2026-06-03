export default function InformedPersonaCard({ profile, rtl }) {
  const tags = Array.isArray(profile.interest_tags) ? profile.interest_tags : []
  const persona = profile.persona || 'informed learner'
  const preferred = profile.preferred_content || ''

  return (
    <section className="informed-card">
      <div className="informed-card__header">
        <h2 className="informed-card__title">
          {rtl ? 'הפרופיל שלך' : 'Your profile'}
        </h2>
        <span className="informed-card__badge">{persona}</span>
      </div>
      <div className="informed-card__body">
        {tags.length > 0 && (
          <div className="informed-card__field">
            <span className="informed-card__label">
              {rtl ? 'נושאים' : 'Topics'}
            </span>
            <div className="informed-card__tags">
              {tags.map(tag => (
                <span key={tag} className="informed-card__tag">{tag}</span>
              ))}
            </div>
          </div>
        )}
        {preferred && (
          <div className="informed-card__field">
            <span className="informed-card__label">
              {rtl ? 'תוכן מועדף' : 'Prefers'}
            </span>
            <span className="informed-card__value">{preferred}</span>
          </div>
        )}
      </div>
    </section>
  )
}
