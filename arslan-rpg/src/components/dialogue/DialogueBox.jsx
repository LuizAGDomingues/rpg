import styles from './DialogueBox.module.css';

export default function DialogueBox({ npcName, npcTitle, text, children }) {
  return (
    <div className={styles.box}>
      <div className={styles.nameRow}>
        <h3 className={styles.name}>{npcName}</h3>
        {npcTitle && <span className={styles.title}>{npcTitle}</span>}
      </div>
      <div className={styles.textArea}>
        <p className={styles.text}>&ldquo;{text}&rdquo;</p>
      </div>
      {children}
    </div>
  );
}
