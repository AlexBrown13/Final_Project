import EmbeddedChart from '../EmbeddedChart.jsx'
import styles from './Score3Content.module.css'

export default function Score3Content({ dir }) {
  const rtl = dir === 'rtl'
  const locale = rtl ? 'he' : 'en'

  return (
    <article className={styles.root}>

      {/* ── Row 1: DSM-5 definition + Neurobiological mechanisms ── */}
      <section className={styles.compact}>
        <div className={styles.row}>
          <div className={styles.col}>
            <h2 className={styles.h2}>
              {rtl ? 'הגדרה קלינית — DSM-5-TR' : 'Clinical definition — DSM-5-TR'}
            </h2>
            {rtl ? (
              <>
                <p className={styles.p}>
                  PTSD מוגדרת כחשיפה לאירוע המאיים על חיים, שלמות גופנית או כולל
                  אלימות מינית, דרך ארבעה נתיבים אפשריים: חווייה ישירה, עדות,
                  ידיעה על פגיעה בקרוב משפחה, או חשיפה חוזרת לפרטים מזעזעים
                  במסגרת מקצועית. נדרשים תסמינים מארבעה אשכולות (B–E) למשך מעל
                  חודש עם פגיעה תפקודית מובהקת, ושלילת גורם אורגני/פסיכואקטיבי.
                </p>
                <ul className={styles.bullets}>
                  <li><strong>B — חודרנות:</strong> flashbacks, סיוטים, מצוקה עם חשיפה לרמזים.</li>
                  <li><strong>C — הימנעות:</strong> מחשבות, רגשות, גירויים חיצוניים.</li>
                  <li><strong>D — קוגניציה/רגש שלילי:</strong> אמונות מוכללות, אשמה, קהות.</li>
                  <li><strong>E — עוררות/תגובתיות:</strong> hypervigilance, outbursts, הפרעות שינה.</li>
                </ul>
              </>
            ) : (
              <>
                <p className={styles.p}>
                  PTSD requires exposure to actual/threatened death, serious injury,
                  or sexual violence via four pathways: direct experience, witnessing,
                  learning of trauma to a close other, or repeated exposure to aversive
                  details (professional context). Criterion B–E symptoms must persist
                  &gt;1 month with significant functional impairment, excluding
                  organic/substance aetiology.
                </p>
                <ul className={styles.bullets}>
                  <li><strong>B — Intrusion:</strong> flashbacks, nightmares, distress on exposure to cues.</li>
                  <li><strong>C — Avoidance:</strong> thoughts, feelings, external reminders.</li>
                  <li><strong>D — Negative cognition/affect:</strong> generalised beliefs, guilt, numbing.</li>
                  <li><strong>E — Arousal/reactivity:</strong> hypervigilance, outbursts, sleep disruption.</li>
                </ul>
              </>
            )}
          </div>
          <div className={styles.col}>
            <h2 className={styles.h2}>
              {rtl ? 'מנגנונים נוירו-ביולוגיים' : 'Neurobiological mechanisms'}
            </h2>
            {rtl ? (
              <>
                <ul className={styles.bullets}>
                  <li>הפעלה כרונית של ציר HPA → רמות קורטיזול גבוהות ובלתי מאוזנות.</li>
                  <li>עלייה בציטוקינים דלקתיים (IL-6, TNF-α) → דלקת מערכתית כרונית.</li>
                  <li>היפראקטיביות אמיגדלה + היפואקטיביות קורטקס פרה-פרונטלי → ויסות רגשי לקוי.</li>
                  <li>שינויים בריאקטיביות SNS → hyperarousal, בעיות שינה, השפעות קרדיווסקולריות.</li>
                </ul>
                <p className={styles.p}>
                  ועדת מומחים (הלר, 2023) קבעה קשר רפואי ישיר בין PTSD לבין שבע מחלות
                  כרוניות: סוכרת סוג 2, יתר לחץ דם, מחלת לב איסכמית, שבץ מוחי,
                  פיברומיאלגיה, פסוריאזיס ו-COPD.
                </p>
              </>
            ) : (
              <>
                <ul className={styles.bullets}>
                  <li>Chronic HPA axis activation → dysregulated cortisol.</li>
                  <li>Elevated IL-6/TNF-α → systemic low-grade inflammation.</li>
                  <li>Amygdala hyperreactivity + PFC hypoactivation → impaired emotion regulation.</li>
                  <li>SNS sensitisation → hyperarousal, sleep disruption, cardiovascular effects.</li>
                </ul>
                <p className={styles.p}>
                  An expert committee (Heller, 2023) established direct medical links
                  between PTSD and seven chronic conditions: type 2 diabetes,
                  hypertension, ischaemic heart disease, stroke, fibromyalgia,
                  psoriasis, and COPD.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Epidemiology: Israel vs. global ── */}
      <section className={styles.compact}>
        <h2 className={styles.h2}>
          {rtl ? 'אפידמיולוגיה — ישראל מול עולם' : 'Epidemiology — Israel vs. global baseline'}
        </h2>
        <div className={styles.row}>
          <div className={styles.col}>
            {rtl ? (
              <p className={styles.p}>
                שכיחות עולמית של PTSD לאורך חיים: כ-3.9% (WHO, 2024). בישראל,
                ניתוח אפידמיולוגי (Katsoty et al., 2024) מצא שיעור של כ-5.3%
                — גבוה מהממוצע, המשקף חשיפה מצטברת לאירועי אלימות פוליטית.
                כ-70% מהאוכלוסייה הכללית ייחשפו לאירוע טראומטי אחד לפחות;
                כ-30% לארבעה אירועים ומעלה (Benjet et al., 2016).
              </p>
            ) : (
              <p className={styles.p}>
                Global lifetime PTSD prevalence: ~3.9% (WHO, 2024). Israeli
                analysis (Katsoty et al., 2024) reports ~5.3% — above average,
                reflecting iterative exposure to political violence. ~70% of the
                general population experience ≥1 traumatic event; ~30% experience
                ≥4 (Benjet et al., 2016).
              </p>
            )}
          </div>
          <div className={styles.col}>
            {rtl ? (
              <p className={styles.p}>
                אחרי ה-7 באוקטובר 2023: דוח מבקר המדינה (2025) — כ-38% דיווחו על
                תסמינים קליניים מובהקים; פחות מ-1% קיבלו טיפול בחצי השנה הראשונה.
                7,698 פניות חדשות להכרה בנכות נפשית (משרד הביטחון). משרד הבריאות
                מעריך 340K מקרי PTSD; ביקוש כולל עד 680K — לעומת קיבולת מערכת של
                כ~93K.
              </p>
            ) : (
              <p className={styles.p}>
                Post–October 7: State Comptroller (2025) — ~38% reported clinically
                significant symptoms; under 1% received care in 6 months. 7,698 new
                disability applications (MoD). MoH projects 340K PTSD cases; total
                demand up to 680K — against system capacity of ~93K.
              </p>
            )}
          </div>
        </div>

        <div className={styles.graphDense}>
          <EmbeddedChart endpoint="israel" chartId="treatment_gap" locale={locale} height={200} />
          <EmbeddedChart endpoint="israel" chartId="system_overload" locale={locale} height={200} />
        </div>
      </section>

      {/* ── Economic burden ── */}
      <section className={styles.compact}>
        <h2 className={styles.h2}>
          {rtl ? 'נטל כלכלי — ניתוח רב-רובדי' : 'Economic burden — multi-layer analysis'}
        </h2>
        {rtl ? (
          <p className={styles.p}>
            העלות השנתית הכוללת של PTSD מוערכת בכ-232.2 מיליארד דולר (Davis et al.,
            2022): 62.5B עלויות ישירות, 42.7B אובדן תעסוקה, 127.0B עלויות עקיפות.
            59% מהנטל מיוחס להפרעות קומורבידיות (Bothe et al., 2020). עלות מצטברת
            לאדם ל-5 שנים: ~€43,000. ROI על התערבות נפשית: 2–4:1 (Le et al., 2021).
          </p>
        ) : (
          <p className={styles.p}>
            Annual total PTSD cost: ~$232.2B (Davis et al., 2022): $62.5B direct,
            $42.7B unemployment, $127.0B other indirect. 59% of burden attributed to
            comorbidities, not isolated PTSD (Bothe et al., 2020). 5-year cumulative
            per-person cost: ~€43,000. Mental health intervention ROI: 2–4:1
            (Le et al., 2021; Hawrilenko et al., 2025).
          </p>
        )}

        <div className={styles.graphDense}>
          <EmbeddedChart endpoint="israel" chartId="economic_breakdown" locale={locale} height={200} />
          <EmbeddedChart endpoint="israel" chartId="ptsd_cost_distribution" locale={locale} height={200} />
        </div>
      </section>

      {/* ── Addictions: clinical analysis ── */}
      <section className={styles.compact}>
        <h2 className={styles.h2}>
          {rtl ? 'PTSD והתמכרויות — מנגנון ונתונים' : 'PTSD and addiction — mechanism and data'}
        </h2>
        <div className={styles.row}>
          <div className={styles.col}>
            {rtl ? (
              <p className={styles.p}>
                Self-Medication Hypothesis: טראומה → מצוקה רגשית → שימוש בחומרים
                כהקלה. גורמי סיכון מרכזיים: הימנעות, עוררות יתר, דיסוציאציה,
                הפרעות שינה, כעס ורגזנות, קשיי ויסות רגשי.
              </p>
            ) : (
              <p className={styles.p}>
                Self-Medication Hypothesis: Trauma → Emotional Distress →
                Substance Use for relief. Key mediators: avoidance, hyperarousal,
                dissociation, sleep disturbance, anger/irritability, emotion
                dysregulation.
              </p>
            )}
          </div>
          <div className={styles.col}>
            {rtl ? (
              <p className={styles.p}>
                ישראל, פוסט אוקטובר 2023: שימוש מסוכן עלה מ-22.7% (2022) ל-26.6%
                (מרץ 2024). שימוש בתרופות הרגעה/שינה: +150% (3.8% → 9.5%).
                קנאביס רפואי: 3,000+ רישיונות חדשים בנובמבר 2023 בלבד.
                נהיגה תחת השפעה: 28% עם PTSD מול 8% ללא (Van Voorhees et al., 2018).
              </p>
            ) : (
              <p className={styles.p}>
                Israel, post-October 2023: hazardous use rose from 22.7% (2022)
                to 26.6% (March 2024). Sedative/sleep medication use: +150%
                (3.8% → 9.5%). Medical cannabis: 3,000+ new licences in November
                2023 alone. Impaired driving: 28% with PTSD vs. 8% without
                (Van Voorhees et al., 2018).
              </p>
            )}
          </div>
        </div>

        <div className={styles.graphDense}>
          <EmbeddedChart endpoint="addictions" chartId="diverging_substance" locale={locale} height={200} />
          <EmbeddedChart endpoint="addictions" chartId="risk_heatmap" locale={locale} height={220} />
        </div>
      </section>

      {/* ── Data table — kept bilingual (academic format) ── */}
      <section className={styles.compact}>
        <h2 className={styles.h2}>טבלת נתונים — מחקרים מרכזיים</h2>
        <p className={styles.sub} lang="en">Data table — key studies</p>
        <div className={styles.tableWrap} role="region" aria-label="Key studies table">
          <table className={styles.table}>
            <caption className={styles.caption}>
              מחקרים מרכזיים על PTSD, עלויות והשלכות קליניות /{' '}
              <span lang="en">Key studies on PTSD, costs and clinical outcomes</span>
            </caption>
            <thead>
              <tr>
                <th scope="col">מחקר / Study</th>
                <th scope="col">אוכלוסייה / Population</th>
                <th scope="col">מדד / Outcome</th>
                <th scope="col">ממצא מרכזי / Key finding</th>
                <th scope="col">מקור / Source</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Davis et al.</td>
                <td>ארה&quot;ב / USA — national</td>
                <td>עלות שנתית PTSD / Annual PTSD cost</td>
                <td>$232.2 מיליארד / $232.2B annually</td>
                <td>2022</td>
              </tr>
              <tr>
                <td>Bothe et al.</td>
                <td>מבוגרים עם PTSD / Adults with PTSD</td>
                <td>עלות 5-שנים / 5-year cost</td>
                <td>~€43,000; 59% ממקומורבידיות</td>
                <td>2020</td>
              </tr>
              <tr>
                <td>WHO</td>
                <td>גלובלי / Global</td>
                <td>אובדן ימי עבודה / Workday loss</td>
                <td>12 מיליארד ימים/שנה; ~$1T / 12B days/yr; ~$1T</td>
                <td>2019</td>
              </tr>
              <tr>
                <td>מבקר המדינה / State Comptroller</td>
                <td>ישראל פוסט 7.10 / Israel post-Oct 7</td>
                <td>פער טיפול / Treatment gap</td>
                <td>38% תסמינים; &lt;1% טיפול / 38% symptoms; &lt;1% treated</td>
                <td>2025</td>
              </tr>
              <tr>
                <td>Katsoty et al.</td>
                <td>ישראל / Israel</td>
                <td>שכיחות PTSD / PTSD prevalence</td>
                <td>~5.3% לאורך חיים / ~5.3% lifetime</td>
                <td>2024</td>
              </tr>
              <tr>
                <td>Shmulewitz et al.</td>
                <td>ישראל 2022–2025</td>
                <td>שימוש בחומרים / Substance use</td>
                <td>עלייה מובהקת בתרופות מרשם ואופיאטים</td>
                <td>2025</td>
              </tr>
              <tr>
                <td>Le et al. / Hawrilenko et al.</td>
                <td>מטה-אנליזה / Meta-analysis</td>
                <td>ROI התערבות / Intervention ROI</td>
                <td>2–4 ש&quot;ח על כל ש&quot;ח / 2–4:1 return on investment</td>
                <td>2021 / 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Policy & clinical recommendations ── */}
      <section className={styles.compact}>
        <h2 className={styles.h2}>
          {rtl ? 'המלצות מדיניות וקליניות — מסקנות הדוח' : 'Policy and clinical recommendations — report conclusions'}
        </h2>
        <div className={styles.row}>
          <div className={styles.col}>
            {rtl ? (
              <ul className={styles.bullets}>
                <li>הקמת גוף מתכלל לאומי לניהול נתוני PTSD ותיאום בין-משרדי.</li>
                <li>מסלול ירוק לנכי צה&quot;ל: הכרה אוטומטית ב-33.3% נכות עבור 7 מחלות כרוניות.</li>
                <li>בדיקות סקר תקופתיות ל-PTSD ברפואה ראשונית — כגורם סיכון למחלות כרוניות.</li>
                <li>השקעה בטיפול אינטגרטיבי: PTSD + התמכרויות + שיקום תעסוקתי.</li>
                <li>הרחבת כוח אדם קליני — כ-786 תקנים חסרים (מרכז טאוב, 2022).</li>
              </ul>
            ) : (
              <ul className={styles.bullets}>
                <li>Establish a national coordinating body for PTSD data and inter-ministerial coordination.</li>
                <li>Fast-track IDF disability recognition: automatic 33.3% for 7 chronic conditions.</li>
                <li>Periodic PTSD screening in primary care — as a chronic disease risk factor.</li>
                <li>Investment in integrated care: PTSD + addictions + occupational rehabilitation.</li>
                <li>Expand clinical workforce — ~786 missing positions (Taub Center, 2022).</li>
              </ul>
            )}
          </div>
          <div className={styles.col}>
            {rtl ? (
              <ul className={styles.bullets}>
                <li>CBT ו-EMDR — טיפולים מבוססי ראיות למניעת כרוניות; מינוי מפקח לאומי.</li>
                <li>רגולציה מחמירה על אופיאטים ומרשמי תרופות הרגעה לצד הסברה מקצועית.</li>
                <li>תוכניות מניעה בבתי ספר ובקהילה — זיהוי מוקדם של בני נוער בסיכון.</li>
                <li>מיסוד מדידה עקבית: טראומה כסיכון כלכלי-ביטחוני לאומי ארוך-טווח.</li>
              </ul>
            ) : (
              <ul className={styles.bullets}>
                <li>CBT and EMDR as evidence-based standards of care; national oversight.</li>
                <li>Strict opioid/sedative prescription regulation alongside professional education.</li>
                <li>School and community prevention programmes — early identification of at-risk youth.</li>
                <li>Institutionalise consistent measurement: trauma as a long-term national security-economic risk.</li>
              </ul>
            )}
          </div>
        </div>

        <aside className={styles.sparseHighlight}>
          <p className={styles.hp}>
            {rtl
              ? 'הערה מתודולוגית: הנתונים מבוססים על שילוב survey review בינלאומי, ניתוח דוחות ממשלתיים ישראליים, ומודל חישובי המותאם ממתודולוגיה אמריקאית/בריטית לנתונים ישראליים. יש להתייחס לאומדנים בזהירות.'
              : 'Methodological note: Data combines international survey review, Israeli government reports, and a computational model adapted from US/UK methodology (Dawson et al., 2024 BMJ Open) to Israeli data. Estimates should be treated with appropriate caution.'}
          </p>
        </aside>
      </section>

      {/* ── Bibliography ── */}
      <section className={styles.compact}>
        <h2 className={styles.h2}>
          {rtl ? 'הפניות ביבליוגרפיות נבחרות' : 'Selected bibliographic references'}
        </h2>
        <ul className={styles.cite}>
          <li>Davis, L.L. et al. (2022). Economic burden of PTSD. <em>J Affect Disord.</em></li>
          <li>Bothe, T. et al. (2020). Costs of PTSD in Germany. <em>Eur J Health Econ.</em></li>
          <li>WHO (2019). Depression and other common mental disorders. Geneva.</li>
          <li>WHO (2024). Mental health: Strengthening our response.</li>
          <li>State Comptroller of Israel (2025). Mental health response post–Oct 7.</li>
          <li>Katsoty, Y. et al. (2024). PTSD prevalence, Israel. <em>Isr J Psychiatry.</em></li>
          <li>Benjet, C. et al. (2016). Epidemiology of traumatic events worldwide. <em>Psychol Med.</em></li>
          <li>Shmulewitz, D. et al. (2025). Substance use trends, Israel 2022–2025.</li>
          <li>Dworkin, E.R. et al. (2018). PTSD and substance use. <em>Trauma Violence Abuse.</em></li>
          <li>Le, L.K. et al. (2021). ROI of mental health interventions. <em>Cost Eff Resour Alloc.</em></li>
          <li>Hawrilenko, M. et al. (2025). Economic returns to trauma-focused therapy.</li>
          <li>Dawson, A. et al. (2024). Economic cost methodology for trauma victims. <em>BMJ Open.</em></li>
        </ul>
      </section>

    </article>
  )
}
