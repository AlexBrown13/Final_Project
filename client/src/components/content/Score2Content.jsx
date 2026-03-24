import GraphPlaceholder from '../GraphPlaceholder.jsx'
import styles from './Score2Content.module.css'

export default function Score2Content({ dir }) {
  const rtl = dir === 'rtl'

  return (
    <article className={styles.root}>
      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.h2}>מהי טראומה — הסבר מאוזן</h2>
          <p className={styles.sub} lang="en">
            What trauma is — a balanced overview
          </p>
          <p className={rtl ? styles.p : `${styles.p} ${styles.muted}`}>
            טראומה מתייחסת לתגובה פסיכולוגית ופיזיולוגית לאירוע או לסדרת אירועים
            שמערערים את תחושת הבטחון. התגובה משתנה בין אנשים, ואינה נקבעת רק
            לפי חומרת האירוע אלא גם לפי הקשר, משאבים זמינים, ותמיכה חברתית.
          </p>
          <p className={rtl ? `${styles.p} ${styles.muted}` : styles.p} lang="en">
            Trauma refers to psychological and physiological responses to an
            event or series of events that disrupt a sense of safety. Responses
            vary between people and are shaped not only by severity but also by
            context, available resources, and social support.
          </p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.h2}>השפעות נפוצות</h2>
          <p className={styles.sub} lang="en">
            Common effects
          </p>
          <ul className={styles.list}>
            <li>
              <strong>קוגניציה וריכוז:</strong> קושי במיקוד, נדודי שינה, או
              רגישות לרעשים.
              <span className={styles.enHint} lang="en">
                {' '}
                Cognition: focus difficulties, sleep changes, noise
                sensitivity.
              </span>
            </li>
            <li>
              <strong>רגש:</strong> חרדה, עצב, או תחושת ריחוק.
              <span className={styles.enHint} lang="en">
                {' '}
                Emotion: anxiety, sadness, or numbness.
              </span>
            </li>
            <li>
              <strong>חברה ועבודה:</strong> משיכה פנימה או צורך במבנה יומיומי
              יציב.
              <span className={styles.enHint} lang="en">
                {' '}
                Social/work: withdrawal or need for predictable routines.
              </span>
            </li>
          </ul>
        </section>
      </div>

      <section className={styles.wide}>
        <h2 className={styles.h2}>טראומה בישראל — נתונים והקשר</h2>
        <p className={styles.sub} lang="en">
          Trauma in Israel — data and context
        </p>
        <p className={rtl ? styles.p : `${styles.p} ${styles.muted}`}>
          בישראל קיימת שילוב של אירועים קולקטיביים ולחץ מתמשך שמעצב את תפיסת
          הסיכון. לכן חשוב להציג נתונים בצורה ברורה, עם הסברים ולא רק מספרים
          עירומים. להלן מיקומים מתוכננים לגרפים שיסייעו לראות מגמות לאורך זמן.
        </p>
        <p className={rtl ? `${styles.p} ${styles.muted}` : styles.p} lang="en">
          Israel combines collective events and ongoing stress that shape risk
          perception. Data should be presented clearly with explanations, not
          only raw numbers. Below are planned chart locations for trends over
          time.
        </p>

        <div className={styles.graphGrid}>
          <GraphPlaceholder
            dir={dir}
            heightPx={220}
            titleHe="כאן יופיע גרף — שיעורי PTSD לפי שנה"
            titleEn="Graph: PTSD rates by year — grouped bar chart"
            chartTypeHe="תרשים עמודות מקובצות"
            chartTypeEn="Grouped bar chart"
            descriptionHe="השוואה בין קבוצות גיל או מגדר, לפי שנה."
            descriptionEn="Comparison across age or gender groups by year."
          />
          <GraphPlaceholder
            dir={dir}
            heightPx={220}
            titleHe="כאן יופיע גרף — פנייה לשירותי בריאות הנפש"
            titleEn="Graph: mental health service contacts — line chart"
            chartTypeHe="גרף קווים"
            chartTypeEn="Line chart"
            descriptionHe="מגמת פניות לאורך זמן, עם הערות שיטת דגימה."
            descriptionEn="Contact trends over time with sampling notes."
          />
          <GraphPlaceholder
            dir={dir}
            heightPx={200}
            titleHe="כאן יופיע גרף — תחושת בטחון אישית לפי אזור"
            titleEn="Graph: perceived safety by region — choropleth map"
            chartTypeHe="מפת חום (choropleth)"
            chartTypeEn="Choropleth map"
            descriptionHe="מבוסס סקרים ייצוגיים (יוצגו מקורות)."
            descriptionEn="Based on representative surveys (sources will appear)."
          />
          <GraphPlaceholder
            dir={dir}
            heightPx={200}
            titleHe="כאן יופיע גרף — זמן ממוצע מאירוע ועד פנייה לטיפול"
            titleEn="Graph: time from event to care — histogram"
            chartTypeHe="היסטוגרמה"
            chartTypeEn="Histogram"
            descriptionHe="מסביר פיזור — לא מספר ממוצע בלבד."
            descriptionEn="Shows distribution — not only a single average."
          />
        </div>

        <aside className={styles.highlight}>
          <p className={styles.hp}>
            <span className={styles.he}>נקודת מוקד:</span>{' '}
            <span lang="en">Focus point:</span> גרפים ילווו בטקסט שמסביר מה נמדד
            ומה לא, כדי למנוע פרשנות שגויה.
          </p>
        </aside>
      </section>
    </article>
  )
}
