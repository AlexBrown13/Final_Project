import EmbeddedChart from '../EmbeddedChart.jsx'
import YouTubePlaceholder from '../YouTubePlaceholder.jsx'
import styles from './Score1Content.module.css'

export default function Score1Content({ dir }) {
  const rtl = dir === 'rtl'
  const locale = rtl ? 'he' : 'en'

  return (
    <article className={styles.root}>

      {/* ── Section 1: Opening ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>
          {rtl ? 'קודם כל — אתם לא לבד' : 'First of all — you are not alone'}
        </h2>
        {rtl ? (
          <>
            <p className={styles.p}>
              לפעמים הגוף והנפש נזכרים באירוע קשה גם הרבה אחרי שהוא נגמר. זה לא
              אומר שאתם חלשים. טראומה היא תגובה אנושית טבעית לדברים שמערערים תחושת
              ביטחון ושליטה. אם עברתם משהו קשה — או אם מישהו שאתם אוהבים עבר —
              מותר לכם לקרוא לאט, לעצור בכל שלב, ולשתות מים.
            </p>
            <aside className={styles.callout}>
              <p className={styles.calloutP}>
                תזכורת עדינה: קריאה לא מחליפה טיפול מקצועי. אם תחושות קשות עולות
                בזמן הקריאה — עצרו, ופנו למישהו שסומכים עליו.
              </p>
            </aside>
          </>
        ) : (
          <>
            <p className={styles.p}>
              Sometimes the body and mind keep remembering something difficult long
              after it ends. That does not mean you are weak. Trauma is a natural
              human response to experiences that shatter safety and control. If you
              or someone you love went through something hard — you are allowed to
              read slowly, pause whenever you need, and take care of yourself.
            </p>
            <aside className={styles.callout}>
              <p className={styles.calloutP}>
                A gentle reminder: reading is not a substitute for professional
                care. If difficult feelings arise while reading — pause, and reach
                out to someone you trust.
              </p>
            </aside>
          </>
        )}
      </section>

      {/* ── Video — close to the top ── */}
      <YouTubePlaceholder dir={dir} src="https://www.youtube.com/embed/KptE6doAJrA" />

      {/* ── Section 2: What is trauma ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>
          {rtl ? 'מה זה בכלל טראומה?' : 'What is trauma, really?'}
        </h2>
        {rtl ? (
          <>
            <p className={styles.p}>
              טראומה קורית כשחווים משהו שמרגיש מאיים מדי — כמו סכנה לחיים, אובדן
              פתאומי, או עדות לדבר נורא. הדבר החשוב להבין: לא כל מי שחווה אירוע
              קשה יפתח טראומה. התגובה תלויה בהרבה דברים — כמו מה עבר עליכם בחיים,
              מי עמד לצדכם, ואיך הגוף שלכם ספג את הדבר.
            </p>
            <p className={styles.p}>
              מחקרים מראים שכ-70% מבני האדם יחוו לפחות אירוע טראומטי אחד בחייהם.
              כלומר — הרגשות שאתם מרגישים לא נדירים. הם אנושיים לגמרי.
            </p>
          </>
        ) : (
          <>
            <p className={styles.p}>
              Trauma happens when we experience something that feels overwhelmingly
              threatening — like danger to life, sudden loss, or witnessing something
              terrible. Importantly: not everyone who faces a hard event develops
              trauma. The response depends on many things — your history, who was by
              your side, and how your nervous system processed it.
            </p>
            <p className={styles.p}>
              Research shows that about 70% of people will experience at least one
              traumatic event in their lifetime. The feelings you carry are not rare.
              They are completely human.
            </p>
          </>
        )}
      </section>

      {/* ── Section 3: Personal stories ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>
          {rtl ? 'סיפורים שאולי מדברים אליכם' : 'Stories that might speak to you'}
        </h2>
        {rtl ? (
          <>
            <p className={styles.p}>
              דנה, בת 34: &quot;אחרי האירוע הרגשתי שאני תמיד בערנות — כל רעש קטן
              הרים לי את הדופק. הייתי מתביישת להגיד שאני עייפה, כי חשבתי שכולם כבר
              התאוששו. עם הזמן הבנתי שזו לא חולשה. זו תגובה.&quot;
            </p>
            <p className={styles.p}>
              יונתן, בן 41: &quot;היו לילות שבהם חזרתי שוב ושוב לאותו רגע. לא רציתי
              לדבר על זה בבית כי לא רציתי לדאוג לאנשים שאני אוהב. כשהתחלתי לדבר
              במקום בטוח, הגוף קצת הוריד את הנעילה.&quot;
            </p>
            <p className={styles.p}>
              מיכל, בת 28, על אחיה: &quot;ראיתי שהוא השתנה. הוא לא ישן, התמלא בזעם
              מהר מאוד, ונמנע מכל דיבור. לא ידעתי איך לעזור. כיום אני יודעת —
              הייתי צריכה רק את הכלים הנכונים.&quot;
            </p>
          </>
        ) : (
          <>
            <p className={styles.p}>
              Dana, 34: &quot;After the event I felt constantly on alert — every small
              sound raised my pulse. I was ashamed to say I was tired because I thought
              everyone else had moved on. Over time I understood: it was not weakness.
              It was a response.&quot;
            </p>
            <p className={styles.p}>
              Jonathan, 41: &quot;There were nights when the same moment played over and
              over. I did not want to talk at home because I did not want to worry the
              people I love. When I started talking in a safe place, my body slowly
              eased the lock.&quot;
            </p>
            <p className={styles.p}>
              Michal, 28, about her brother: &quot;I saw him change. He stopped sleeping,
              got angry quickly, and avoided any talk about what happened. I did not know
              how to help. Today I know — I just needed the right tools.&quot;
            </p>
          </>
        )}
      </section>

      {/* ── Section 4: Body + mind + sleep chart ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>
          {rtl ? 'מה קורה בגוף ובנפש' : 'What happens in body and mind'}
        </h2>
        {rtl ? (
          <>
            <p className={styles.p}>
              כשהגוף שלנו חווה משהו מאיים, הוא עובר למצב של הגנה — קצב הלב עולה,
              השרירים מתהדקים, והמוח מתחיל לסרוק כל פינה. זה מנגנון הישרדות נפלא
              כשיש סכנה. הבעיה מתחילה כשהגוף נשאר במצב הזה גם הרבה אחרי שהסכנה עברה.
            </p>
            <p className={styles.p}>
              לכן אחרי טראומה אפשר לחוות: קושי לישון, סיוטים, עצבנות, קושי להתרכז,
              הימנעות ממקומות שמזכירים את מה שקרה, ולעיתים תחושת ריחוף. כל אחד מהדברים
              האלה עלול להרגיש מבלבל — אבל יש להם הגיון.
            </p>
          </>
        ) : (
          <>
            <p className={styles.p}>
              When our body experiences something threatening, it shifts into protection
              mode — heart rate rises, muscles tense, and the brain scans every corner
              for danger. This is a wonderful survival mechanism when danger is real.
              The problem begins when the body stays in that state long after the threat
              has passed.
            </p>
            <p className={styles.p}>
              That is why, after trauma, you might experience trouble sleeping,
              nightmares, irritability, difficulty concentrating, avoiding places that
              remind you of what happened, and sometimes a sense of numbness. Each of
              these can feel confusing — but they all make sense.
            </p>
          </>
        )}
        <EmbeddedChart
          endpoint="sleep"
          chartId="sleep_disorders_prevalence"
          locale={locale}
          height={240}
        />
      </section>

      {/* ── Section 5: Israel context + treatment gap chart ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>
          {rtl ? 'הרבה מאוד אנשים עוברים את זה' : 'A great many people are going through this'}
        </h2>
        {rtl ? (
          <>
            <p className={styles.p}>
              בישראל, מאז אירועי ה-7 באוקטובר 2023, חיים רבים השתנו בן לילה. אנשים
              שעד אז הרגישו יציבים פתאום גילו שקשה להם לישון, להתרכז, או להיות
              נוכחים. זה לא חולשה — זו תגובה אנושית מובנת.
            </p>
            <p className={styles.p}>
              מחקרים מצביעים על כך שכ-38% מהאנשים דיווחו על קשיים נפשיים — אך רובם
              המכריע לא קיבלו כל עזרה. לא כי לא רצו, אלא כי לא תמיד ידעו שמגיע להם
              תמיכה.
            </p>
          </>
        ) : (
          <>
            <p className={styles.p}>
              In Israel, since the events of October 7, 2023, many lives changed
              overnight. People who felt stable suddenly found it hard to sleep,
              concentrate, or be present. That is not weakness — it is a human response
              to what happened.
            </p>
            <p className={styles.p}>
              Research shows that around 38% of people reported emotional difficulties
              after these events — but most received no help at all. Not because they
              did not want it, but because they did not always know they deserved support.
            </p>
          </>
        )}
        <EmbeddedChart
          endpoint="israel"
          chartId="treatment_gap"
          locale={locale}
          height={240}
        />
      </section>

      {/* ── Section 6: Warm close ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>
          {rtl ? 'מה אפשר לעשות? לאן אפשר לפנות?' : 'What can you do? Where can you turn?'}
        </h2>
        {rtl ? (
          <>
            <p className={styles.p}>
              הצעד הראשון הכי קשה הוא לומר &quot;אני צריך עזרה&quot;. זה לא כניעה —
              זה אומץ. מחקרים מראים שטיפול מוקדם משנה הכל: הוא מקצר את הסבל, מחזיר
              אנשים לחיים מלאים, וחוסך שנים של כאב.
            </p>
            <p className={styles.p}>
              אפשר לפנות לנטל&quot;ל, לתחנת הבריאות, לפסיכולוג דרך קופת החולים, או
              אפילו לאדם אחד שסומכים עליו. כל אחד מהצעדים האלה הוא התחלה.
            </p>
            <aside className={styles.callout}>
              <p className={styles.calloutP}>
                אם הגעתם עד לכאן — תודה. אתם לא צריכים להחזיק הכל לבד. גם יום שבו
                בחרתם לנוח הוא הישג.
              </p>
            </aside>
          </>
        ) : (
          <>
            <p className={styles.p}>
              The first and hardest step is saying &quot;I need help.&quot; That is not
              surrender — it is courage. Research shows that early care changes
              everything: it shortens suffering, returns people to full lives, and saves
              years of pain.
            </p>
            <p className={styles.p}>
              You can reach out to NATAL, your local health clinic, a psychologist
              through your health fund, or even one person you trust. Every single one
              of these steps is a beginning.
            </p>
            <aside className={styles.callout}>
              <p className={styles.calloutP}>
                If you made it here — thank you. You do not have to carry everything
                alone. Even a day you choose to rest is an achievement.
              </p>
            </aside>
          </>
        )}
      </section>

    </article>
  )
}
