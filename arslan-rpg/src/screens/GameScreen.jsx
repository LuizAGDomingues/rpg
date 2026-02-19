import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import { getScene, getAvailableChoices, processChoice, getNarrativeText, getSceneTitle } from '../engine/narrativeEngine';
import NarrativeBox from '../components/narrative/NarrativeBox';
import ChoiceBox from '../components/narrative/ChoiceBox';
import ChapterTitle from '../components/narrative/ChapterTitle';
import CombatScreen from '../components/combat/CombatScreen';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { OrnamentDivider } from '../components/ui/Ornament';
import act1Data from '../data/narrative/act1_prologue.json';
import act2Data from '../data/narrative/act2_exile.json';
import act3Data from '../data/narrative/act3_alliance.json';
import act4Data from '../data/narrative/act4_return.json';
import styles from './GameScreen.module.css';

const narrativeData = {
  scenes: [
    ...(act1Data.scenes || []),
    ...(act2Data.scenes || []),
    ...(act3Data.scenes || []),
    ...(act4Data.scenes || []),
  ],
};

export default function GameScreen() {
  const navigate = useNavigate();
  const gamePhase = useGameStore((s) => s.gamePhase);
  const currentScene = useGameStore((s) => s.currentScene);
  const player = useGameStore((s) => s.player);
  const currentAct = useGameStore((s) => s.currentAct);
  const combat = useGameStore((s) => s.combat);
  const store = useGameStore();

  const [showChoices, setShowChoices] = useState(true);
  const [results, setResults] = useState([]);

  const scene = useMemo(() => getScene(currentScene, narrativeData), [currentScene]);
  const paragraphs = useMemo(() => getNarrativeText(scene), [scene]);
  const title = useMemo(() => getSceneTitle(scene), [scene]);

  const choices = useMemo(() => {
    if (!scene) return [];
    return getAvailableChoices(scene, store);
  }, [scene, store]);

  const handleChoice = useCallback((choice) => {
    const choiceResults = processChoice(choice, store, store);
    setResults(choiceResults);
    setShowChoices(true);

    const combatResult = choiceResults.find((r) => r.type === 'combat');
    if (combatResult) {
      store.startCombat(combatResult.combatData);
    }
  }, [store]);

  const handleNarrativeComplete = useCallback(() => {
    setShowChoices(true);
  }, []);

  if (gamePhase === 'combat' && combat) {
    return <CombatScreen />;
  }

  if (!scene) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <ChapterTitle title="Fim do conteudo disponivel" />
          <p className={styles.endText}>A historia continua em breve...</p>
          <OrnamentDivider />
          <Button variant="primary" onClick={() => store.setGamePhase('title')}>
            Voltar ao Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.topBar}>
        <div className={styles.playerInfo}>
          <span className={styles.playerName}>{player.name}</span>
          <span className={styles.playerClass}>
            {player.class === 'warrior' ? 'Guerreiro' : player.class === 'diplomat' ? 'Diplomata' : player.class === 'strategist' ? 'Estrategista' : ''}
          </span>
          <span className={styles.playerLevel}>Nv. {player.level}</span>
        </div>
        <div className={styles.barGroup}>
          <ProgressBar current={player.hp} max={player.hp_max} color="var(--hp-green)" label="HP" height={6} />
          <ProgressBar current={player.xp} max={player.xp_next} color="var(--gold)" label="XP" height={4} />
        </div>
        <div className={styles.navButtons}>
          <Button variant="secondary" size="sm" onClick={() => navigate('/map')}>Mapa</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/inventory')}>Inventario</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/party')}>Grupo</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/journal')}>Diario</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/factions')}>Faccoes</Button>
        </div>
      </nav>

      <div className={styles.actBadge}>Ato {currentAct}</div>

      <div className={styles.content}>
        {title && <ChapterTitle title={title} />}
        <NarrativeBox paragraphs={paragraphs} onComplete={handleNarrativeComplete} />

        {results.length > 0 && (
          <div className={styles.resultsList}>
            {results.map((r, i) => (
              <ResultBadge key={i} result={r} />
            ))}
          </div>
        )}

        {showChoices && choices.length > 0 && (
          <ChoiceBox choices={choices} onChoice={handleChoice} />
        )}
      </div>
    </div>
  );
}

function ResultBadge({ result }) {
  const labels = {
    faction: `⚜ Reputacao: ${result.faction} ${result.delta > 0 ? '+' : ''}${result.delta}`,
    xp: `✨ +${result.amount} XP`,
    item: `📦 Item obtido: ${result.item?.name || '???'}`,
    key_item: `🔑 Item chave: ${result.item?.name || '???'}`,
    recruit: `⚔ ${result.name || result.generalId} se juntou ao grupo!${result.title ? ` (${result.title})` : ''}`,
    region: `🗺 Nova regiao desbloqueada: ${result.region}`,
    quest: `📜 Nova quest: ${result.quest?.name || '???'}`,
    quest_complete: `✅ Quest concluida!`,
  };
  const text = labels[result.type] || '';
  if (!text) return null;

  return <span className={styles.resultBadge}>{text}</span>;
}
