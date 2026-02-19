import styles from './Panel.module.css';

export default function Panel({ children, title, className = '' }) {
  return (
    <div className={`${styles.panel} ${className}`}>
      {title && (
        <div className={styles.header}>
          <div className={styles.ornamentLine} />
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.ornamentLine} />
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
