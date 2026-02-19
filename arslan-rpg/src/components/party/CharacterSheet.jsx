import Panel from '../ui/Panel';
import ProgressBar from '../ui/ProgressBar';
import StatRow from '../ui/StatRow';
import styles from './CharacterSheet.module.css';

const CLASS_LABELS = { warrior: 'Guerreiro', diplomat: 'Diplomata', strategist: 'Estrategista' };

export default function CharacterSheet({ player }) {
    if (!player) return null;

    return (
        <Panel title="Arslan" className={styles.sheet}>
            <div className={styles.meta}>
                <span className={styles.classLabel}>{CLASS_LABELS[player.class] || '-'}</span>
                <span className={styles.level}>Nível {player.level}</span>
            </div>

            <ProgressBar current={player.hp} max={player.hp_max} color="var(--hp-green)" label="HP" />
            <ProgressBar current={player.xp} max={player.xp_next} color="var(--gold)" label="XP" height={4} />

            <div className={styles.attrs}>
                {Object.entries(player.attributes || {}).map(([attr, val]) => (
                    <StatRow key={attr} attr={attr} value={val} compact />
                ))}
            </div>

            <div className={styles.equipment}>
                <h5 className={styles.sectionTitle}>Equipamento</h5>
                <div className={styles.equipRow}>
                    <span>Arma:</span> <span>{player.equipment?.weapon?.name || 'Nenhuma'}</span>
                </div>
                <div className={styles.equipRow}>
                    <span>Armadura:</span> <span>{player.equipment?.armor?.name || 'Nenhuma'}</span>
                </div>
                <div className={styles.equipRow}>
                    <span>Escudo:</span> <span>{player.equipment?.shield?.name || 'Nenhum'}</span>
                </div>
            </div>

            {player.skills?.length > 0 && (
                <div className={styles.skills}>
                    <h5 className={styles.sectionTitle}>Habilidades</h5>
                    <div className={styles.skillList}>
                        {player.skills.map((s, i) => (
                            <span key={i} className={styles.skillTag}>{s}</span>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.combatStats}>
                <span className={styles.combatStat}>CA: {player.ca + (player.equipment?.armor?.ca_bonus || 0) + (player.equipment?.shield?.ca_bonus || 0)}</span>
                <span className={styles.combatStat}>PA: {player.pa}</span>
            </div>
        </Panel>
    );
}
