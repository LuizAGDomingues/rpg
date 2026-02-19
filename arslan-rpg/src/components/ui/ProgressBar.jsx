import styles from './ProgressBar.module.css';

export default function ProgressBar({ current, max, color = 'var(--gold)', label, showValue = true, height = 8 }) {
  const percent = max > 0 ? Math.min(100, (current / max) * 100) : 0;

  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.track} style={{ height }}>
        <div
          className={styles.fill}
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
      {showValue && <span className={styles.value}>{current}/{max}</span>}
    </div>
  );
}
