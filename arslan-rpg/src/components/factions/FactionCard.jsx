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

const THRESHOLDS = [
    { min: -100, max: -50, label: 'Hostil', color: 'var(--hp-red)' },
    { min: -49, max: -20, label: 'Desconfiado', color: '#e67e22' },
    { min: -19, max: 19, label: 'Neutro', color: 'var(--text-muted)' },
    { min: 20, max: 49, label: 'Amigavel', color: 'var(--mp-blue)' },
    { min: 50, max: 100, label: 'Aliado', color: 'var(--hp-green)' },
];

export default function FactionCard({ factionId, reputation }) {
    const name = FACTION_NAMES[factionId] || factionId;
    const threshold = THRESHOLDS.find((t) => reputation >= t.min && reputation <= t.max) || THRESHOLDS[2];

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.name}>{name}</h3>
                <span className={styles.status} style={{ color: threshold.color }}>{threshold.label}</span>
            </div>
            <ProgressBar current={reputation + 100} max={200} color={threshold.color} showValue={false} height={8} />
            <span className={styles.rep} style={{ color: threshold.color }}>
                {reputation > 0 ? '+' : ''}{reputation}
            </span>
        </div>
    );
}
