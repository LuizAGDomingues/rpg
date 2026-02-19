import styles from './QuestEntry.module.css';

export default function QuestEntry({ quest, active, onClick }) {
    return (
        <div className={`${styles.entry} ${active ? '' : styles.completed}`} onClick={onClick}>
            <span className={styles.status}>{active ? '📜' : '✅'}</span>
            <div className={styles.info}>
                <h4 className={styles.name}>{quest.name}</h4>
                {quest.description && <p className={styles.desc}>{quest.description}</p>}
            </div>
        </div>
    );
}
