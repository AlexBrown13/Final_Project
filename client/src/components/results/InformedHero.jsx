export default function InformedHero({ onRetake, retakeBusy, rtl }) {
  return (
    <header className="informed-hero">
      <div className="informed-hero__row">
        <h1 className="informed-hero__title">
          {rtl ? 'טראומה בישראל — מסלול למידה' : 'Trauma in Israel — your learning path'}
        </h1>
        <button
          type="button"
          className="informed-hero__retake"
          onClick={onRetake}
          disabled={retakeBusy}
        >
          {retakeBusy
            ? (rtl ? 'מאפס…' : 'Resetting…')
            : (rtl ? 'עשה שאלון מחדש' : 'Retake quiz')}
        </button>
      </div>
      <p className="informed-hero__subtitle">
        {rtl
          ? 'תוכן מותאם ללומד מודע — שילוב של סיפורים אישיים, נתונים ומחקר.'
          : 'Content tailored for an informed learner — personal stories, data, and research context.'}
      </p>
    </header>
  )
}
