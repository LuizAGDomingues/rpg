import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import { checkFactionUnlocks } from '../engine/factionEngine';
import { getScene, getAvailableChoices, processChoice, getNarrativeText, getSceneTitle } from '../engine/narrativeEngine';
import NarrativeBox from '../components/narrative/NarrativeBox';
import ChoiceBox from '../components/narrative/ChoiceBox';
import ChapterTitle from '../components/narrative/ChapterTitle';
import CombatScreen from '../components/combat/CombatScreen';
import DialogueScreen from '../components/dialogue/DialogueScreen';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { OrnamentDivider } from '../components/ui/Ornament';
import act1Data from '../data/narrative/act1_prologue.json';
import act2Data from '../data/narrative/act2_exile.json';
import act3Data from '../data/narrative/act3_alliance.json';
import act4Data from '../data/narrative/act4_return.json';
import act5Data from '../data/narrative/act5_aftermath.json';
import epiloguesData from '../data/narrative/epilogues.json';
import campEventsData from '../data/world/camp_events.json';
import styles from './GameScreen.module.css';
import { playTheme, playSFX } from '../engine/audioEngine';

// Determine which epilogue to show based on world flags and character_score
const resolveEpilogueScene = (worldFlags, characterScore) => {
  for (const ep of epiloguesData) {
    const cond = ep.trigger_condition;
    if (cond === 'wise_king' && worldFlags.wise_king) return ep;
    if (cond === 'merciful_king' && worldFlags.merciful_king && !worldFlags.wise_king) return ep;
    if (cond === 'just_king' && worldFlags.just_king) return ep;
  }
  return epiloguesData[0]; // fallback to just_king epilogue
};

const buildNarrativeData = (worldFlags, characterScore) => {
  const epilogue = resolveEpilogueScene(worldFlags || {}, characterScore || 0);
  const epilogueScene = {
    id: 'epilogue_dynamic',
    title: epilogue.title,
    type: 'chapter_end',
    text: epilogue.text,
    choices: [
      { id: 'to_act5', text: 'Continuar.', next_scene: 'act5_morning_after', set_act: 5 }
    ],
  };
  return {
    scenes: [
      ...(act1Data.scenes || []),
      ...(act2Data.scenes || []),
      ...(act3Data.scenes || []),
      ...(act4Data.scenes || []),
      ...(act5Data.scenes || []),
      epilogueScene,
    ],
  };
};

