import { getUiStrings } from '../config/uiStrings.js'
import styles from './BackendDown.module.css'

export default function BackendDown({ onRetry, dir = 'ltr' }) {
  const s = getUiStrings(dir)

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>{s.serverDownTitle}</h1>
        <p className={styles.body}>{s.serverDownBody}</p>
        {onRetry ? (
          <button type="button" className={styles.btn} onClick={onRetry}>
            {s.serverDownRetry}
          </button>
        ) : null}
      </div>
    </div>
  )
}
