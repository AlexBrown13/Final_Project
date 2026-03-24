import GraphPlaceholder from '../GraphPlaceholder.jsx'
import YouTubePlaceholder from '../YouTubePlaceholder.jsx'
import styles from './Score1Content.module.css'

export default function Score1Content({ dir }) {
  const rtl = dir === 'rtl'

  return (
    <article className={styles.root}>
      <section className={styles.section}>
        <h2 className={styles.h2}>מה זה טראומה, בקצרה ובלב</h2>
        <p className={styles.h2En} lang="en">
          What trauma is — gently
        </p>
        <p className={rtl ? styles.p : `${styles.p} ${styles.pSecondary}`}>
          לפעמים הגוף והנפש נזכרים באירוע קשה גם הרבה אחרי שהוא נגמר. זה לא אומר
          שאתם חלשים, וזה לא אומר שאתם לבד. טראומה היא תגובה אנושית טבעית
          למצבים שמחמירים את תחושת הסכנה, חוסר האונים או הבדידות. אם קרה לכם
          משהו ששבר את תחושת הבטחון — מותר לכם ללכת לאט, לנשום, ולקרוא רק מה
          שמתאים לכם עכשיו.
        </p>
        <p className={rtl ? `${styles.p} ${styles.pSecondary}` : styles.p} lang="en">
          Sometimes the body and mind keep remembering something difficult long
          after it ends. That does not mean you are weak, and it does not mean
          you are alone. Trauma is a natural human response to situations that
          intensify fear, helplessness, or loneliness. If something shook your
          sense of safety, you are allowed to go slowly, breathe, and read only
          what feels okay today.
        </p>
        <p className={rtl ? styles.p : `${styles.p} ${styles.pSecondary}`}>
          בדף הזה אנחנו מספרים בסיפורים קצרים, בלי לשפוט ובלי למהר. אם משהו מעלה
          לכם תחושות חזקות, אפשר לעצור, לשתות מים, לצאת להליכה קצרה, או לפנות
          למישהו שאתם סומכים עליו.
        </p>
        <p className={rtl ? `${styles.p} ${styles.pSecondary}` : styles.p} lang="en">
          On this page we explain through short stories, without judgment and
          without rushing. If anything brings up strong feelings, you can pause,
          drink water, take a short walk, or reach out to someone you trust.
        </p>
        <aside className={styles.callout}>
          <p className={styles.calloutP}>
            תזכורת עדינה: קריאה לא מחליפה טיפול מקצועי — היא רק מלווה את הדרך
            כשאתם בוחרים בה.
          </p>
          <p className={styles.calloutP} lang="en">
            A gentle reminder: reading is not a substitute for professional
            care — it can accompany your path when you choose that.
          </p>
        </aside>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>איך זה מרגיש בגוף ובלב</h2>
        <p className={styles.h2En} lang="en">
          How it can feel in body and heart
        </p>
        <p className={rtl ? styles.p : `${styles.p} ${styles.pSecondary}`}>
          דנה בת 34 מספרת: &quot;אחרי האירוע הרגשתי שאני תמיד בערנות. כל רעש קטן
          הרים לי את הדופק. הייתי מתביישת להגיד שאני עייפה, כי חשבתי שכולם כבר
          התאוששו. עם הזמן הבנתי שזו לא חולשה — זו תגובה.&quot;
        </p>
        <p className={rtl ? `${styles.p} ${styles.pSecondary}` : styles.p} lang="en">
          Dana, 34, shares: &quot;After the event I felt always on alert. Every
          small sound raised my pulse. I was ashamed to say I was tired because
          I thought everyone had moved on. Over time I understood it was not
          weakness — it was a response.&quot;
        </p>
        <p className={rtl ? styles.p : `${styles.p} ${styles.pSecondary}`}>
          יונתן מוסיף: &quot;היו לילות שבהם חזרתי שוב ושוב לאותו רגע. לא רציתי
          לדבר על זה בבית כי לא רציתי לדאוג. כשהתחלתי לדבר במקום בטוח, הגוף קצת
          הוריד את הנעילה.&quot;
        </p>
        <p className={rtl ? `${styles.p} ${styles.pSecondary}` : styles.p} lang="en">
          Jonathan adds: &quot;There were nights when I returned to the same
          moment again and again. I did not want to talk at home because I did
          not want to worry anyone. When I started speaking in a safer place, my
          body eased a little.&quot;
        </p>
        <p className={rtl ? styles.p : `${styles.p} ${styles.pSecondary}`}>
          אפשר להרגיש גם עייפות, קושי במיקוד, ריחוף, או צורך להתכנס בבית. כל אחת
          ואחד חווים אחרת — ועדיין, יש כאן שפה משותפת של אנושיות.
        </p>
        <p className={rtl ? `${styles.p} ${styles.pSecondary}` : styles.p} lang="en">
          You might also feel fatigue, trouble focusing, numbness, or a need to
          stay home. Everyone experiences this differently — and still, there is
          a shared language of being human.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>טראומה בישראל — בלי מספרים מאיימים</h2>
        <p className={styles.h2En} lang="en">
          Trauma in Israel — without scary numbers
        </p>
        <p className={rtl ? styles.p : `${styles.p} ${styles.pSecondary}`}>
          בחברה שחווה לא פעם אירועים קולקטיביים, רבים מכירים את תחושת
          ה&quot;אני בסדר, אבל לא באמת&quot;. זה נורמלי. חשוב לדעת שיש מענים
          שמכירים את השפה המקומית, את המציאות המשפחתית, ואת המורכבות של חיים בין
          חדשות לשגרה.
        </p>
        <p className={rtl ? `${styles.p} ${styles.pSecondary}` : styles.p} lang="en">
          In a society that often experiences collective events, many know the
          feeling of &quot;I am fine, but not really.&quot; That is normal. It
          helps to know there are supports that understand the local language,
          family realities, and the complexity of living between news and
          routine.
        </p>
        <GraphPlaceholder
          dir={dir}
          heightPx={260}
          titleHe="כאן יופיע גרף — שיעורי PTSD לפי שנה"
          titleEn="Graph: PTSD rates by year — bar chart"
          chartTypeHe="תרשים עמודות"
          chartTypeEn="Bar chart"
          descriptionHe="המיקום שמיועד להצגת מגמות שנתיות בעדינות, עם הסבר ליד הגרף."
          descriptionEn="Planned location for yearly trends, explained gently beside the chart."
        />
        <div className={styles.spacer} />
        <GraphPlaceholder
          dir={dir}
          heightPx={240}
          titleHe="כאן יופיע גרף — פנייה לשירותי תמיכה לפי אזור"
          titleEn="Graph: support service uptake by region — horizontal bars"
          chartTypeHe="תרשים אופקי"
          chartTypeEn="Horizontal bar chart"
          descriptionHe="מראה הבדלים אזוריים בצורה ברורה, בלי לשפוט מי פונה ומי לא."
          descriptionEn="Shows regional differences clearly, without judgment about who seeks help."
        />
      </section>

      <YouTubePlaceholder dir={dir} />

      <section className={styles.section}>
        <h2 className={styles.h2}>סיום חם</h2>
        <p className={styles.h2En} lang="en">
          A warm closing
        </p>
        <p className={rtl ? styles.p : `${styles.p} ${styles.pSecondary}`}>
          אם הגעתם עד לכאן — תודה על הסבלנות. אתם לא צריכים להחזיק הכל לבד. גם
          קריאה קצרה היא הישג, וגם יום שבו בוחרים לנוח הוא הישג.
        </p>
        <p className={rtl ? `${styles.p} ${styles.pSecondary}` : styles.p} lang="en">
          If you made it here — thank you for your patience. You do not have to
          carry everything alone. Even a short read is an achievement, and a day
          you choose to rest is an achievement too.
        </p>
      </section>
    </article>
  )
}
