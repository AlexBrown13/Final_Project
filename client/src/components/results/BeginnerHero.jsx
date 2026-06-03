export default function BeginnerHero({ onRetake, retakeBusy, rtl }) {
  return (
    <header className="beginner-hero">
      <span className="beginner-hero__badge">
        {rtl ? 'מסלול מותאם אישית' : 'Personalised for you'}
      </span>
      <h1 className="beginner-hero__title">
        {rtl ? 'ברוכים הבאים — זה המסלול שלך' : 'Welcome — this is your learning path'}
      </h1>
      <p className="beginner-hero__subtitle">
        {rtl
          ? 'בהתאם לתשובותיך הכנו עבורך תוכן נגיש ותומך על טראומה בישראל — בקצב שלך.'
          : 'Based on your answers, we prepared accessible, supportive content about trauma in Israel — at your own pace.'}
      </p>
      <button
        type="button"
        className="beginner-hero__retake"
        onClick={onRetake}
        disabled={retakeBusy}
      >
        {retakeBusy
          ? (rtl ? 'מאפס…' : 'Resetting…')
          : (rtl ? 'עשה את השאלון מחדש' : 'Retake quiz')}
      </button>
    </header>
  )
}
