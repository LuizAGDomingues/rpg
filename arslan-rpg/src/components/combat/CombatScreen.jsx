import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import useGameStore from '../../store/useGameStore';
import {
  rollInitiative, rollAttack, rollDamage, processEnemyTurn,
  checkCombatEnd, calculateXPReward, calculateGoldReward,
  processStatusEffects, getSlowedPenalty, hasStatusEffect,
} from '../../engine/combatEngine';
import {
  getSkillsForCombatant, canUseSkill, needsTargetSelection,
  resolveSkill, tickCooldowns,
} from '../../engine/skillEngine';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { OrnamentDivider } from '../ui/Ornament';
import styles from './CombatScreen.module.css';
import { playSFX } from '../../engine/audioEngine';

const STATUS_ICONS = {
  bleed: '🩸', poison: '☠', stunned: '💫', derrubado: '⬇',
  intimidated: '😨', slowed: '🐌', marked: '🎯', morale: '💪',
  attack_buff: '⬆', strategy_buff: '⚡', defensive_stance: '🛡',
  movement_anticipated: '👁', intimidation_immunity: '🎵',
};

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
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [targetingSkill, setTargetingSkill] = useState(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [midCombatEvent, setMidCombatEvent] = useState(null);
  const [triggeredEventIds, setTriggeredEventIds] = useState(new Set());
  const [damagedIds, setDamagedIds] = useState(new Set());
  const [waveNumber, setWaveNumber] = useState(0);
  const [waveTransition, setWaveTransition] = useState(null);
  const [hitCount, setHitCount] = useState(0);
  const [skipEnemyRound, setSkipEnemyRound] = useState(false);
  const logRef = useRef(null);
  const waveNumberRef = useRef(0);
  const roundNumberRef = useRef(1);

  const addLog = useCallback((msg) => {
    setLog((prev) => [...prev.slice(-50), msg]);
  }, []);

  const flashDamage = useCallback((id) => {
    setDamagedIds((prev) => new Set([...prev, id]));
    setTimeout(() => setDamagedIds((prev) => { const n = new Set(prev); n.delete(id); return n; }), 450);
  }, []);

  // --- Wave advancement ---
  const advanceWave = useCallback((nextIdx) => {
    const nextWave = combat.waves[nextIdx];
    waveNumberRef.current = nextIdx;
    setWaveNumber(nextIdx);
    const label = nextWave.label || `Onda ${nextIdx + 1} de ${combat.waves.length}`;
    setWaveTransition(nextWave.intro_text || label);
    addLog(`\n⚔ ${label}${nextWave.intro_text ? ': ' + nextWave.intro_text : ''}`);
    setTimeout(() => {
      const newEnemies = (nextWave.enemies || []).map((e, i) => ({
        ...e,
        id: e.id ? `${e.id}_w${nextIdx}_${i}` : `enemy_w${nextIdx}_${i}`,
        hp_max: e.hp, pa_max: e.pa || 2, status_effects: [],
      }));
      setEnemies(newEnemies);
      setSelectedTargetIndex(0);
      setWaveTransition(null);
    }, 2200);
  }, [combat, addLog]);

  // --- Mid-combat event check ---
  const checkMidCombatEvents = useCallback((currentEnemies, currentRound) => {
    const events = combat?.mid_combat_events;
    if (!events || events.length === 0) return false;
    const boss = currentEnemies.find((e) => e.hp > 0);
    if (!boss) return false;
    const bossPct = boss.hp_max > 0 ? Math.round((boss.hp / boss.hp_max) * 100) : 0;

    for (const evt of events) {
      if (triggeredEventIds.has(evt.id)) continue;
      let triggered = false;
      if (evt.trigger === `boss_hp_pct_${bossPct}` || (
        evt.trigger.startsWith('boss_hp_pct_') &&
        bossPct <= parseInt(evt.trigger.replace('boss_hp_pct_', ''))
      )) triggered = true;
      if (evt.trigger === `turn_${currentRound}`) triggered = true;

      if (triggered) {
        setTriggeredEventIds((prev) => new Set([...prev, evt.id]));
        setMidCombatEvent(evt);
        return true;
      }
    }
    return false;
  }, [combat, triggeredEventIds]);

  // --- Initialize combat ---
  useEffect(() => {
    if (!combat || combatState !== 'init') return;

    const playerWeapon = player.equipment?.weapon || { name: 'Punhos', damage: '1d4', bonus_atk: 0 };
    const armorBonus = player.equipment?.armor?.ca_bonus || 0;
    const shieldBonus = player.equipment?.shield?.ca_bonus || 0;
    const legendarySkills = player.legendary_skills || [];

    const playerCombatant = {
      id: 'arslan', name: 'Arslan', isPlayer: true, isAlly: false,
      attributes: { ...player.attributes },
      hp: player.hp, hp_max: player.hp_max,
      ca: player.ca + armorBonus + shieldBonus,
      pa: player.pa, pa_max: player.pa,
      weapon: playerWeapon,
      skills: [...(player.skills || [])],
      skillCooldowns: {}, skillUsesThisCombat: {}, status_effects: [],
    };

    const generalAllies = combat.party_locked ? [] : (recruitedGenerals || []).slice(0, 3).map((gen) => {
      const genSkills = gen.skills ? [...gen.skills] : [];
      legendarySkills.forEach((ls) => {
        if (ls.character === gen.id && !genSkills.includes(ls.skillId)) genSkills.push(ls.skillId);
      });
      return {
        id: gen.id, name: gen.name, isPlayer: false, isAlly: true,
        attributes: { ...gen.attributes },
        hp: gen.current_hp ?? gen.hp, hp_max: gen.hp_max ?? gen.hp,
        ca: gen.ca, pa: 3, pa_max: 3,
        weapon: gen.weapon || { name: 'Arma', damage: '1d6', bonus_atk: 0 },
        skills: genSkills, title: gen.title,
        skillCooldowns: {}, skillUsesThisCombat: {}, status_effects: [],
      };
    });

    const allAllies = [playerCombatant, ...generalAllies];
    const initialEnemyList = combat.wave_system ? (combat.waves?.[0]?.enemies || []) : (combat.enemies || []);
    const enemyCombatants = initialEnemyList.map((e, i) => ({
      ...e, id: e.id ? `${e.id}_${i}` : `enemy_${i}`, hp_max: e.hp, pa_max: e.pa || 2, status_effects: [],
    }));

    const allCombatants = rollInitiative([...allAllies, ...enemyCombatants]);
    const initiativeMsg = allCombatants.map((c) => `${c.name}: ${c.initiative}`).join(', ');

    setAllies(allAllies);
    setEnemies(enemyCombatants);
    setActiveAllyIndex(0);
    setCurrentPA(allAllies[0].pa);
    if (combat.wave_system) addLog(`⚔ Combate iniciado: ${combat.name}! (${combat.waves?.length || 1} ondas)`);
    else addLog(`⚔ Combate iniciado: ${combat.name}!`);
    addLog(`Iniciativa: ${initiativeMsg}`);
    addLog(`--- Turno de ${allAllies[0].name} ---`);
    setCombatState('player_turn');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat, combatState]);

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
  const currentAllySkills = useMemo(() => {
    if (!currentAlly) return [];
    return getSkillsForCombatant(currentAlly).filter((s) => !s.passive);
  }, [currentAlly]);

  // --- Finish combat ---
  const finishCombat = useCallback((combatResult) => {
    setCombatState('ended');
    if (combatResult === 'victory') {
      const xp = combat?.xp_reward || calculateXPReward(combat?.enemies || []);
      const gold = calculateGoldReward(combat?.enemies || [], combat?.gold_reward);
      setResult({ type: 'victory', xp, gold });
      playSFX('xp');
      addLog(`\n🏆 VITORIA! +${xp} XP, +${gold} ouro`);
      // Autosave on victory
      store.saveToSlot('auto');
    } else {
      setResult({ type: 'defeat' });
      addLog(`\n💀 DERROTA...`);
      // Check if Arslan fell
      const arslanFell = allies.some((a) => a.id === 'arslan' && a.hp <= 0);
      if (arslanFell) {
        setTimeout(() => store.setGamePhase('game_over'), 2000);
      }
    }
  }, [combat, addLog, allies, store]);

  const checkEnd = useCallback(() => {
    setTimeout(() => {
      setEnemies((curEnemies) => {
        setAllies((curAllies) => {
          const end = checkCombatEnd(curAllies, curEnemies);
          if (end === 'victory' && combat?.wave_system) {
            const nextIdx = waveNumberRef.current + 1;
            if (nextIdx < (combat.waves?.length || 0)) {
              setTimeout(() => advanceWave(nextIdx), 150);
            } else {
              finishCombat('victory');
            }
          } else if (end) {
            finishCombat(end);
          } else {
            checkMidCombatEvents(curEnemies, roundNumber);
          }
          return curAllies;
        });
        return curEnemies;
      });
    }, 100);
  }, [finishCombat, checkMidCombatEvents, roundNumber, combat, advanceWave]);

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
      flashDamage(target.id);
      playSFX('attack');
      if (newHP <= 0) playSFX('death');
      addLog(`${currentAlly.name} ataca ${target.name}! (d20: ${attack.roll}+${attack.attackMod}=${attack.total} vs CA ${target.ca}) ${attack.isCrit ? '💥 CRITICO! ' : ''}Dano: ${dmg.total}`);
      if (newHP <= 0) addLog(`  ☠ ${target.name} foi derrotado!`);
      if (combat?.win_condition === 'land_N_hits') {
        const newCount = hitCount + 1;
        setHitCount(newCount);
        if (newCount >= (combat.win_condition_hits || Infinity)) {
          setTimeout(() => finishCombat('victory'), 300);
          return;
        }
      }
    } else {
      addLog(`${currentAlly.name} ataca ${target.name}... e erra! (d20: ${attack.roll}+${attack.attackMod}=${attack.total} vs CA ${target.ca})${attack.isFumble ? ' ❌ FALHA CRITICA!' : ''}`);
    }
    setCurrentPA((pa) => pa - 2);
    checkEnd();
  }, [currentPA, currentAlly, livingEnemies, selectedTargetIndex, addLog, checkEnd, combat, hitCount, finishCombat]);

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
      flashDamage(target.id);
      playSFX('attack');
      if (newHP <= 0) playSFX('death');
      addLog(`${currentAlly.name} faz ataque rapido em ${target.name}! (${attack.total} vs CA ${target.ca}) Dano: ${reduced}`);
      if (newHP <= 0) addLog(`  ☠ ${target.name} foi derrotado!`);
      if (combat?.win_condition === 'land_N_hits') {
        const newCount = hitCount + 1;
        setHitCount(newCount);
        if (newCount >= (combat.win_condition_hits || Infinity)) {
          setTimeout(() => finishCombat('victory'), 300);
          return;
        }
      }
    } else {
      addLog(`${currentAlly.name} erra o ataque rapido em ${target.name}! (${attack.total} vs CA ${target.ca})`);
    }
    setCurrentPA((pa) => pa - 1);
    checkEnd();
  }, [currentPA, currentAlly, livingEnemies, selectedTargetIndex, addLog, checkEnd, combat, hitCount, finishCombat]);

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
      playSFX('heal');
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

  // --- ACTION: Execute Skill ---
  const executeSkill = useCallback((skill, target) => {
    if (!currentAlly) return;
    const res = resolveSkill(skill, currentAlly, target, allies, enemies);
    res.logs.forEach((msg) => addLog(msg));

    setAllies((prev) => prev.map((a) => {
      let upd = a;
      if (res.allyUpdates[a.id]) upd = { ...upd, ...res.allyUpdates[a.id] };
      if (a.id === currentAlly.id) {
        const cd = { ...(upd.skillCooldowns || {}), ...res.cooldownSet };
        const uses = { ...(upd.skillUsesThisCombat || {}) };
        if (res.useConsumed) uses[res.useConsumed] = (uses[res.useConsumed] || 0) + 1;
        upd = { ...upd, skillCooldowns: cd, skillUsesThisCombat: uses };
      }
      return upd;
    }));

    if (Object.keys(res.enemyUpdates).length > 0) {
      setEnemies((prev) => prev.map((e) => {
        const upd = res.enemyUpdates[e.id];
        return upd ? { ...e, ...upd } : e;
      }));
    }

    setCurrentPA((pa) => pa - res.paSpent);

    if (res.flags?.remove_surprise_penalty) {
      setAllies((prev) => prev.map((a) => ({
        ...a,
        status_effects: (a.status_effects || []).filter((ef) => ef.name !== 'surprised'),
      })));
    }
    if (res.flags?.force_allies_first) {
      setSkipEnemyRound(true);
    }

    setShowSkillMenu(false);
    setTargetingSkill(null);
    checkEnd();
  }, [currentAlly, allies, enemies, addLog, checkEnd]);

  const handleSkillSelect = useCallback((skill) => {
    if (needsTargetSelection(skill)) {
      setTargetingSkill(skill);
      setShowSkillMenu(false);
    } else {
      executeSkill(skill, null);
    }
  }, [executeSkill]);

  const cancelTargeting = useCallback(() => setTargetingSkill(null), []);

  // --- ENEMY TURN ---
  const runEnemyTurn = useCallback(() => {
    addLog(`═══ Turno dos Inimigos (Rodada ${roundNumber}) ═══`);

    // Ambush: skip enemy first round entirely
    if (combat?.combat_modifiers?.ambush_first_turn && roundNumber === 1) {
      addLog('⚡ EMBOSCADA! Inimigos surpresos — pulam o primeiro turno!');
      setRoundNumber((r) => { const n = r + 1; roundNumberRef.current = n; return n; });
      setTimeout(() => {
        setAllies((cur) => {
          let first = 0;
          while (first < cur.length && cur[first].hp <= 0) first++;
          if (first < cur.length) {
            setActiveAllyIndex(first);
            setCurrentPA(cur[first].pa_max || cur[first].pa || 3);
            addLog('═══ Seu Turno ═══');
            addLog(`--- Turno de ${cur[first].name} ---`);
          }
          return cur;
        });
      }, 400);
      return;
    }

    // Emboscada Perfeita (Narsus skill): skip enemy turn once
    if (skipEnemyRound) {
      addLog('⚔ Emboscada de Narsus — inimigos pulam este turno!');
      setSkipEnemyRound(false);
      setRoundNumber((r) => { const n = r + 1; roundNumberRef.current = n; return n; });
      setTimeout(() => {
        setAllies((cur) => {
          let first = 0;
          while (first < cur.length && cur[first].hp <= 0) first++;
          if (first < cur.length) {
            setActiveAllyIndex(first);
            setCurrentPA(cur[first].pa_max || cur[first].pa || 3);
            addLog('═══ Seu Turno ═══');
            addLog(`--- Turno de ${cur[first].name} ---`);
          }
          return cur;
        });
      }, 400);
      return;
    }

    // Wave-on-turn: add reinforcements
    const wot = combat?.wave_on_turn;
    if (wot && roundNumber === wot.turn) {
      addLog(`\n🔔 ${wot.text}`);
      const wotEnemies = (wot.enemies || []).map((e, i) => ({
        ...e, id: `wot_${e.name.replace(/\s/g, '_').toLowerCase()}_${i}`,
        hp_max: e.hp, pa_max: e.pa || 2, status_effects: [],
      }));
      setEnemies((prev) => [...prev, ...wotEnemies]);
    }

    setEnemies((curEnemies) => {
      let processedEnemies = curEnemies.map((enemy) => {
        if (enemy.hp <= 0) return enemy;
        const { updatedCombatant, logs } = processStatusEffects(enemy);
        logs.forEach((msg) => addLog(msg));
        return updatedCombatant;
      });

      setAllies((curAllies) => {
        const updated = curAllies.map((a) => ({ ...a }));
        const livingAlls = updated.filter((a) => a.hp > 0);

        // Guardian check
        const daryun = updated.find((a) => a.id === 'daryun' && a.hp > 0);
        const hasGuardian = daryun && getSkillsForCombatant(daryun).some((s) => s.id === 'guardia_do_principe');
        let guardianUsed = false;

        processedEnemies.filter((e) => e.hp > 0).forEach((enemy) => {
          const actions = processEnemyTurn(enemy, livingAlls);
          actions.forEach((action) => {
            const idx = updated.findIndex((a) => a.id === action.target.id);
            if (idx === -1) return;

            if (action.anticipated) {
              addLog(`${enemy.name} tenta atacar ${action.target.name}... movimento antecipado!`);
              return;
            }

            if (action.attack.hits) {
              // Guardian intercept
              if (action.target.id === 'arslan' && hasGuardian && !guardianUsed) {
                const dIdx = updated.findIndex((a) => a.id === 'daryun');
                if (dIdx !== -1 && updated[dIdx].hp > 0) {
                  const newHP = Math.max(0, updated[dIdx].hp - action.damage);
                  updated[dIdx] = { ...updated[dIdx], hp: newHP };
                  addLog(`🛡 Daryun intercepta o ataque contra Arslan! Dano: ${action.damage}`);
                  if (newHP <= 0) addLog(`  ⚠ Daryun caiu protegendo o principe!`);
                  guardianUsed = true;
                  return;
                }
              }

              const newHP = Math.max(0, updated[idx].hp - action.damage);
              updated[idx] = { ...updated[idx], hp: newHP };
              flashDamage(updated[idx].id);
              playSFX('hit');
              addLog(`${enemy.name} ataca ${updated[idx].name}! (d20: ${action.attack.roll}) ${action.attack.isCrit ? '💥 CRITICO! ' : ''}Dano: ${action.damage}`);
              if (newHP <= 0) addLog(`  ⚠ ${updated[idx].name} caiu!`);

              if (action.appliedEffect) {
                const fx = { ...action.appliedEffect, duration: action.appliedEffect.duration || 2 };
                updated[idx] = {
                  ...updated[idx],
                  status_effects: [...(updated[idx].status_effects || []).filter((e) => e.name !== fx.name), fx],
                };
                addLog(`  ${fx.label || fx.name} aplicado em ${updated[idx].name}!`);
              }
            } else {
              addLog(`${enemy.name} ataca ${updated[idx].name}... e erra! (d20: ${action.attack.roll})`);
            }
          });
        });

        const end = checkCombatEnd(updated, processedEnemies);
        if (end) {
          setTimeout(() => finishCombat(end), 300);
          return updated;
        }

        setRoundNumber((r) => { const n = r + 1; roundNumberRef.current = n; return n; });
        setTimeout(() => {
          // survive_turns win condition
          if (combat?.win_condition === 'survive_turns' && roundNumberRef.current > (combat?.survive_turns || Infinity)) {
            finishCombat('victory');
            return;
          }
          let first = 0;
          while (first < updated.length && updated[first].hp <= 0) first++;
          if (first < updated.length) {
            const { updatedCombatant, logs: seLogs } = processStatusEffects(updated[first]);
            seLogs.forEach((msg) => addLog(msg));
            const newCooldowns = tickCooldowns(updatedCombatant.skillCooldowns || {});
            const slowPen = getSlowedPenalty(updatedCombatant);
            const bonus = updatedCombatant.bonusPA || 0;
            const startPA = Math.max(0, (updatedCombatant.pa_max || updatedCombatant.pa || 3) - slowPen + bonus);

            setAllies((prev) => prev.map((a) =>
              a.id === updatedCombatant.id ? { ...updatedCombatant, skillCooldowns: newCooldowns, bonusPA: 0 } : a
            ));
            setActiveAllyIndex(first);
            setCurrentPA(startPA);
            addLog('═══ Seu Turno ═══');
            addLog(`--- Turno de ${updatedCombatant.name} ---`);
            if (slowPen > 0) addLog(`  🐌 PA reduzido por lentificacao.`);
            if (bonus > 0) addLog(`  📖 PA bonus: +${bonus}`);
          }
        }, 500);

        return updated;
      });

      return processedEnemies.map((e) => ({
        ...e,
        status_effects: (e.status_effects || []).filter((fx) => fx.name !== 'movement_anticipated'),
      }));
    });
  }, [addLog, finishCombat, roundNumber, combat]);

  // --- END ALLY TURN ---
  const handleEndAllyTurn = useCallback(() => {
    if (currentAlly?._defending) {
      setAllies((prev) => prev.map((a) =>
        a.id === currentAlly.id ? { ...a, ca: a.ca - 2, _defending: false } : a
      ));
    }
    setShowSkillMenu(false);
    setShowItemMenu(false);
    setTargetingSkill(null);

    let nextIdx = activeAllyIndex + 1;
    while (nextIdx < allies.length && allies[nextIdx].hp <= 0) nextIdx++;

    if (nextIdx < allies.length) {
      const nextAlly = allies[nextIdx];
      const { updatedCombatant, logs } = processStatusEffects(nextAlly);
      logs.forEach((msg) => addLog(msg));
      const newCooldowns = tickCooldowns(updatedCombatant.skillCooldowns || {});
      const slowPen = getSlowedPenalty(updatedCombatant);
      const bonus = updatedCombatant.bonusPA || 0;
      const startPA = Math.max(0, (updatedCombatant.pa_max || updatedCombatant.pa || 3) - slowPen + bonus);

      setAllies((prev) => prev.map((a) =>
        a.id !== nextAlly.id ? a : { ...updatedCombatant, skillCooldowns: newCooldowns, bonusPA: 0 }
      ));
      setActiveAllyIndex(nextIdx);
      setCurrentPA(startPA);
      addLog(`--- Turno de ${updatedCombatant.name} ---`);
      if (slowPen > 0) addLog(`  🐌 PA reduzido por lentificacao.`);
      if (bonus > 0) addLog(`  📖 PA bonus: +${bonus}`);
    } else {
      runEnemyTurn();
    }
  }, [currentAlly, activeAllyIndex, allies, addLog, runEnemyTurn]);

  // --- EXIT COMBAT ---
  const handleExitCombat = useCallback(() => {
    if (result?.type === 'victory') {
      store.addXP(result.xp);
      store.addGold(result.gold);
      const arslan = allies.find((a) => a.id === 'arslan');
      if (arslan) {
        const delta = arslan.hp - player.hp;
        if (delta !== 0) store.updatePlayerHP(delta);
      }
      allies.filter((a) => a.isAlly).forEach((ally) => {
        const gen = (recruitedGenerals || []).find((g) => g.id === ally.id);
        if (gen) {
          const hpDelta = ally.hp - (gen.current_hp ?? gen.hp);
          if (hpDelta !== 0) store.updateGeneralHP(ally.id, hpDelta);
        }
      });
    } else {
      // Defeat: check for loss_scene override
      if (combat?.loss_scene) {
        store.setCurrentScene(combat.loss_scene);
      }
    }
    store.endCombat();
  }, [result, store, allies, player, recruitedGenerals, combat]);

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
          {allies.map((ally, idx) => {
            const isTargetable = targetingSkill?.target_type === 'single_ally' && ally.hp > 0;
            return (
              <div
                key={ally.id}
                className={[
                  styles.combatantCard,
                  ally.hp <= 0 ? styles.defeated : '',
                  idx === activeAllyIndex && combatState === 'player_turn' ? styles.activeTurn : '',
                  isTargetable ? styles.validTarget : '',
                  damagedIds.has(ally.id) ? styles.damagedCard : '',
                ].filter(Boolean).join(' ')}
                onClick={() => { if (isTargetable) executeSkill(targetingSkill, ally); }}
                style={{ cursor: isTargetable ? 'pointer' : 'default' }}
              >
                <h3 className={styles.combatantName}>
                  {ally.name}
                  {ally.isPlayer && ' ★'}
                  {idx === activeAllyIndex && combatState === 'player_turn' && ' ◄'}
                </h3>
                {ally.title && <span className={styles.combatantTitle}>{ally.title}</span>}
                <ProgressBar current={Math.max(0, ally.hp)} max={ally.hp_max} color="var(--hp-green)" label="HP" />
                {(ally.status_effects || []).length > 0 && (
                  <div className={styles.statusBadges}>
                    {ally.status_effects.map((fx, i) => (
                      <span key={i} className={styles.statusBadge} title={fx.label || fx.name}>
                        {STATUS_ICONS[fx.name] || '●'}
                      </span>
                    ))}
                  </div>
                )}
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
            );
          })}
        </div>

        <div className={styles.vs}>VS</div>

        {/* Enemies */}
        <div className={styles.side}>
          <h4 className={styles.sideLabel}>Inimigos</h4>
          {enemies.map((enemy) => {
            const liveIdx = livingEnemies.indexOf(enemy);
            const isTargetable = targetingSkill?.target_type === 'single_enemy' && enemy.hp > 0;
            return (
              <div
                key={enemy.id}
                className={[
                  styles.combatantCard,
                  enemy.hp <= 0 ? styles.defeated : '',
                  !targetingSkill && liveIdx === selectedTargetIndex && enemy.hp > 0 ? styles.targeted : '',
                  isTargetable ? styles.validTarget : '',
                  damagedIds.has(enemy.id) ? styles.damagedCard : '',
                ].filter(Boolean).join(' ')}
                onClick={() => {
                  if (isTargetable) {
                    executeSkill(targetingSkill, enemy);
                  } else if (enemy.hp > 0 && liveIdx >= 0 && !targetingSkill) {
                    setSelectedTargetIndex(liveIdx);
                  }
                }}
                style={{ cursor: enemy.hp > 0 ? 'pointer' : 'default' }}
              >
                <h3 className={styles.combatantName}>
                  {enemy.name}
                  {!targetingSkill && liveIdx === selectedTargetIndex && enemy.hp > 0 && ' ◄ Alvo'}
                </h3>
                <ProgressBar current={Math.max(0, enemy.hp)} max={enemy.hp_max} color="var(--hp-red)" label="HP" />
                {(enemy.status_effects || []).length > 0 && (
                  <div className={styles.statusBadges}>
                    {enemy.status_effects.map((fx, i) => (
                      <span key={i} className={`${styles.statusBadge} ${styles.statusBadgeEnemy}`} title={fx.label || fx.name}>
                        {STATUS_ICONS[fx.name] || '●'}
                      </span>
                    ))}
                  </div>
                )}
                {enemy.hp <= 0 && <span className={styles.defeatedLabel}>Derrotado</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ----- Wave / Mode Indicators ----- */}
      {combat?.wave_system && !waveTransition && (
        <div className={styles.waveBanner}>
          Onda {waveNumber + 1} de {combat.waves?.length}
        </div>
      )}
      {waveTransition && (
        <div className={styles.waveTransition}>
          <p>{waveTransition}</p>
        </div>
      )}
      {combat?.win_condition === 'survive_turns' && (
        <div className={styles.surviveCounter}>
          ⏳ Aguente: Rodada {roundNumber} / {combat.survive_turns}
          {combat.progress_display && (
            <span className={styles.surviveHint}>
              {combat.progress_display.replace('Turno X', `Turno ${roundNumber}`)}
            </span>
          )}
        </div>
      )}
      {combat?.win_condition === 'land_N_hits' && (
        <div className={styles.hitCounter}>
          ⚔ Acertos: {hitCount} / {combat.win_condition_hits}
          {combat.win_condition_text && <span className={styles.surviveHint}>{combat.win_condition_text}</span>}
        </div>
      )}
      {combat?.party_locked && (
        <div className={styles.partyLocked}>
          ⚔ Duelo Singular — Apenas Arslan combate
        </div>
      )}
      {combat?.civilians_present && (
        <div className={styles.civiliansWarning}>
          ⚠ {combat.civilians?.count || 0} civis no campo de batalha — Cuidado com ataques em area
        </div>
      )}

      {/* ----- Mid-Combat Dramatic Event ----- */}
      {midCombatEvent && (
        <div className={styles.midCombatEvent}>
          <div className={styles.midCombatEventText}>
            <p>{midCombatEvent.text}</p>
            {midCombatEvent.text_2 && <p>{midCombatEvent.text_2}</p>}
          </div>
          {midCombatEvent.choices && midCombatEvent.choices.length > 0 ? (
            <div className={styles.midCombatChoices}>
              {midCombatEvent.choices.map((ch) => (
                <Button
                  key={ch.id}
                  variant={ch.condition ? 'gold' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    if (ch.character_score) store.updateCharacterScore(ch.character_score);
                    setMidCombatEvent(null);
                  }}
                >
                  {ch.text}
                </Button>
              ))}
            </div>
          ) : (
            <Button variant="gold" size="sm" onClick={() => setMidCombatEvent(null)}>
              Continuar
            </Button>
          )}
        </div>
      )}

      {/* ----- Targeting Prompt ----- */}
      {targetingSkill && !midCombatEvent && (
        <div className={styles.targetingPrompt}>
          <span>🎯 Escolha um alvo para <strong>{targetingSkill.name}</strong></span>
          <Button variant="secondary" size="sm" onClick={cancelTargeting}>Cancelar</Button>
        </div>
      )}

      {/* ----- Actions ----- */}
      {combatState === 'player_turn' && currentAlly && currentAlly.hp > 0 && !targetingSkill && !midCombatEvent && (
        <div className={styles.actions}>
          <Button variant="primary" size="md" onClick={handleAttack} disabled={currentPA < 2}>
            ⚔ Atacar (2 PA)
          </Button>
          <Button variant="secondary" size="md" onClick={handleLightAttack} disabled={currentPA < 1}>
            🗡 Rapido (1 PA)
          </Button>
          <Button variant="secondary" size="md" onClick={handleDefend} disabled={currentPA < 1}>
            🛡 Defender (1 PA)
          </Button>
          {currentAllySkills.length > 0 && (
            <Button variant="secondary" size="md" onClick={() => { setShowSkillMenu(!showSkillMenu); setShowItemMenu(false); }} disabled={currentPA < 1}>
              ✦ Habilidade
            </Button>
          )}
          {consumables.length > 0 && (
            <Button variant="secondary" size="md" onClick={() => { setShowItemMenu(!showItemMenu); setShowSkillMenu(false); }} disabled={currentPA < 1}>
              🧪 Item (1 PA)
            </Button>
          )}
          <Button variant="gold" size="md" onClick={handleEndAllyTurn}>
            ➡ Encerrar
          </Button>
        </div>
      )}

      {/* ----- Skill Menu ----- */}
      {showSkillMenu && combatState === 'player_turn' && currentAlly && !midCombatEvent && (
        <div className={styles.skillMenu}>
          <h4>Habilidades de {currentAlly.name}</h4>
          {currentAllySkills.map((skill) => {
            const check = canUseSkill(skill, currentAlly, currentPA, currentAlly.skillCooldowns, currentAlly.skillUsesThisCombat);
            return (
              <button
                key={skill.id}
                className={[styles.skillItem, skill.legendary ? styles.legendarySkill : '', !check.canUse ? styles.skillDisabled : ''].filter(Boolean).join(' ')}
                onClick={() => check.canUse && handleSkillSelect(skill)}
                disabled={!check.canUse}
              >
                <span className={styles.skillName}>{skill.legendary ? '⭐ ' : '✦ '}{skill.name} ({skill.pa_cost} PA)</span>
                <span className={styles.skillDesc}>{skill.description}</span>
                {!check.canUse && <span className={styles.skillCooldown}>{check.reason}</span>}
              </button>
            );
          })}
          <Button variant="secondary" size="sm" onClick={() => setShowSkillMenu(false)}>Voltar</Button>
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
        <h4 className={styles.logTitle}>Log de Combate — Rodada {roundNumber}</h4>
        <div className={styles.logContent} ref={logRef}>
          {log.map((entry, idx) => (
            <p key={idx} className={styles.logEntry}>{entry}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
