import EmbeddedChart from '../EmbeddedChart.jsx'
import styles from './Score2Content.module.css'

export default function Score2Content({ dir }) {
  const rtl = dir === 'rtl'
  const locale = rtl ? 'he' : 'en'

  return (
    <article className={styles.root}>

      {/* ── Top 2-col cards: definition + symptom clusters ── */}
      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.h2}>
            {rtl ? 'מהי טראומה — הגדרה מאוזנת' : 'What trauma is — a balanced overview'}
          </h2>
          {rtl ? (
            <p className={styles.p}>
              טראומה היא תגובה פסיכולוגית ופיזיולוגית לאירוע שמערער תחושת ביטחון.
              לפי ה-DSM-5, אירוע טראומטי כולל חשיפה למוות, איום במוות, פציעה חמורה
              או אלימות מינית — ישירות, כעד, או דרך קרוביו של הפגוע. לא כולם
              שנחשפים לטראומה יפתחו PTSD — התגובה מושפעת מהקשר, זמינות משאבים
              ותמיכה חברתית.
            </p>
          ) : (
            <p className={styles.p}>
              Trauma is a psychological and physiological response to an event that
              disrupts a sense of safety. Per DSM-5, traumatic events include exposure
              to death, threatened death, serious injury, or sexual violence —
              directly, as a witness, or through a close relationship. Not everyone
              exposed develops PTSD; response depends on context, available resources,
              and social support.
            </p>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.h2}>
            {rtl ? 'ארבעת אשכולות התסמינים' : 'The four PTSD symptom clusters'}
          </h2>
          {rtl ? (
            <ul className={styles.list}>
              <li><strong>חודרנות:</strong> פלאשבקים, סיוטים, זיכרונות שחוזרים ללא שליטה.</li>
              <li><strong>הימנעות:</strong> ריחוק ממקומות, אנשים ומחשבות הקשורות לאירוע.</li>
              <li><strong>שינויים שליליים בחשיבה ורגש:</strong> בושה, אשמה, קהות, ריחוק מאחרים.</li>
              <li><strong>עוררות-יתר:</strong> דריכות, עצבנות, הפרעות שינה, תגובת בהלה מוגברת.</li>
            </ul>
          ) : (
            <ul className={styles.list}>
              <li><strong>Intrusion:</strong> flashbacks, nightmares, unwanted memories.</li>
              <li><strong>Avoidance:</strong> steering clear of trauma reminders — places, people, thoughts.</li>
              <li><strong>Negative cognitions &amp; mood:</strong> guilt, shame, emotional numbness, detachment.</li>
              <li><strong>Hyperarousal:</strong> hypervigilance, irritability, sleep disruptions, exaggerated startle.</li>
            </ul>
          )}
        </section>
      </div>

      {/* ── Trauma and work / economic impact ── */}
      <section className={styles.wide}>
        <h2 className={styles.h2}>
          {rtl ? 'טראומה ועבודה — ההשפעה על החיים היומיומיים' : 'Trauma and work — impact on daily life'}
        </h2>
        {rtl ? (
          <>
            <p className={styles.p}>
              טראומה לא נשארת בתוך הראש בלבד — היא חודרת לעבודה, לקשרים ולתפקוד
              היומיומי. אנשים עם תסמינים פוסט-טראומטיים מדווחים לעיתים קרובות על
              קושי להתרכז, ירידה בביצועים, היעדרויות מרובות ולעיתים נשירה מוחלטת
              משוק העבודה. אלה לא &quot;עצלנות&quot; — אלה תולדות פיזיולוגיות של
              מערכת עצבים שנמצאת כל הזמן במצב הגנה.
            </p>
            <p className={styles.p}>
              מחקרים מעריכים שדיכאון וחרדה (שלעיתים קרובות מלווים טראומה) גורמים
              לאובדן של כ-12 מיליארד ימי עבודה בשנה ברחבי העולם — בעלות של כטריליון
              דולר. העלות המצטברת לאדם עם PTSD לאורך 5 שנים מוערכת בכ-43,000 אירו.
            </p>
          </>
        ) : (
          <>
            <p className={styles.p}>
              Trauma does not stay inside the mind — it penetrates work, relationships,
              and daily functioning. People with post-traumatic symptoms frequently
              report difficulty concentrating, reduced performance, increased absences,
              and sometimes complete withdrawal from the labour market. These are not
              laziness — they are physiological consequences of a nervous system locked
              in protection mode.
            </p>
            <p className={styles.p}>
              Studies estimate that depression and anxiety — which often accompany
              trauma — cause approximately 12 billion lost workdays per year globally,
              at a cost of around one trillion US dollars. The cumulative cost per
              person with PTSD over 5 years is estimated at approximately €43,000.
            </p>
          </>
        )}
        <div className={styles.graphGrid}>
          <EmbeddedChart endpoint="israel" chartId="cumulative_cost" locale={locale} height={230} />
          <EmbeddedChart endpoint="addictions" chartId="productivity_waterfall" locale={locale} height={230} />
        </div>
      </section>

      {/* ── Israel context ── */}
      <section className={styles.wide}>
        <h2 className={styles.h2}>
          {rtl ? 'המצב בישראל — נתונים והקשר' : 'Israel — data in context'}
        </h2>
        {rtl ? (
          <>
            <p className={styles.p}>
              ישראל חיה שנים ארוכות תחת לחץ ביטחוני מצטבר. לאחר אירועי ה-7 באוקטובר
              2023, דוח מבקר המדינה (2025) חשף שכ-38% מהאוכלוסייה דיווחו על תסמינים
              בינוניים או חמורים — אך פחות מ-1% קיבלו טיפול בחצי השנה הראשונה. הפער
              הזה מייצג כשל מערכתי, לא רק כשל אישי.
            </p>
            <p className={styles.p}>
              משרד הבריאות מעריך שכ-340 אלף אנשים עשויים לפתח PTSD, וכי הביקוש
              הכולל עלול לגדול עד 680 אלף — כמעט פי שבעה מהקיבולת הקיימת (93 אלף).
            </p>
          </>
        ) : (
          <>
            <p className={styles.p}>
              Israel has lived for years under cumulative security stress. Following
              October 7, 2023, the State Comptroller&apos;s report (2025) found
              approximately 38% of the population reported moderate or severe symptoms
              — yet fewer than 1% received treatment in the first six months. This gap
              represents a systemic failure, not merely a personal one.
            </p>
            <p className={styles.p}>
              The Ministry of Health estimates 340,000 people may develop PTSD, and
              total mental-health demand could reach 680,000 — nearly seven times the
              existing system capacity of 93,000.
            </p>
          </>
        )}
        <div className={styles.graphGrid}>
          <EmbeddedChart endpoint="israel" chartId="treatment_gap" locale={locale} height={230} />
          <EmbeddedChart endpoint="israel" chartId="system_overload" locale={locale} height={230} />
        </div>
        {rtl ? (
          <aside className={styles.highlight}>
            <p className={styles.hp}>
              <span className={styles.he}>נקודה חשובה:</span>{' '}
              טיפול מוקדם מוכח כלכלית: השקעה בבריאות הנפש מחזירה 2–4 שקלים על כל
              שקל מושקע — הן מבחינת עלויות בריאות והן מבחינת פריון.
            </p>
          </aside>
        ) : (
          <aside className={styles.highlight}>
            <p className={styles.hp}>
              <strong>Key point:</strong>{' '}
              Early care pays off economically: mental health investment returns 2–4
              units of value per unit invested — both through reduced health costs and
              improved productivity.
            </p>
          </aside>
        )}
      </section>

      {/* ── What helps ── */}
      <section className={styles.wide}>
        <h2 className={styles.h2}>
          {rtl ? 'מה מוכח כמסייע — ומדוע כדאי לפעול מוקדם' : 'What works — and why early action matters'}
        </h2>
        {rtl ? (
          <>
            <p className={styles.p}>
              מחקרים מראים שהתערבות טיפולית מוקדמת קוצרת משמעותית את משך הסבל,
              מחזירה אנשים לתפקוד ומפחיתה עלויות ארוכות טווח. טיפול CBT ו-EMDR
              נחשבים לאפקטיביים ביותר לטראומה ומוכרים על ידי ה-WHO.
            </p>
            <aside className={styles.highlight}>
              <p className={styles.hp}>
                <span className={styles.he}>מסקנה מרכזית:</span>{' '}
                טראומה שאינה מטופלת יוצרת חוב מצטבר — בבריאות, ביחסים ובכלכלה.
                טיפול מוקדם הוא לא רק חובה מוסרית — הוא גם הגיון כלכלי ברור.
              </p>
            </aside>
          </>
        ) : (
          <>
            <p className={styles.p}>
              Research shows that early therapeutic intervention significantly shortens
              suffering, restores functioning, and reduces long-term costs. CBT and
              EMDR are considered most effective for trauma and are recognised by the
              WHO.
            </p>
            <aside className={styles.highlight}>
              <p className={styles.hp}>
                <strong>Key takeaway:</strong>{' '}
                Untreated trauma creates compounding debt — in health, relationships,
                and economics. Early care is not only a moral obligation — it is clear
                economic logic.
              </p>
            </aside>
          </>
        )}
      </section>

    </article>
  )
}