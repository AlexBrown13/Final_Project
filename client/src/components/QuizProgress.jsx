import styles from './QuizProgress.module.css'

export default function QuizProgress({ step, totalSteps, label }) {
  const total = Math.max(1, Number(totalSteps) || 1)
  const s = Math.min(Math.max(0, Number(step) || 0), total - 1)
  const pct = Math.min(100, Math.round(((s + 1) / total) * 100))

  return (
    <div className={styles.wrap}>
      <div className={styles.labels}>
        <span className={styles.label}>{label}</span>
        <span className={styles.count}>
          {s + 1} / {total}
        </span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={label}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
