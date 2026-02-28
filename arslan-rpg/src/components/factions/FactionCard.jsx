import { getFactionStatus } from '../../engine/factionEngine';
import ProgressBar from '../ui/ProgressBar';
import styles from './FactionCard.module.css';

const FACTION_NAMES = {
    nobreza_pars: 'Nobreza de Pars',
    lusitanos_moderados: 'Lusitanos Moderados',
    sindhura: 'Reino de Sindhura',
    turan: 'Cavaleiros de Turan',
    escravos_libertos: 'Escravos Libertos',
    clero_mithra: 'Templo de Mithra',
};

export default function FactionCard({ factionId, reputation }) {
    const name = FACTION_NAMES[factionId] || factionId;
    const { label, color, effect } = getFactionStatus(reputation);

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.name}>{name}</h3>
                <span className={styles.status} style={{ color }}>{label}</span>
            </div>
            <ProgressBar current={reputation + 100} max={200} color={color} showValue={false} height={8} />
            <div className={styles.footer}>
                <span className={styles.rep} style={{ color }}>
                    {reputation > 0 ? '+' : ''}{reputation}
                </span>
                {effect && <span className={styles.effect}>{effect}</span>}
            </div>
        </div>
    );
}
