import GraphPlaceholder from '../GraphPlaceholder.jsx'
import styles from './Score3Content.module.css'

export default function Score3Content({ dir }) {
  return (
    <article className={styles.root}>
      <section className={styles.compact}>
        <div className={styles.row}>
          <div className={styles.col}>
            <h2 className={styles.h2}>הגדרה קלינית תמציתית</h2>
            <p className={styles.sub} lang="en">
              Concise clinical definition
            </p>
            <p className={styles.p}>
              טראומה (בהקשר פסיכיאטרי) מתייחסת לחשיפה לאירועי קיצון המערערים
              התמודדות; תסמינים עשויים לעמוד בקריטריונים של PTSD, הפרעות חרדה,
              או תסמינים דומים לפי DSM/ICD — הערכה דורשת קלינאי מוסמך.
            </p>
            <p className={styles.p} lang="en">
              In psychiatric usage, trauma refers to extreme stressor exposure;
              symptom patterns may meet PTSD, anxiety disorder, or related
              criteria per DSM/ICD — assessment requires licensed clinicians.
            </p>
          </div>
          <div className={styles.col}>
            <h2 className={styles.h2}>מנגנונים ותוצאות</h2>
            <p className={styles.sub} lang="en">
              Mechanisms and outcomes
            </p>
            <ul className={styles.bullets}>
              <li>היפר־ערנות, חידוד זיכרון, עיבוד רגשי לקוי (מודלים תיאורטיים).</li>
              <li>שינויים בציר HPA, וריאביליות בין־אישית גבוהה.</li>
              <li>השפעות תפקודיות: עבודה, קשרים בין־אישיים, שינה.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.compact}>
        <h2 className={styles.h2}>ישראל — שכבת נתונים מחקרית</h2>
        <p className={styles.sub} lang="en">
          Israel — research-oriented data layer
        </p>
        <p className={styles.p}>
          להלן אזורי ויזואליזציה מתוכננים. כל רכיב יכלול מקורות, הגדרות מדידה,
          ומגבלות שיטתיות. הטקסט כאן הוא placeholder לפריסה בלבד.
        </p>
        <p className={styles.p} lang="en">
          Below are planned visualization slots. Each will include sources,
          measurement definitions, and methodological limits. Text is layout
          placeholder only.
        </p>

        <div className={styles.graphDense}>
          <GraphPlaceholder
            dir={dir}
            heightPx={180}
            titleHe="כאן יופיע גרף — שיעורי PTSD לפי שנה ועומס אירועים"
            titleEn="Graph: PTSD rates by year vs event load — dual-axis line"
            chartTypeHe="קו כפול צירים"
            chartTypeEn="Dual-axis line chart"
            descriptionHe="ציר 1: שיעור; ציר 2: מדד עומס (מוגדר בשלב הבא)."
            descriptionEn="Axis 1: prevalence; Axis 2: load index (TBD)."
          />
          <GraphPlaceholder
            dir={dir}
            heightPx={180}
            titleHe="כאן יופיע גרף — השוואה בין־מחקרית (forest plot)"
            titleEn="Graph: cross-study comparison — forest plot"
            chartTypeHe="Forest plot"
            chartTypeEn="Forest plot"
            descriptionHe="אינטרוולי סמך ומשקלים לפי גודל מדגם."
            descriptionEn="Confidence intervals and weights by sample size."
          />
          <GraphPlaceholder
            dir={dir}
            heightPx={170}
            titleHe="כאן יופיע גרף — זמן עד טיפול ראשון (Kaplan–Meier)"
            titleEn="Graph: time-to-first treatment — Kaplan–Meier"
            chartTypeHe="עקומת הישרדות"
            chartTypeEn="Survival curve"
            descriptionHe="צנזור ומדדי סיכון (COX) יוצגו בכיתוב."
            descriptionEn="Censoring and hazard notes in caption."
          />
          <GraphPlaceholder
            dir={dir}
            heightPx={170}
            titleHe="כאן יופיע גרף — קורלציה סימפטומים–תפקוד"
            titleEn="Graph: symptom–function correlation — scatter + trend"
            chartTypeHe="פיזור + קו מגמה"
            chartTypeEn="Scatter with trend line"
            descriptionHe="מבוקר למגזר גיל (שכבות)."
            descriptionEn="Age strata controls (planned)."
          />
          <GraphPlaceholder
            dir={dir}
            heightPx={160}
            titleHe="כאן יופיע גרף — שימוש בתרופות/טיפול לפי קופה"
            titleEn="Graph: medication/psychotherapy uptake by HMO — stacked bars"
            chartTypeHe="עמודות מוערמות"
            chartTypeEn="Stacked bar chart"
            descriptionHe="נתונים אגרגטיביים בלבד; אנונימיזציה."
            descriptionEn="Aggregate only; anonymized reporting."
          />
          <GraphPlaceholder
            dir={dir}
            heightPx={160}
            titleHe="כאן יופיע גרף — עומס מקצועות הבריאות (FTE)"
            titleEn="Graph: workforce capacity (FTE) vs referrals — combo"
            chartTypeHe="קומבו עמודות+קו"
            chartTypeEn="Combo column + line"
            descriptionHe="יחס המרות לכל שעת־עבודה קלינית."
            descriptionEn="Referrals per clinical FTE hour."
          />
        </div>

        <aside className={styles.sparseHighlight}>
          <p className={styles.hp}>
            הערה שיטתית / <span lang="en">Methodological note:</span> יוצגו
            הטיות דגימה ופרשנות זהירה של קורלציה מול סיבתיות.
          </p>
        </aside>
      </section>

      <section className={styles.compact}>
        <h2 className={styles.h2}>טבלת נתונים — טיוטה</h2>
        <p className={styles.sub} lang="en">
          Data table — draft scaffold
        </p>
        <div className={styles.tableWrap} role="region" aria-label="Data table placeholder">
          <table className={styles.table}>
            <caption className={styles.caption}>
              טבלה לדוגמה — שורות ימולאו ממקורות מאומתים /{' '}
              <span lang="en">Sample table — rows from verified sources</span>
            </caption>
            <thead>
              <tr>
                <th scope="col">מחקר / Study</th>
                <th scope="col">אוכלוסייה / Population</th>
                <th scope="col">n</th>
                <th scope="col">מדד / Outcome</th>
                <th scope="col">הערות / Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>[Placeholder A]</td>
                <td>מבוגרים עירוניים / Urban adults</td>
                <td>—</td>
                <td>PTSD screen+</td>
                <td>מקור יתווסף / Source TBD</td>
              </tr>
              <tr>
                <td>[Placeholder B]</td>
                <td>הורים לילדים 6–12 / Parents</td>
                <td>—</td>
                <td>חרדה כללית / GAD symptoms</td>
                <td>שאלון מתוקן / Adjusted instrument</td>
              </tr>
              <tr>
                <td>[Placeholder C]</td>
                <td>משרתי מילואים / Reservists</td>
                <td>—</td>
                <td>פנייה לטיפול / Care-seeking</td>
                <td>חלון זמן 12 חודשים / 12-mo window</td>
              </tr>
              <tr>
                <td>[Placeholder D]</td>
                <td>מתבגרים / Adolescents</td>
                <td>—</td>
                <td>דיכאון קליני / Depression</td>
                <td>השוואה לאומית / National benchmark</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.compact}>
        <h2 className={styles.h2}>הפניות ביבליוגרפיות (פורמט)</h2>
        <p className={styles.sub} lang="en">
          Bibliographic placeholders (format)
        </p>
        <ul className={styles.cite}>
          <li>
            [Author et al., YEAR]. <em>Title placeholder.</em> Journal —
            volume(issue), pages. DOI: TBD.
          </li>
          <li>
            [Israeli Ministry of Health, YEAR]. <em>Report placeholder.</em>{' '}
            Retrieved: TBD.
          </li>
        </ul>
      </section>
    </article>
  )
}
