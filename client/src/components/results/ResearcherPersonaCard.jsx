import { useState } from 'react'

export default function ResearcherPersonaCard({ profile, rtl }) {
  const [copied, setCopied] = useState(false)

  const tags = Array.isArray(profile.interest_tags) ? profile.interest_tags : []
  const persona = profile.persona || 'researcher'
  const preferred = profile.preferred_content || ''
  const primaryTopic = profile.primary_topic || ''
  const searchQuery = profile.search_query || ''

  const copyQuery = () => {
    if (!searchQuery) return
    navigator.clipboard.writeText(searchQuery).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section className="researcher-card">
      <div className="researcher-card__header">
        <h2 className="researcher-card__title">
          {rtl ? 'פרופיל מחקרי' : 'Research profile'}
        </h2>
        <span className="researcher-card__badge">{persona}</span>
      </div>

      <div className="researcher-card__grid">
        {primaryTopic && (
          <div className="researcher-card__field">
            <span className="researcher-card__label">
              {rtl ? 'מיקוד' : 'Focus'}
            </span>
            <span className="researcher-card__value">{primaryTopic}</span>
          </div>
        )}
        {tags.length > 0 && (
          <div className="researcher-card__field">
            <span className="researcher-card__label">
              {rtl ? 'נושאים' : 'Topics'}
            </span>
            <span className="researcher-card__value">{tags.join(' · ')}</span>
          </div>
        )}
        {preferred && (
          <div className="researcher-card__field">
            <span className="researcher-card__label">
              {rtl ? 'תוכן' : 'Content'}
            </span>
            <span className="researcher-card__value">{preferred}</span>
          </div>
        )}
      </div>

      {searchQuery && (
        <div className="researcher-card__query-block">
          <div className="researcher-card__query-header">
            <span className="researcher-card__query-label">
              {rtl ? 'שאילתת OpenAlex' : 'OpenAlex search query'}
            </span>
            <button
              type="button"
              className="researcher-card__copy-btn"
              onClick={copyQuery}
            >
              {copied ? (rtl ? 'הועתק ✓' : 'Copied ✓') : (rtl ? 'העתק' : 'Copy')}
            </button>
          </div>
          <code className="researcher-card__query">{searchQuery}</code>
        </div>
      )}
    </section>
  )
}
