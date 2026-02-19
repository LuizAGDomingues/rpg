import { rollDice, rollD20, parseWeaponDice, rollWeaponDamage } from './diceEngine';
import { getModifierValue } from '../utils/formatters';

export const rollInitiative = (combatants) => {
  return combatants
    .map((c) => ({ ...c, initiative: rollD20() + getModifierValue(c.attributes.DES) }))
    .sort((a, b) => b.initiative - a.initiative);
};

export const rollAttack = (attacker, target) => {
  const roll = rollD20();
  const isCrit = roll === 20;
  const isFumble = roll === 1;
  const attackMod = getModifierValue(attacker.attributes.FOR);
  const bonus = attacker.weapon?.bonus_atk || 0;
  const total = roll + attackMod + bonus;
  const hits = isCrit || (!isFumble && total >= target.ca);
  return { roll, total, hits, isCrit, isFumble, attackMod };
};

export const rollDamage = (attacker, isCrit = false) => {
  const damageStr = attacker.weapon?.damage || '1d6';
  const forMod = getModifierValue(attacker.attributes.FOR);
  const { quantity, sides, bonus } = parseWeaponDice(damageStr);
  const { total, rolls } = rollDice(sides, isCrit ? quantity * 2 : quantity);
  return { total: Math.max(1, total + forMod + bonus), rolls, formula: damageStr };
};

export const processEnemyTurn = (enemy, allies) => {
  const actions = [];
  let pa = enemy.pa || 2;

  while (pa >= 2) {
    const livingAllies = allies.filter((a) => a.hp > 0 || a.current_hp > 0);
    if (livingAllies.length === 0) break;

    const target = livingAllies[Math.floor(Math.random() * livingAllies.length)];
    const attack = rollAttack(enemy, target);
    let damage = 0;
    if (attack.hits) {
      const dmgResult = rollDamage(enemy, attack.isCrit);
      damage = dmgResult.total;
    }
    actions.push({ type: 'attack', attacker: enemy, target, attack, damage });
    pa -= 2;
  }

  return actions;
};

export const checkCombatEnd = (allies, enemies) => {
  const alliesAlive = allies.some((a) => (a.hp || a.current_hp) > 0);
  const enemiesAlive = enemies.some((e) => e.hp > 0);

  if (!enemiesAlive) return 'victory';
  if (!alliesAlive) return 'defeat';
  return null;
};

export const calculateXPReward = (enemies) => {
  return enemies.reduce((sum, e) => sum + (e.xp || 50), 0);
};

export const calculateGoldReward = (enemies) => {
  return enemies.reduce((sum, e) => {
    if (!e.gold_drop) return sum;
    const { quantity, sides, bonus } = parseWeaponDice(e.gold_drop);
    return sum + rollDice(sides, quantity).total + bonus;
  }, 0);
};
