import { useState, useEffect } from 'react';
import styles from './NarrativeBox.module.css';

export default function NarrativeBox({ paragraphs, onComplete }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    if (!paragraphs || paragraphs.length === 0) return;
    const timer = setTimeout(() => setVisibleCount(1), 100);
    return () => clearTimeout(timer);
  }, [paragraphs]);

  useEffect(() => {
    if (visibleCount > 0 && visibleCount < paragraphs.length) {
      const timer = setTimeout(() => setVisibleCount((c) => c + 1), 600);
      return () => clearTimeout(timer);
    }
    if (visibleCount === paragraphs.length && onComplete) {
      onComplete();
    }
  }, [visibleCount, paragraphs, onComplete]);

  if (!paragraphs || paragraphs.length === 0) return null;

  return (
    <div className={styles.container}>
      {paragraphs.slice(0, visibleCount).map((p, i) => (
        <p key={i} className={styles.paragraph} style={{ animationDelay: `${i * 0.1}s` }}>
          {p}
        </p>
      ))}
      {visibleCount < paragraphs.length && (
        <button className={styles.skipBtn} onClick={() => setVisibleCount(paragraphs.length)}>
          Pular
        </button>
      )}
    </div>
  );
}
