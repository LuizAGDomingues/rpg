import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import { getActiveQuestProgress } from '../engine/questEngine';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import ProgressBar from '../components/ui/ProgressBar';
import { OrnamentDivider } from '../components/ui/Ornament';
import QuestEntry from '../components/journal/QuestEntry';
import QuestDetail from '../components/journal/QuestDetail';
import styles from './JournalScreen.module.css';

export default function JournalScreen() {
  const navigate = useNavigate();
  const quests = useGameStore((s) => s.quests);
  const gameState = useGameStore();
  const [selectedQuest, setSelectedQuest] = useState(null);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Diario de Quests</h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Voltar</Button>
      </div>
      <OrnamentDivider />

      {selectedQuest ? (
        <QuestDetail quest={selectedQuest} onClose={() => setSelectedQuest(null)} />
      ) : (
        <>
          <Panel title="Quests Ativas">
            {quests.active.length === 0 ? (
              <p className={styles.empty}>Nenhuma quest ativa.</p>
            ) : (
              <div className={styles.questList}>
                {quests.active.map((q) => {
                  const progress = getActiveQuestProgress(q, gameState);
                  return (
                    <div key={q.id}>
                      <QuestEntry quest={q} active onClick={() => setSelectedQuest(q)} />
                      {progress.total > 0 && (
                        <div className={styles.progressRow}>
                          <ProgressBar
                            current={progress.done}
                            max={progress.total}
                            color="var(--gold)"
                            height={4}
                          />
                          <span className={styles.progressPct}>{progress.done}/{progress.total} ({progress.percent}%)</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {quests.completed.length > 0 && (
            <Panel title="Concluidas">
              <div className={styles.questList}>
                {quests.completed.map((q) => (
                  <QuestEntry key={q.id} quest={q} active={false} onClick={() => setSelectedQuest(q)} />
                ))}
              </div>
            </Panel>
          )}

          {quests.failed.length > 0 && (
            <Panel title="Falhadas">
              <div className={styles.questList}>
                {quests.failed.map((q) => (
                  <QuestEntry key={q.id} quest={q} active={false} onClick={() => setSelectedQuest(q)} />
                ))}
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
