import { useState, useCallback, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';
import { rollInitiative, rollAttack, rollDamage, processEnemyTurn, checkCombatEnd, calculateXPReward, calculateGoldReward } from '../../engine/combatEngine';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { OrnamentDivider } from '../ui/Ornament';
import styles from './CombatScreen.module.css';

export default function CombatScreen() {
  const combat = useGameStore((s) => s.combat);
  const player = useGameStore((s) => s.player);
  const store = useGameStore();

  const [turnOrder, setTurnOrder] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [enemies, setEnemies] = useState([]);
  const [playerHP, setPlayerHP] = useState(player.hp);
  const [playerPA, setPlayerPA] = useState(player.pa);
  const [log, setLog] = useState([]);
  const [combatState, setCombatState] = useState('init');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (combat && combatState === 'init') {
      const playerCombatant = {
        id: 'arslan', name: 'Arslan', isPlayer: true,
        attributes: player.attributes, hp: player.hp, hp_max: player.hp_max,
        ca: player.ca, pa: player.pa,
        weapon: { name: 'Espada', damage: '1d8+1', bonus_atk: 1 },
      };

      const enemyCombatants = combat.enemies.map((e, i) => ({
        ...e, id: `${e.id}_${i}`, isPlayer: false, hp_max: e.hp,
      }));

      const all = rollInitiative([playerCombatant, ...enemyCombatants]);
      setTurnOrder(all);
      setEnemies(enemyCombatants);
      setPlayerHP(player.hp);
      setPlayerPA(player.pa);
      addLog(`Combate iniciado: ${combat.name}!`);
      setCombatState('playing');
    }
  }, [combat, combatState, player]);

  const addLog = useCallback((msg) => {
    setLog((prev) => [...prev.slice(-20), msg]);
  }, []);

  const getCurrentCombatant = () => turnOrder[currentTurnIndex];

  const advanceTurn = useCallback(() => {
    setCurrentTurnIndex((prev) => {
      const next = (prev + 1) % turnOrder.length;
      return next;
    });
  }, [turnOrder]);

  const handlePlayerAttack = useCallback(() => {
    if (playerPA < 2) { addLog('PA insuficiente!'); return; }
    const livingEnemies = enemies.filter((e) => e.hp > 0);
    if (livingEnemies.length === 0) return;

    const target = livingEnemies[0];
    const current = getCurrentCombatant();
    const attack = rollAttack({ ...current, attributes: player.attributes, weapon: current.weapon }, target);

    if (attack.hits) {
      const dmg = rollDamage({ attributes: player.attributes, weapon: current.weapon }, attack.isCrit);
      target.hp = Math.max(0, target.hp - dmg.total);
      setEnemies([...enemies]);
      addLog(`Arslan ataca ${target.name}! (${attack.roll}+${attack.attackMod}=${attack.total} vs CA ${target.ca}) ${attack.isCrit ? 'CRITICO! ' : ''}Dano: ${dmg.total}`);
    } else {
      addLog(`Arslan ataca ${target.name}... e erra! (${attack.roll}+${attack.attackMod}=${attack.total} vs CA ${target.ca})${attack.isFumble ? ' FALHA CRITICA!' : ''}`);
    }

    setPlayerPA((pa) => pa - 2);

    const end = checkCombatEnd([{ hp: playerHP }], enemies);
    if (end) { endCombat(end); return; }
  }, [enemies, playerPA, player, turnOrder, currentTurnIndex, playerHP]);

  const handlePlayerDefend = useCallback(() => {
    if (playerPA < 1) { addLog('PA insuficiente!'); return; }
    addLog('Arslan assume postura defensiva. (+2 CA ate proximo turno)');
    setPlayerPA((pa) => pa - 1);
  }, [playerPA]);

  const handleEndPlayerTurn = useCallback(() => {
    setPlayerPA(player.pa);
    addLog('--- Turno do inimigo ---');

    const livingEnemies = enemies.filter((e) => e.hp > 0);
    livingEnemies.forEach((enemy) => {
      const actions = processEnemyTurn(enemy, [{ hp: playerHP, ca: player.ca, current_hp: playerHP }]);
      actions.forEach((action) => {
        if (action.attack.hits) {
          setPlayerHP((hp) => {
            const newHP = Math.max(0, hp - action.damage);
            addLog(`${enemy.name} ataca Arslan! (${action.attack.roll}) ${action.attack.isCrit ? 'CRITICO! ' : ''}Dano: ${action.damage}`);
            return newHP;
          });
        } else {
          addLog(`${enemy.name} ataca Arslan... e erra! (${action.attack.roll})`);
        }
      });
    });

    setTimeout(() => {
      const end = checkCombatEnd([{ hp: playerHP }], enemies);
      if (end) { endCombat(end); return; }
      addLog('--- Seu turno ---');
      setPlayerPA(player.pa);
    }, 500);
  }, [enemies, playerHP, player]);

  const endCombat = useCallback((result) => {
    setCombatState('ended');
    if (result === 'victory') {
      const xp = combat.xp_reward || calculateXPReward(combat.enemies);
      const gold = calculateGoldReward(combat.enemies);
      setResult({ type: 'victory', xp, gold });
      addLog(`VITORIA! +${xp} XP, +${gold} ouro`);
    } else {
      setResult({ type: 'defeat' });
      addLog('DERROTA...');
    }
  }, [combat]);

  const handleExitCombat = useCallback(() => {
    if (result?.type === 'victory') {
      store.addXP(result.xp);
      store.addGold(result.gold);
      store.updatePlayerHP(playerHP - player.hp);
    }
    store.endCombat();
  }, [result, store, playerHP, player]);

  if (!combat) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{combat.name}</h2>
      <OrnamentDivider />

      <div className={styles.battlefield}>
        <div className={styles.side}>
          <div className={styles.combatantCard}>
            <h3 className={styles.combatantName}>Arslan</h3>
            <ProgressBar current={playerHP} max={player.hp_max} color="var(--hp-green)" label="HP" />
            <div className={styles.paBar}>
              {Array.from({ length: player.pa }).map((_, i) => (
                <span key={i} className={`${styles.paDot} ${i < playerPA ? styles.paActive : ''}`} />
              ))}
              <span className={styles.paLabel}>PA</span>
            </div>
          </div>
        </div>

        <div className={styles.vs}>VS</div>

        <div className={styles.side}>
          {enemies.map((enemy) => (
            <div key={enemy.id} className={`${styles.combatantCard} ${enemy.hp <= 0 ? styles.defeated : ''}`}>
              <h3 className={styles.combatantName}>{enemy.name}</h3>
              <ProgressBar current={Math.max(0, enemy.hp)} max={enemy.hp_max} color="var(--hp-red)" label="HP" />
              {enemy.hp <= 0 && <span className={styles.defeatedLabel}>Derrotado</span>}
            </div>
          ))}
        </div>
      </div>

      {combatState === 'playing' && (
        <div className={styles.actions}>
          <Button variant="primary" size="md" onClick={handlePlayerAttack} disabled={playerPA < 2}>
            Atacar (2 PA)
          </Button>
          <Button variant="secondary" size="md" onClick={handlePlayerDefend} disabled={playerPA < 1}>
            Defender (1 PA)
          </Button>
          <Button variant="gold" size="md" onClick={handleEndPlayerTurn}>
            Encerrar Turno
          </Button>
        </div>
      )}

      {combatState === 'ended' && (
        <div className={styles.resultPanel}>
          <h3 className={result?.type === 'victory' ? styles.victoryText : styles.defeatText}>
            {result?.type === 'victory' ? 'Vitoria!' : 'Derrota...'}
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

      <div className={styles.logPanel}>
        <h4 className={styles.logTitle}>Log de Combate</h4>
        <div className={styles.logContent}>
          {log.map((entry, i) => (
            <p key={i} className={styles.logEntry}>{entry}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
