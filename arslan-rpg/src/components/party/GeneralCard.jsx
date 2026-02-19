import Panel from '../ui/Panel';
import ProgressBar from '../ui/ProgressBar';
import StatRow from '../ui/StatRow';
import styles from './GeneralCard.module.css';

export default function GeneralCard({ general }) {
    if (!general) return null;

    return (
        <Panel title={`${general.name} — ${general.title}`} className={styles.card}>
            <span className={styles.role}>{general.role}</span>
            <ProgressBar current={general.current_hp} max={general.hp_max} color="var(--hp-green)" label="HP" />

            <div className={styles.attrs}>
                {Object.entries(general.attributes || {}).map(([attr, val]) => (
                    <StatRow key={attr} attr={attr} value={val} compact />
                ))}
            </div>

            <div className={styles.details}>
                {general.weapon && (
                    <div className={styles.detailRow}>
                        <span>Arma:</span>
                        <span>{general.weapon.name} ({general.weapon.damage})</span>
                    </div>
                )}
                <div className={styles.detailRow}>
                    <span>CA:</span> <span>{general.ca}</span>
                </div>
            </div>

            {general.skills?.length > 0 && (
                <div className={styles.skills}>
                    {general.skills.map((s, i) => (
                        <span key={i} className={styles.skillTag}>
                            {typeof s === 'string' ? s : s.name}
                        </span>
                    ))}
                </div>
            )}

            {general.passive && (
                <div className={styles.passive}>
                    <span className={styles.passiveLabel}>Passiva:</span> {general.passive.name} — {general.passive.effect}
                </div>
            )}
        </Panel>
    );
}
