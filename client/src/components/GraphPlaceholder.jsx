import styles from './GraphPlaceholder.module.css'

/**
 * Visible chart placeholder — no chart library, labeled box only.
 */
export default function GraphPlaceholder({
  titleHe,
  titleEn,
  descriptionHe,
  descriptionEn,
  heightPx = 220,
  chartTypeHe,
  chartTypeEn,
  dir,
}) {
  const rtl = dir === 'rtl'
  const title = rtl ? titleHe : titleEn
  const desc = rtl ? descriptionHe : descriptionEn
  const chart = rtl ? chartTypeHe : chartTypeEn

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className={styles.title}>{title}</span>
        {chart ? <span className={styles.chartType}>{chart}</span> : null}
        {desc ? <p className={styles.desc}>{desc}</p> : null}
      </figcaption>
      <div
        className={styles.box}
        style={{ minHeight: heightPx }}
        role="img"
        aria-label={title}
      >
        <span className={styles.boxLabel}>
          {rtl ? 'כאן יוצב הגרף' : 'Chart area — data will be added'}
        </span>
      </div>
    </figure>
  )
}
