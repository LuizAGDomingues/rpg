import styles from './DialogueBox.module.css';
import GlossaryTooltip from '../ui/GlossaryTooltip';

export default function DialogueBox({ npcName, npcTitle, text, children }) {
  return (
    <div className={styles.box}>
      <div className={styles.nameRow}>
        <h3 className={styles.name}>{npcName}</h3>
        {npcTitle && <span className={styles.title}>{npcTitle}</span>}
      </div>
      <div className={styles.textArea}>
        <p className={styles.text}>&ldquo;<GlossaryTooltip text={text} />&rdquo;</p>
      </div>
      {children}
    </div>
  );
}
