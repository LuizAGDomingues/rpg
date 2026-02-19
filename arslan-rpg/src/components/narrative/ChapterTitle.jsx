import styles from './ChapterTitle.module.css';

export default function ChapterTitle({ title }) {
  if (!title) return null;

  return (
    <div className={styles.container}>
      <div className={styles.line} />
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.line} />
    </div>
  );
}
