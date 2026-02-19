import Panel from '../ui/Panel';
import styles from './QuestDetail.module.css';

export default function QuestDetail({ quest, onClose }) {
    if (!quest) return null;

    return (
        <Panel title={quest.name} className={styles.panel}>
            {quest.description && <p className={styles.desc}>{quest.description}</p>}

            {quest.objectives?.length > 0 && (
                <div className={styles.section}>
                    <h5 className={styles.sectionTitle}>Objetivos</h5>
                    <ul className={styles.objectives}>
                        {quest.objectives.map((obj, i) => (
                            <li key={i} className={obj.completed ? styles.objDone : styles.objPending}>
                                {obj.completed ? '✅' : '⬜'} {obj.text || obj}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {quest.rewards && (
                <div className={styles.section}>
                    <h5 className={styles.sectionTitle}>Recompensas</h5>
                    <div className={styles.rewards}>
                        {quest.rewards.xp && <span>+{quest.rewards.xp} XP</span>}
                        {quest.rewards.gold && <span>+{quest.rewards.gold} Ouro</span>}
                        {quest.rewards.item && <span>{quest.rewards.item.name}</span>}
                    </div>
                </div>
            )}

            {onClose && (
                <button className={styles.closeBtn} onClick={onClose}>Fechar</button>
            )}
        </Panel>
    );
}
