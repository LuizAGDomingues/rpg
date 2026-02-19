import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import { OrnamentDivider } from '../components/ui/Ornament';
import CharacterSheet from '../components/party/CharacterSheet';
import GeneralCard from '../components/party/GeneralCard';
import styles from './PartyScreen.module.css';

export default function PartyScreen() {
  const navigate = useNavigate();
  const player = useGameStore((s) => s.player);
  const generals = useGameStore((s) => s.recruited_generals);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Grupo</h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Voltar</Button>
      </div>
      <OrnamentDivider />

      <CharacterSheet player={player} />

      {generals.length === 0 ? (
        <p className={styles.empty}>Nenhum general recrutado ainda.</p>
      ) : (
        generals.map((gen) => (
          <GeneralCard key={gen.id} general={gen} />
        ))
      )}
    </div>
  );
}
