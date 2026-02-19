import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import ProgressBar from '../components/ui/ProgressBar';
import { OrnamentDivider } from '../components/ui/Ornament';
import { FACTION_THRESHOLDS } from '../utils/constants';
import styles from './FactionsScreen.module.css';

const FACTION_NAMES = {
  nobreza_pars: 'Nobreza de Pars',
  lusitanos_moderados: 'Lusitanos Moderados',
  sindhura: 'Reino de Sindhura',
  turan: 'Cavaleiros de Turan',
  escravos_libertos: 'Escravos Libertos',
  clero_mithra: 'Templo de Mithra',
};

export default function FactionsScreen() {
  const navigate = useNavigate();
  const factions = useGameStore((s) => s.factions);

  const getThreshold = (value) => {
    return FACTION_THRESHOLDS.find((t) => value >= t.min && value <= t.max) || FACTION_THRESHOLDS[2];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Faccoes</h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Voltar</Button>
      </div>
      <OrnamentDivider />
      <div className={styles.list}>
        {Object.entries(factions).map(([id, rep]) => {
          const threshold = getThreshold(rep);
          return (
            <Panel key={id}>
              <div className={styles.factionRow}>
                <div className={styles.factionInfo}>
                  <h3 className={styles.factionName}>{FACTION_NAMES[id] || id}</h3>
                  <span className={styles.factionStatus} style={{ color: threshold.color }}>{threshold.label}</span>
                </div>
                <ProgressBar current={rep + 100} max={200} color={threshold.color} showValue={false} height={8} />
                <span className={styles.repValue} style={{ color: threshold.color }}>{rep > 0 ? '+' : ''}{rep}</span>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
