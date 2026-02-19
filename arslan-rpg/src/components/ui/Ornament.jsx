import styles from './Ornament.module.css';

export function OrnamentDivider() {
  return (
    <div className={styles.divider}>
      <div className={styles.line} />
      <svg className={styles.diamond} viewBox="0 0 16 16" width="12" height="12">
        <path d="M8 0 L16 8 L8 16 L0 8 Z" fill="currentColor" />
      </svg>
      <div className={styles.line} />
    </div>
  );
}

export function OrnamentCorner({ position = 'top-left' }) {
  return (
    <svg className={`${styles.corner} ${styles[position]}`} viewBox="0 0 40 40" width="40" height="40">
      <path d="M0 0 L40 0 L40 4 L4 4 L4 40 L0 40 Z" fill="currentColor" opacity="0.3" />
      <path d="M0 0 L12 0 L12 2 L2 2 L2 12 L0 12 Z" fill="currentColor" />
    </svg>
  );
}

export function OrnamentBorder({ children }) {
  return (
    <div className={styles.ornamentBorder}>
      <OrnamentCorner position="top-left" />
      <OrnamentCorner position="top-right" />
      <OrnamentCorner position="bottom-left" />
      <OrnamentCorner position="bottom-right" />
      {children}
    </div>
  );
}

export function PersianPattern() {
  return (
    <svg className={styles.pattern} viewBox="0 0 100 20" preserveAspectRatio="none">
      <path d="M0 10 Q12.5 0 25 10 Q37.5 20 50 10 Q62.5 0 75 10 Q87.5 20 100 10"
        stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
      <path d="M0 10 Q12.5 5 25 10 Q37.5 15 50 10 Q62.5 5 75 10 Q87.5 15 100 10"
        stroke="currentColor" strokeWidth="0.3" fill="none" opacity="0.2" />
    </svg>
  );
}
