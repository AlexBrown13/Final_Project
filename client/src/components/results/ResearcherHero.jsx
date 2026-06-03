export default function ResearcherHero({ onRetake, retakeBusy, rtl, personaProfile }) {
  const primaryTopic = personaProfile?.primary_topic || ''

  return (
    <header className="researcher-hero">
      <div className="researcher-hero__left">
        <span className="researcher-hero__title">
          {rtl ? 'טראומה בישראל' : 'Trauma in Israel'}
          {primaryTopic && (
            <em className="researcher-hero__topic"> — {primaryTopic}</em>
          )}
        </span>
        <span className="researcher-hero__badge">
          {rtl ? 'חוקר / מקצוען' : 'Researcher'}
        </span>
      </div>
      <button
        type="button"
        className="researcher-hero__retake"
        onClick={onRetake}
        disabled={retakeBusy}
      >
        {retakeBusy
          ? (rtl ? 'מאפס…' : 'Resetting…')
          : (rtl ? 'עשה שאלון מחדש' : 'Retake quiz')}
      </button>
    </header>
  )
}
