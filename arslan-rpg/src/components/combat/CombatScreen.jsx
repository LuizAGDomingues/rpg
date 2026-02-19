import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import useGameStore from '../../store/useGameStore';
import { rollInitiative, rollAttack, rollDamage, processEnemyTurn, checkCombatEnd, calculateXPReward, calculateGoldReward } from '../../engine/combatEngine';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { OrnamentDivider } from '../ui/Ornament';
import styles from './CombatScreen.module.css';

export default function CombatScreen() {
  const combat = useGameStore((s) => s.combat);
  const player = useGameStore((s) => s.player);
  const recruitedGenerals = useGameStore((s) => s.recruited_generals);
  const inventory = useGameStore((s) => s.inventory);
  const store = useGameStore();

  const [allies, setAllies] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [activeAllyIndex, setActiveAllyIndex] = useState(0);
  const [selectedTargetIndex, setSelectedTargetIndex] = useState(0);
  const [currentPA, setCurrentPA] = useState(0);
  const [log, setLog] = useState([]);
  const [combatState, setCombatState] = useState('init');
  const [result, setResult] = useState(null);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const logRef = useRef(null);

  // --- Stable log helper ---
  const addLog = useCallback((msg) => {
    setLog((prev) => [...prev.slice(-30), msg]);
  }, []);

  // --- Initialize combat (runs once) ---
  useEffect(() => {
    if (!combat || combatState !== 'init') return;

    const playerWeapon = player.equipment?.weapon || { name: 'Punhos', damage: '1d4', bonus_atk: 0 };
    const armorBonus = player.equipment?.armor?.ca_bonus || 0;
    const shieldBonus = player.equipment?.shield?.ca_bonus || 0;

    const playerCombatant = {
      id: 'arslan', name: 'Arslan', isPlayer: true, isAlly: false,
      attributes: { ...player.attributes },
      hp: player.hp, hp_max: player.hp_max,
      ca: player.ca + armorBonus + shieldBonus,
      pa: player.pa, pa_max: player.pa,
      weapon: playerWeapon,
      skills: [...(player.skills || [])],
    };

    const generalAllies = (recruitedGenerals || []).slice(0, 3).map((gen) => ({
      id: gen.id, name: gen.name, isPlayer: false, isAlly: true,
      attributes: { ...gen.attributes },
      hp: gen.current_hp ?? gen.hp, hp_max: gen.hp_max ?? gen.hp,
      ca: gen.ca, pa: 3, pa_max: 3,
      weapon: gen.weapon || { name: 'Arma', damage: '1d6', bonus_atk: 0 },
      skills: gen.skills ? [...gen.skills] : [],
      title: gen.title,
    }));

    const allAllies = [playerCombatant, ...generalAllies];

    const enemyCombatants = combat.enemies.map((e, i) => ({
      ...e,
      id: `${e.id}_${i}`,
      hp_max: e.hp,
      pa_max: e.pa || 2,
    }));

    const allCombatants = rollInitiative([...allAllies, ...enemyCombatants]);
    const initiativeMsg = allCombatants.map((c) => `${c.name}: ${c.initiative}`).join(', ');

    setAllies(allAllies);
    setEnemies(enemyCombatants);
    setActiveAllyIndex(0);
    setCurrentPA(allAllies[0].pa);
    addLog(`⚔ Combate iniciado: ${combat.name}!`);
    addLog(`Iniciativa: ${initiativeMsg}`);
    addLog(`--- Turno de ${allAllies[0].name} ---`);
    setCombatState('player_turn');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat, combatState]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // --- Derived state ---
  const currentAlly = allies[activeAllyIndex] || null;
  const livingEnemies = useMemo(() => enemies.filter((e) => e.hp > 0), [enemies]);
  const consumables = useMemo(
    () => (inventory?.items || []).filter((i) => i.type === 'consumable'),
    [inventory]
  );

  // --- Finish combat helper ---
  const finishCombat = useCallback((combatResult) => {
    setCombatState('ended');
    if (combatResult === 'victory') {
      const xp = combat?.xp_reward || calculateXPReward(combat?.enemies || []);
      const gold = calculateGoldReward(combat?.enemies || []);
      setResult({ type: 'victory', xp, gold });
      addLog(`\n🏆 VITORIA! +${xp} XP, +${gold} ouro`);
    } else {
      setResult({ type: 'defeat' });
      addLog(`\n💀 DERROTA...`);
    }
  }, [combat, addLog]);

  // --- Check if combat ended (uses latest state via setters) ---
  const checkEnd = useCallback(() => {
    setTimeout(() => {
      setEnemies((curEnemies) => {
        setAllies((curAllies) => {
          const end = checkCombatEnd(curAllies, curEnemies);
          if (end) finishCombat(end);
          return curAllies;
        });
        return curEnemies;
      });
    }, 100);
  }, [finishCombat]);

  // --- ACTION: Heavy Attack (2 PA) ---
  const handleAttack = useCallback(() => {
    if (currentPA < 2 || !currentAlly || currentAlly.hp <= 0) return;
    const target = livingEnemies[selectedTargetIndex] || livingEnemies[0];
    if (!target) return;

    const attack = rollAttack(currentAlly, target);
    if (attack.hits) {
      const dmg = rollDamage(currentAlly, attack.isCrit);
      const newHP = Math.max(0, target.hp - dmg.total);
      setEnemies((prev) => prev.map((e) => e.id === target.id ? { ...e, hp: newHP } : e));
      addLog(`${currentAlly.name} ataca ${target.name}! (d20: ${attack.roll}+${attack.attackMod}=${attack.total} vs CA ${target.ca}) ${attack.isCrit ? '💥 CRITICO! ' : ''}Dano: ${dmg.total}`);
      if (newHP <= 0) addLog(`  ☠ ${target.name} foi derrotado!`);
    } else {
      addLog(`${currentAlly.name} ataca ${target.name}... e erra! (d20: ${attack.roll}+${attack.attackMod}=${attack.total} vs CA ${target.ca})${attack.isFumble ? ' ❌ FALHA CRITICA!' : ''}`);
    }
    setCurrentPA((pa) => pa - 2);
    checkEnd();
  }, [currentPA, currentAlly, livingEnemies, selectedTargetIndex, addLog, checkEnd]);

  // --- ACTION: Light Attack (1 PA) ---
  const handleLightAttack = useCallback(() => {
    if (currentPA < 1 || !currentAlly || currentAlly.hp <= 0) return;
    const target = livingEnemies[selectedTargetIndex] || livingEnemies[0];
    if (!target) return;

    const attack = rollAttack(currentAlly, target);
    if (attack.hits) {
      const dmg = rollDamage(currentAlly, false);
      const reduced = Math.max(1, Math.floor(dmg.total * 0.6));
      const newHP = Math.max(0, target.hp - reduced);
      setEnemies((prev) => prev.map((e) => e.id === target.id ? { ...e, hp: newHP } : e));
      addLog(`${currentAlly.name} faz ataque rapido em ${target.name}! (${attack.total} vs CA ${target.ca}) Dano: ${reduced}`);
      if (newHP <= 0) addLog(`  ☠ ${target.name} foi derrotado!`);
    } else {
      addLog(`${currentAlly.name} erra o ataque rapido em ${target.name}! (${attack.total} vs CA ${target.ca})`);
    }
    setCurrentPA((pa) => pa - 1);
    checkEnd();
  }, [currentPA, currentAlly, livingEnemies, selectedTargetIndex, addLog, checkEnd]);

  // --- ACTION: Defend (1 PA) ---
  const handleDefend = useCallback(() => {
    if (currentPA < 1 || !currentAlly) return;
    addLog(`🛡 ${currentAlly.name} assume postura defensiva. (+2 CA ate proximo turno)`);
    setAllies((prev) => prev.map((a) =>
      a.id === currentAlly.id ? { ...a, ca: a.ca + 2, _defending: true } : a
    ));
    setCurrentPA((pa) => pa - 1);
  }, [currentPA, currentAlly, addLog]);

  // --- ACTION: Use Item (1 PA) ---
  const handleUseItem = useCallback((item) => {
    if (currentPA < 1 || !currentAlly) return;

    if (item.effect === 'heal') {
      const healMatch = item.value_range?.match(/(\d+)d(\d+)\+?(\d+)?/);
      let healAmount = 8;
      if (healMatch) {
        const [, qty, sides, bonus] = healMatch;
        healAmount = 0;
        for (let d = 0; d < parseInt(qty); d++) {
          healAmount += Math.floor(Math.random() * parseInt(sides)) + 1;
        }
        healAmount += parseInt(bonus || 0);
      }
      setAllies((prev) => prev.map((a) =>
        a.id === currentAlly.id ? { ...a, hp: Math.min(a.hp_max, a.hp + healAmount) } : a
      ));
      addLog(`🧪 ${currentAlly.name} usa ${item.name}! Recupera ${healAmount} HP.`);
    } else if (item.effect === 'cure_poison') {
      addLog(`🧪 ${currentAlly.name} usa ${item.name}! Veneno removido.`);
    } else if (item.effect === 'cure_bleed') {
      addLog(`🩹 ${currentAlly.name} usa ${item.name}! Sangramento estancado.`);
    }
    store.removeFromInventory(item.uid || item.id);
    setCurrentPA((pa) => pa - 1);
    setShowItemMenu(false);
  }, [currentPA, currentAlly, store, addLog]);

  // --- ENEMY TURN ---
  const runEnemyTurn = useCallback(() => {
    addLog('═══ Turno dos Inimigos ═══');

    setEnemies((curEnemies) => {
      const livingEnms = curEnemies.filter((e) => e.hp > 0);

      setAllies((curAllies) => {
        const livingAlls = curAllies.filter((a) => a.hp > 0);
        const updated = curAllies.map((a) => ({ ...a })); // shallow clone

        livingEnms.forEach((enemy) => {
          const actions = processEnemyTurn(enemy, livingAlls);
          actions.forEach((action) => {
            const idx = updated.findIndex((a) => a.id === action.target.id);
            if (idx === -1) return;

            if (action.attack.hits) {
              const newHP = Math.max(0, updated[idx].hp - action.damage);
              updated[idx] = { ...updated[idx], hp: newHP };
              addLog(`${enemy.name} ataca ${updated[idx].name}! (d20: ${action.attack.roll}) ${action.attack.isCrit ? '💥 CRITICO! ' : ''}Dano: ${action.damage}`);
              if (newHP <= 0) addLog(`  ⚠ ${updated[idx].name} caiu!`);
            } else {
              addLog(`${enemy.name} ataca ${updated[idx].name}... e erra! (d20: ${action.attack.roll})`);
            }
          });
        });

        // Check end
        const end = checkCombatEnd(updated, curEnemies);
        if (end) {
          setTimeout(() => finishCombat(end), 300);
          return updated;
        }

        // Next round: reset to first living ally
        setTimeout(() => {
          let first = 0;
          while (first < updated.length && updated[first].hp <= 0) first++;
          if (first < updated.length) {
            setActiveAllyIndex(first);
            setCurrentPA(updated[first].pa_max || updated[first].pa || 3);
            addLog('═══ Seu Turno ═══');
            addLog(`--- Turno de ${updated[first].name} ---`);
          }
        }, 500);

        return updated;
      });

      return curEnemies;
    });
  }, [addLog, finishCombat]);

  // --- END ALLY TURN ---
  const handleEndAllyTurn = useCallback(() => {
    // Remove defend bonus from current ally
    if (currentAlly?._defending) {
      setAllies((prev) => prev.map((a) =>
        a.id === currentAlly.id ? { ...a, ca: a.ca - 2, _defending: false } : a
      ));
    }

    // Find next living ally
    let nextIdx = activeAllyIndex + 1;
    while (nextIdx < allies.length && allies[nextIdx].hp <= 0) nextIdx++;

    if (nextIdx < allies.length) {
      setActiveAllyIndex(nextIdx);
      setCurrentPA(allies[nextIdx].pa_max || allies[nextIdx].pa || 3);
      addLog(`--- Turno de ${allies[nextIdx].name} ---`);
    } else {
      runEnemyTurn();
    }
  }, [currentAlly, activeAllyIndex, allies, addLog, runEnemyTurn]);

  // --- EXIT COMBAT ---
  const handleExitCombat = useCallback(() => {
    if (result?.type === 'victory') {
      store.addXP(result.xp);
      store.addGold(result.gold);
      // Sync Arslan HP
      const arslan = allies.find((a) => a.id === 'arslan');
      if (arslan) {
        const delta = arslan.hp - player.hp;
        if (delta !== 0) store.updatePlayerHP(delta);
      }
      // Sync general HP
      allies.filter((a) => a.isAlly).forEach((ally) => {
        const gen = (recruitedGenerals || []).find((g) => g.id === ally.id);
        if (gen) {
          const hpDelta = ally.hp - (gen.current_hp ?? gen.hp);
          if (hpDelta !== 0) store.updateGeneralHP(ally.id, hpDelta);
        }
      });
    }
    store.endCombat();
  }, [result, store, allies, player, recruitedGenerals]);

  // --- Guard ---
  if (!combat) return null;

  // ==================== RENDER ====================
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{combat.name}</h2>
      <OrnamentDivider />

      {/* ----- Battlefield ----- */}
      <div className={styles.battlefield}>
        {/* Allies */}
        <div className={styles.side}>
          <h4 className={styles.sideLabel}>Aliados</h4>
          {allies.map((ally, idx) => (
            <div
              key={ally.id}
              className={[
                styles.combatantCard,
                ally.hp <= 0 ? styles.defeated : '',
                idx === activeAllyIndex && combatState === 'player_turn' ? styles.activeTurn : '',
              ].filter(Boolean).join(' ')}
            >
              <h3 className={styles.combatantName}>
                {ally.name}
                {ally.isPlayer && ' ★'}
                {idx === activeAllyIndex && combatState === 'player_turn' && ' ◄'}
              </h3>
              {ally.title && <span className={styles.combatantTitle}>{ally.title}</span>}
              <ProgressBar current={Math.max(0, ally.hp)} max={ally.hp_max} color="var(--hp-green)" label="HP" />
              {idx === activeAllyIndex && combatState === 'player_turn' && (
                <div className={styles.paBar}>
                  {Array.from({ length: ally.pa_max || ally.pa || 3 }).map((_, j) => (
                    <span key={j} className={`${styles.paDot} ${j < currentPA ? styles.paActive : ''}`} />
                  ))}
                  <span className={styles.paLabel}>PA</span>
                </div>
              )}
              {ally.hp <= 0 && <span className={styles.defeatedLabel}>Caiu</span>}
            </div>
          ))}
        </div>

        <div className={styles.vs}>VS</div>

        {/* Enemies */}
        <div className={styles.side}>
          <h4 className={styles.sideLabel}>Inimigos</h4>
          {enemies.map((enemy) => {
            const liveIdx = livingEnemies.indexOf(enemy);
            return (
              <div
                key={enemy.id}
                className={[
                  styles.combatantCard,
                  enemy.hp <= 0 ? styles.defeated : '',
                  liveIdx === selectedTargetIndex && enemy.hp > 0 ? styles.targeted : '',
                ].filter(Boolean).join(' ')}
                onClick={() => { if (enemy.hp > 0 && liveIdx >= 0) setSelectedTargetIndex(liveIdx); }}
                style={{ cursor: enemy.hp > 0 ? 'pointer' : 'default' }}
              >
                <h3 className={styles.combatantName}>
                  {enemy.name}
                  {liveIdx === selectedTargetIndex && enemy.hp > 0 && ' ◄ Alvo'}
                </h3>
                <ProgressBar current={Math.max(0, enemy.hp)} max={enemy.hp_max} color="var(--hp-red)" label="HP" />
                {enemy.hp <= 0 && <span className={styles.defeatedLabel}>Derrotado</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ----- Actions ----- */}
      {combatState === 'player_turn' && currentAlly && currentAlly.hp > 0 && (
        <div className={styles.actions}>
          <Button variant="primary" size="md" onClick={handleAttack} disabled={currentPA < 2}>
            ⚔ Atacar (2 PA)
          </Button>
          <Button variant="secondary" size="md" onClick={handleLightAttack} disabled={currentPA < 1}>
            🗡 Ataque Rapido (1 PA)
          </Button>
          <Button variant="secondary" size="md" onClick={handleDefend} disabled={currentPA < 1}>
            🛡 Defender (1 PA)
          </Button>
          {consumables.length > 0 && (
            <Button variant="secondary" size="md" onClick={() => setShowItemMenu(!showItemMenu)} disabled={currentPA < 1}>
              🧪 Usar Item (1 PA)
            </Button>
          )}
          <Button variant="gold" size="md" onClick={handleEndAllyTurn}>
            ➡ Encerrar Turno
          </Button>
        </div>
      )}

      {/* ----- Item Menu ----- */}
      {showItemMenu && combatState === 'player_turn' && (
        <div className={styles.itemMenu}>
          <h4>Itens Disponiveis</h4>
          {consumables.map((item, idx) => (
            <Button key={item.uid || idx} variant="secondary" size="sm" onClick={() => handleUseItem(item)}>
              {item.name}
            </Button>
          ))}
          <Button variant="secondary" size="sm" onClick={() => setShowItemMenu(false)}>Cancelar</Button>
        </div>
      )}

      {/* ----- Result ----- */}
      {combatState === 'ended' && (
        <div className={styles.resultPanel}>
          <h3 className={result?.type === 'victory' ? styles.victoryText : styles.defeatText}>
            {result?.type === 'victory' ? '🏆 Vitoria!' : '💀 Derrota...'}
          </h3>
          {result?.type === 'victory' && (
            <div className={styles.rewards}>
              <span>+{result.xp} XP</span>
              <span>+{result.gold} Ouro</span>
            </div>
          )}
          <Button variant="gold" size="lg" onClick={handleExitCombat}>
            Continuar
          </Button>
        </div>
      )}

      {/* ----- Combat Log ----- */}
      <div className={styles.logPanel}>
        <h4 className={styles.logTitle}>Log de Combate</h4>
        <div className={styles.logContent} ref={logRef}>
          {log.map((entry, idx) => (
            <p key={idx} className={styles.logEntry}>{entry}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
