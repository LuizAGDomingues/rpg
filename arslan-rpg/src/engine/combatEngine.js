import { rollD20, rollWeaponDamage, rollD6 } from './diceEngine';
import { getModifierValue } from '../utils/formatters';

export const rollInitiative = (combatants) => {
  return combatants.map((c) => ({
    ...c,
    initiative: rollD20() + getModifierValue(c.attributes?.DES || 10),
  })).sort((a, b) => b.initiative - a.initiative);
};

export const rollAttack = (attacker, target) => {
  let roll = rollD20();
  const forMod = getModifierValue(attacker.attributes?.FOR || 10);
  const weaponBonus = attacker.weapon?.bonus_atk || 0;
  let attackMod = forMod + weaponBonus;

  // Intimidated penalty: -2 to attack rolls
  if (hasStatusEffect(attacker, 'intimidated')) {
    attackMod -= 2;
  }

  // Morale bonus: +1 to attack rolls
  const moraleEffect = (attacker.status_effects || []).find((e) => e.name === 'morale');
  if (moraleEffect) {
    attackMod += moraleEffect.bonus || 1;
  }

  // Attack buff (from skills like Grito de Guerra)
  const attackBuff = (attacker.status_effects || []).find((e) => e.name === 'attack_buff' || e.name === 'strategy_buff');
  if (attackBuff) {
    attackMod += attackBuff.attack_bonus || 0;
  }

  const total = roll + attackMod;
  const isCrit = roll === 20;
  const isFumble = roll === 1;

  // Stunned targets have -2 CA, derrubado targets have -2 CA
  let targetCA = target.ca;
  if (hasStatusEffect(target, 'stunned')) targetCA -= 2;
  if (hasStatusEffect(target, 'derrubado')) targetCA -= 2;

  // Marked targets: attacker gets advantage (roll 2d20, use higher)
  if (hasStatusEffect(target, 'marked')) {
    const roll2 = rollD20();
    if (roll2 > roll) {
      roll = roll2;
      const newTotal = roll + attackMod;
      const hits = roll === 20 || (roll !== 1 && newTotal >= targetCA);
      return { roll, attackMod, total: newTotal, hits, isCrit: roll === 20, isFumble: false, advantage: true };
    }
  }

  const hits = isCrit || (!isFumble && total >= targetCA);
  return { roll, attackMod, total, hits, isCrit, isFumble };
};

export const rollAttackWithAdvantage = (attacker, target) => {
  const r1 = rollD20();
  const r2 = rollD20();
  const roll = Math.max(r1, r2);
  const forMod = getModifierValue(attacker.attributes?.FOR || 10);
  const weaponBonus = attacker.weapon?.bonus_atk || 0;
  const attackMod = forMod + weaponBonus;
  const total = roll + attackMod;
  const targetCA = target.ca - (hasStatusEffect(target, 'stunned') ? 2 : 0) - (hasStatusEffect(target, 'derrubado') ? 2 : 0);
  const hits = roll === 20 || (roll !== 1 && total >= targetCA);
  return { roll, attackMod, total, hits, isCrit: roll === 20, isFumble: false, advantage: true, rolls: [r1, r2] };
};

export const rollDamage = (attacker, isCrit = false) => {
  const weaponDamage = attacker.weapon?.damage || '1d6';
  const forMod = getModifierValue(attacker.attributes?.FOR || 10);
  const result = rollWeaponDamage(weaponDamage, forMod);
  if (isCrit) {
    result.total = Math.max(1, result.total * 2);
  }
  return result;
};

/* ===== Status Effects System ===== */

export const hasStatusEffect = (combatant, effectName) => {
  return (combatant.status_effects || []).some((e) => e.name === effectName);
};

export const addStatusEffect = (combatant, effect) => {
  const existing = (combatant.status_effects || []).filter((e) => e.name !== effect.name);
  return { ...combatant, status_effects: [...existing, { ...effect }] };
};

export const removeStatusEffect = (combatant, effectName) => {
  return {
    ...combatant,
    status_effects: (combatant.status_effects || []).filter((e) => e.name !== effectName),
  };
};

/**
 * Process start-of-turn status effects for a combatant.
 * Returns { updatedCombatant, logs[] }
 */