export default function GameScreen() {
  const navigate = useNavigate();
  const gamePhase = useGameStore((s) => s.gamePhase);
  const currentScene = useGameStore((s) => s.currentScene);
  const player = useGameStore((s) => s.player);
  const currentAct = useGameStore((s) => s.currentAct);
  const combat = useGameStore((s) => s.combat);
  const store = useGameStore();

  const world = useGameStore((s) => s.world);
  const factions = useGameStore((s) => s.factions);
  const activeQuestCount = useGameStore((s) => s.quests?.active?.length || 0);

  // Troop count calculated from faction alliances
  const troopCount = useMemo(() => {
    let troops = 0;
    if ((factions.nobreza_pars || 0) >= 80) troops += 500;
    else if ((factions.nobreza_pars || 0) >= 50) troops += 200;
    if ((factions.escravos_libertos || 0) >= 50) troops += 300;
    if ((factions.sindhura || 0) >= 75) troops += 400;
    if ((factions.turan || 0) >= 65) troops += 300;
    if ((factions.clero_mithra || 0) >= 50) troops += 150;
    return troops;
  }, [factions]);

  // Act progress: scenes visited from current act's scene list
  const actProgress = useMemo(() => {
    const actScenes = narrativeData.scenes.filter((s) => {
      const id = s.id || '';
      if (currentAct === 1) return id.startsWith('prologue') || id.startsWith('act1');
      if (currentAct === 2) return id.startsWith('act2') || id.startsWith('exile');
      if (currentAct === 3) return id.startsWith('act3') || id.startsWith('war_council') || id.startsWith('sindhura');
      if (currentAct === 4) return id.startsWith('act4') || id.startsWith('kharlan') || id.startsWith('silvermask') || id.startsWith('etoile') || id.startsWith('final_war') || id.startsWith('tahamine');
      if (currentAct === 5) return id.startsWith('act5') || id.startsWith('epilogue');
      return false;
    });
    const total = actScenes.length;
    if (total === 0) return 0;
    const currentIdx = actScenes.findIndex((s) => s.id === currentScene);
    return currentIdx >= 0 ? Math.round(((currentIdx + 1) / total) * 100) : 0;
  }, [narrativeData, currentAct, currentScene]);

  const [showChoices, setShowChoices] = useState(true);
  const [results, setResults] = useState([]);
  const [factionMilestone, setFactionMilestone] = useState(null);
  const prevFactionRef = useRef({});
  const [activeCampEvent, setActiveCampEvent] = useState(null);
  const [campEventChoiceResult, setCampEventChoiceResult] = useState(null);
  const campEventCheckedScene = useRef(null);

  // Switch music theme based on game phase
  useEffect(() => {
    if (gamePhase === 'combat') playTheme('combat');
    else if (gamePhase === 'dialogue') playTheme('dialogue');
    else playTheme('exploration');
  }, [gamePhase]);

  // Check for eligible camp events on scene change
  useEffect(() => {
    if (gamePhase !== 'playing') return;
    if (campEventCheckedScene.current === currentScene) return;
    campEventCheckedScene.current = currentScene;
    if (Math.random() > 0.25) return; // 25% chance per scene

    const worldFlags = store.world?.world_flags || {};
    const recruitedGenerals = store.recruited_generals || [];
    const eligible = campEventsData.filter((ev) => {
      if (ev.requires_general && !recruitedGenerals.includes(ev.requires_general)) return false;
      if (ev.trigger_flag && !worldFlags[ev.trigger_flag]) return false;
      if (ev.not_flag && worldFlags[ev.not_flag]) return false;
      return true;
    });
    if (eligible.length > 0) {
      const picked = eligible[Math.floor(Math.random() * eligible.length)];
      setActiveCampEvent(picked);
      setCampEventChoiceResult(null);
    }
  }, [currentScene, gamePhase]);

  const narrativeData = useMemo(
    () => buildNarrativeData(world?.world_flags, player?.character_score),
    [world?.world_flags, player?.character_score]
  );

  const scene = useMemo(() => getScene(currentScene, narrativeData), [currentScene, narrativeData]);
  const paragraphs = useMemo(() => getNarrativeText(scene), [scene]);
  const title = useMemo(() => getSceneTitle(scene), [scene]);

  const choices = useMemo(() => {
    if (!scene) return [];
    return getAvailableChoices(scene, store);
  }, [scene, store]);

  const handleChoice = useCallback((choice) => {
    playSFX('ui_click');
    // Snapshot factions before choice
    const factionsBefore = { ...store.factions };
    const choiceResults = processChoice(choice, store, store);
    setResults(choiceResults);
    setShowChoices(true);

    // Check faction milestones
    const factionsAfter = useGameStore.getState().factions;
    const MILESTONE_LABELS = { nobreza_pars: 'Nobreza de Pars', lusitanos_moderados: 'Lusitanos Moderados', sindhura: 'Reino de Sindhura', turan: 'Cavaleiros de Turan', escravos_libertos: 'Escravos Libertos', clero_mithra: 'Templo de Mithra' };
    for (const [fid, rep] of Object.entries(factionsAfter)) {
      const prev = factionsBefore[fid] || 0;
      if (prev < 50 && rep >= 50) setFactionMilestone({ factionId: fid, name: MILESTONE_LABELS[fid] || fid, tier: 'Respeitoso' });
      else if (prev < 80 && rep >= 80) setFactionMilestone({ factionId: fid, name: MILESTONE_LABELS[fid] || fid, tier: 'Aliado' });
    }
    if (factionMilestone) setTimeout(() => setFactionMilestone(null), 3500);

    // Autosave on scene advance
    if (choice.next_scene) store.saveToSlot('auto');

    if (choice.navigate_to_map) {
      navigate('/map');
      return;
    }

    const combatResult = choiceResults.find((r) => r.type === 'combat');
    if (combatResult) {
      store.startCombat(combatResult.combatData);
    }

    const dialogueResult = choiceResults.find((r) => r.type === 'dialogue');
    if (dialogueResult) {
      store.startDialogue({
        npcId: dialogueResult.dialogueData.npcId,
        currentNodeId: dialogueResult.dialogueData.startNode || 'start',
        location: dialogueResult.dialogueData.location || null,
      });
    }

    if (choiceResults.some((r) => r.type === 'quest_complete')) {
      playSFX('quest_complete');
    }
  }, [store, factionMilestone]);

  const handleNarrativeComplete = useCallback(() => {
    setShowChoices(true);
  }, []);

  const handleCampEventChoice = useCallback((choice) => {
    const reward = choice.reward;
    if (reward) {
      if (reward.xp) store.addXP(reward.xp);
      if (reward.character_score) store.updateCharacterScore(reward.character_score);
      if (reward.hp_restore_percent && store.player.hp_max > 0) {
        store.updatePlayerHP(Math.floor(store.player.hp_max * reward.hp_restore_percent));
      }
      if (reward.flag) store.setWorldFlag(reward.flag, true);
      if (reward.flags) reward.flags.forEach((f) => store.setWorldFlag(f, true));
      Object.entries(reward).forEach(([key, val]) => {
        if (key.startsWith('faction_')) store.updateFaction(key.replace('faction_', ''), val);
      });
    }
    // Mark camp event as seen
    if (activeCampEvent?.set_flag) store.setWorldFlag(activeCampEvent.set_flag, true);
    setCampEventChoiceResult(choice.result || 'O momento passa.');
  }, [activeCampEvent, store]);

  const closeCampEvent = useCallback(() => {
    setActiveCampEvent(null);
    setCampEventChoiceResult(null);
  }, []);

  if (gamePhase === 'combat' && combat) {
    return <CombatScreen />;
  }

  if (gamePhase === 'dialogue' && store.dialogue) {
    return <DialogueScreen />;
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
          <span className={styles.questNavWrapper}>
            <Button variant="secondary" size="sm" onClick={() => navigate('/journal')}>Diario</Button>
            {activeQuestCount > 0 && <span className={styles.questBadge}>{activeQuestCount}</span>}
          </span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/factions')}>Faccoes</Button>
        </div>
      </nav>

      <div className={styles.actBadge}>
        Ato {currentAct}
        {troopCount > 0 && <span className={styles.troopCount}> &nbsp;⚔ {troopCount.toLocaleString()} soldados</span>}
      </div>

      {/* Act progress bar */}
      {actProgress > 0 && (
        <div className={styles.actProgressBar}>
          <div className={styles.actProgressFill} style={{ width: `${actProgress}%` }} />
        </div>
      )}

      {/* Faction milestone banner */}
      {factionMilestone && (
        <div className={styles.milestoneBanner}>
          ⚜ {factionMilestone.name} — {factionMilestone.tier}
        </div>
      )}

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

      {/* Camp Event Modal */}
      {activeCampEvent && (
        <div className={styles.campEventOverlay}>
          <div className={styles.campEventPanel}>
            <div className={styles.campEventHeader}>
              <span className={styles.campEventLabel}>Momento no Acampamento</span>
              <h3 className={styles.campEventTitle}>{activeCampEvent.title}</h3>
            </div>
            <p className={styles.campEventText}>
              {campEventChoiceResult || activeCampEvent.text}
            </p>
            {campEventChoiceResult ? (
              <Button variant="primary" size="sm" onClick={closeCampEvent}>Continuar</Button>
            ) : (
              <div className={styles.campEventChoices}>
                {activeCampEvent.choices?.map((choice, i) => (
                  <Button key={i} variant={i === 0 ? 'primary' : 'secondary'} size="sm" onClick={() => handleCampEventChoice(choice)}>
                    {choice.text}
                  </Button>
                ))}
                <Button variant="ghost" size="sm" onClick={() => { if (activeCampEvent?.set_flag) store.setWorldFlag(activeCampEvent.set_flag, true); closeCampEvent(); }}>
                  Ignorar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
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
