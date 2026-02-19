import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import { OrnamentDivider } from '../components/ui/Ornament';
import styles from './JournalScreen.module.css';

export default function JournalScreen() {
  const navigate = useNavigate();
  const quests = useGameStore((s) => s.quests);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Diario de Quests</h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Voltar</Button>
      </div>
      <OrnamentDivider />

      <Panel title="Quests Ativas">
        {quests.active.length === 0 ? (
          <p className={styles.empty}>Nenhuma quest ativa.</p>
        ) : (
          quests.active.map((q) => (
            <div key={q.id} className={styles.quest}>
              <h3 className={styles.questName}>{q.name}</h3>
              <p className={styles.questDesc}>{q.description}</p>
            </div>
          ))
        )}
      </Panel>

      {quests.completed.length > 0 && (
        <Panel title="Concluidas">
          {quests.completed.map((q) => (
            <div key={q.id} className={styles.questCompleted}>
              <h3 className={styles.questName}>{q.name}</h3>
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}