export const processStatusEffects = (combatant) => {
  const logs = [];
  let updated = { ...combatant, status_effects: [...(combatant.status_effects || [])] };

  // Remove skill-based CA buffs that expired
  if (updated._skillDefending) {
    updated = { ...updated, ca: updated.ca - (updated._skillDefendCA || 0), _skillDefending: false, _skillDefendCA: 0 };
    logs.push(`  Postura defensiva de ${combatant.name} se dissipou.`);
  }

  updated.status_effects = updated.status_effects
    .map((effect) => {
      if (effect.name === 'bleed') {
        const bleedDmg = rollD6();
        updated = { ...updated, hp: Math.max(0, updated.hp - bleedDmg) };
        logs.push(`🩸 ${combatant.name} sofre ${bleedDmg} dano de sangramento.`);
      }
      if (effect.name === 'poison') {
        const poisonDmg = Math.max(1, Math.floor(rollD6() * 0.5));
        updated = { ...updated, hp: Math.max(0, updated.hp - poisonDmg) };
        logs.push(`☠ ${combatant.name} sofre ${poisonDmg} dano de veneno.`);
      }
      if (effect.name === 'stunned') {
        logs.push(`💫 ${combatant.name} esta atordoado e perde sua acao!`);
      }
      if (effect.name === 'derrubado') {
        logs.push(`⬇ ${combatant.name} esta derrubado! (-2 CA)`);
      }
      if (effect.name === 'intimidated') {
        logs.push(`😨 ${combatant.name} esta intimidado. (-2 em ataques)`);
      }
      if (effect.name === 'slowed') {
        logs.push(`🐌 ${combatant.name} esta lentificado. (-1 PA neste turno)`);
      }
      if (effect.name === 'marked') {
        logs.push(`🎯 ${combatant.name} esta marcado. Ataques contra ele tem vantagem.`);
      }
      if (effect.name === 'morale') {
        logs.push(`💪 ${combatant.name} tem moral elevada. (+${effect.bonus || 1} em rolagens)`);
      }

      // Decrement duration
      const remaining = (effect.duration || 1) - 1;
      if (remaining <= 0) {
        logs.push(`  ✓ ${effect.label || effect.name} se dissipou de ${combatant.name}.`);
        return null;
      }
      return { ...effect, duration: remaining };
    })
    .filter(Boolean);

  return { updatedCombatant: updated, logs };
};

/**
 * Get PA reduction from slowed status effect.
 */
export const getSlowedPenalty = (combatant) => {
  return hasStatusEffect(combatant, 'slowed') ? 1 : 0;
};

/* ===== Enemy AI ===== */

export const processEnemyTurn = (enemy, targets) => {
  const actions = [];
  const livingTargets = targets.filter((t) => t.hp > 0);
  if (livingTargets.length === 0) return actions;

  // Check if enemy is stunned — skip turn
  if (hasStatusEffect(enemy, 'stunned')) return actions;
  // Check if enemy is derrubado — loses first action
  if (hasStatusEffect(enemy, 'derrubado')) return actions;

  // Check if movement was anticipated — first attack auto-misses
  if (hasStatusEffect(enemy, 'movement_anticipated')) {
    actions.push({
      target: livingTargets[0],
      attack: { roll: 0, attackMod: 0, total: 0, hits: false, isCrit: false, isFumble: false },
      damage: 0,
      appliedEffect: null,
      anticipated: true,
    });
    return actions;
  }

  let remainingPA = enemy.pa || 2;
  // Slowed enemies lose 1 PA
  if (hasStatusEffect(enemy, 'slowed')) {
    remainingPA = Math.max(0, remainingPA - 1);
  }

  while (remainingPA >= 2 && livingTargets.length > 0) {
    // AI targeting: 40% chance to target the player (Arslan), otherwise random
    let target;
    const arslan = livingTargets.find((t) => t.id === 'arslan');
    if (arslan && Math.random() < 0.4) {
      target = arslan;
    } else {
      target = livingTargets[Math.floor(Math.random() * livingTargets.length)];
    }

    const attack = rollAttack(enemy, target);
    let damage = 0;
    let appliedEffect = null;

    if (attack.hits) {
      const dmg = rollDamage(enemy, attack.isCrit);
      damage = dmg.total;

      // Status effect application from enemy special weapons/abilities
      if (enemy.on_hit_effect && Math.random() < (enemy.on_hit_chance || 0.25)) {
        appliedEffect = { ...enemy.on_hit_effect };
      }
    }
    actions.push({ target, attack, damage, appliedEffect });
    remainingPA -= 2;
  }
  return actions;
};

/* ===== Combat End Check ===== */

export const checkCombatEnd = (allies, enemies) => {
  const alliesAlive = allies.some((a) => a.hp > 0 && (a.isPlayer || a.id === 'arslan'));
  const enemiesAlive = enemies.some((e) => e.hp > 0);
  if (!enemiesAlive) return 'victory';
  if (!alliesAlive) return 'defeat';
  return null;
};

/* ===== Rewards ===== */

export const calculateXPReward = (enemies) => {
  return enemies.reduce((sum, e) => sum + (e.xp || 20), 0);
};

export const calculateGoldReward = (enemies, combatGoldReward) => {
  if (combatGoldReward) {
    const match = String(combatGoldReward).match(/(\d+)d(\d+)([+-]\d+)?/);
    if (match) {
      const [, qty, sides, bonus] = match;
      let total = 0;
      for (let i = 0; i < parseInt(qty); i++) {
        total += Math.floor(Math.random() * parseInt(sides)) + 1;
      }
      return total + parseInt(bonus || 0);
    }
    const flat = parseInt(combatGoldReward);
    if (!isNaN(flat)) return flat;
  }
  return enemies.reduce((sum, e) => {
    const gold = e.gold || Math.floor(Math.random() * 6) + 1;
    return sum + gold;
  }, 0);
};
