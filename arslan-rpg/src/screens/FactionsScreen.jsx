import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import { OrnamentDivider } from '../components/ui/Ornament';
import FactionCard from '../components/factions/FactionCard';
import styles from './FactionsScreen.module.css';

export default function FactionsScreen() {
  const navigate = useNavigate();
  const factions = useGameStore((s) => s.factions);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Faccoes</h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Voltar</Button>
      </div>
      <OrnamentDivider />
      <div className={styles.list}>
        {Object.entries(factions).map(([id, rep]) => (
          <FactionCard key={id} factionId={id} reputation={rep} />
        ))}
      </div>
    </div>
  );
}
