import styles from './YouTubePlaceholder.module.css'

export default function YouTubePlaceholder({ dir }) {
  const rtl = dir === 'rtl'
  return (
    <section className={styles.section} aria-label="YouTube video placeholder">
      <h3 className={styles.heading}>
        {rtl ? 'כאן יוטמע סרטון YouTube' : 'YouTube video — will be added here'}
      </h3>
      <p className={styles.note}>
        {rtl
          ? 'מסגרת iframe מוכנה; מקור הסרטון יתווסף בשלב הבא.'
          : 'Iframe shell ready; video src will be wired in later.'}
      </p>
      <div className={styles.frameWrap}>
        <iframe
          className={styles.iframe}
          title={rtl ? 'מקום לסרטון' : 'Video embed placeholder'}
          src=""
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </section>
  )
}
