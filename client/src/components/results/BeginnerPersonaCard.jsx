export default function BeginnerPersonaCard({ profile, rtl }) {
  const tags = Array.isArray(profile.interest_tags) ? profile.interest_tags : []

  return (
    <section className="beginner-card">
      <p className="beginner-card__heading">
        {rtl ? 'מה שמעניין אותך:' : "You're interested in:"}
      </p>
      {tags.length > 0 && (
        <div className="beginner-card__tags">
          {tags.map(tag => (
            <span key={tag} className="beginner-card__tag">{tag}</span>
          ))}
        </div>
      )}
      <p className="beginner-card__message">
        {rtl
          ? 'הכנו עבורך תוכן שמסביר טראומה בשפה פשוטה ואנושית — סיפורים, הסברים ומשאבי תמיכה.'
          : "We've prepared content that explains trauma in simple, human terms — stories, explanations, and support resources."}
      </p>
    </section>
  )
}
