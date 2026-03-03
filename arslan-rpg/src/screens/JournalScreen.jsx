import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import { getActiveQuestProgress } from '../engine/questEngine';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import ProgressBar from '../components/ui/ProgressBar';
import { OrnamentDivider } from '../components/ui/Ornament';
import QuestEntry from '../components/journal/QuestEntry';
import QuestDetail from '../components/journal/QuestDetail';
import narsusNotes from '../data/lore/narsus_notes.json';
import styles from './JournalScreen.module.css';

const CATEGORY_LABELS = {
  politica: 'Politica',
  tatica: 'Tatica',
  inteligencia: 'Inteligencia',
  observacao: 'Observacao',
  pessoal: 'Pessoal',
};

export default function JournalScreen() {
  const navigate = useNavigate();
  const quests = useGameStore((s) => s.quests);
  const gameState = useGameStore();
  const worldFlags = useGameStore((s) => s.world?.world_flags || {});
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeTab, setActiveTab] = useState('quests');

  const unlockedNotes = useMemo(
    () => narsusNotes.filter((n) => !n.unlock_flag || worldFlags[n.unlock_flag]),
    [worldFlags]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Diario</h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Voltar</Button>
      </div>
      <OrnamentDivider />

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'quests' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('quests')}
        >
          Quests
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'notes' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notas de Narsus {unlockedNotes.length > 0 && `(${unlockedNotes.length})`}
        </button>
      </div>

      {/* Quests Tab */}
      {activeTab === 'quests' && (
        selectedQuest ? (
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
        )
      )}

      {/* Narsus Notes Tab */}
      {activeTab === 'notes' && (
        selectedNote ? (
          <Panel className={styles.noteDetail}>
            <div className={styles.noteDetailHeader}>
              <span className={styles.noteCategoryBadge}>{CATEGORY_LABELS[selectedNote.category] || selectedNote.category}</span>
              <h2 className={styles.noteDetailTitle}>{selectedNote.title}</h2>
              <p className={styles.noteDetailAuthor}>— {selectedNote.author}</p>
            </div>
            <OrnamentDivider />
            <div className={styles.noteDetailText}>
              {selectedNote.text.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <Button variant="secondary" size="sm" onClick={() => setSelectedNote(null)}>Voltar</Button>
          </Panel>
        ) : (
          <div className={styles.notesList}>
            {unlockedNotes.length === 0 ? (
              <p className={styles.empty}>Recrute Narsus para desbloquear suas notas e analises.</p>
            ) : (
              unlockedNotes.map((note) => (
                <Panel
                  key={note.id}
                  className={styles.noteEntry}
                  onClick={() => setSelectedNote(note)}
                >
                  <div className={styles.noteEntryRow}>
                    <span className={styles.noteCategoryBadge}>{CATEGORY_LABELS[note.category] || note.category}</span>
                    <h4 className={styles.noteEntryTitle}>{note.title}</h4>
                  </div>
                  <p className={styles.noteEntryPreview}>{note.text.slice(0, 100)}...</p>
                </Panel>
              ))
            )}
          </div>
        )
      )}
    </div>
  );
}
