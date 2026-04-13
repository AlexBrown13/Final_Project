import styles from './YouTubePlaceholder.module.css'

export default function YouTubePlaceholder({ dir, src = '' }) {
  const rtl = dir === 'rtl'
  const hasVideo = Boolean(src)
  return (
    <section
      className={styles.section}
      aria-label={rtl ? 'סרטון YouTube' : 'YouTube video'}
    >
      {!hasVideo && (
        <>
          <h3 className={styles.heading}>
            {rtl ? 'כאן יוטמע סרטון YouTube' : 'YouTube video — will be added here'}
          </h3>
          <p className={styles.note}>
            {rtl
              ? 'מסגרת iframe מוכנה; מקור הסרטון יתווסף בשלב הבא.'
              : 'Iframe shell ready; video src will be wired in later.'}
          </p>
        </>
      )}
      <div className={styles.frameWrap}>
        <iframe
          className={styles.iframe}
          title={rtl ? 'סרטון' : 'Video embed'}
          src={src}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </section>
  )
}
