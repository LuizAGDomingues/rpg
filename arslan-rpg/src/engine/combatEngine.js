import { rollD20, rollWeaponDamage, rollD6 } from './diceEngine';
import { getModifierValue } from '../utils/formatters';

export const rollInitiative = (combatants) => {
  return combatants.map((c) => ({
    ...c,
    initiative: rollD20() + getModifierValue(c.attributes?.DES || 10),
  })).sort((a, b) => b.initiative - a.initiative);
};

export const rollAttack = (attacker, target) => {
  const roll = rollD20();
  const forMod = getModifierValue(attacker.attributes?.FOR || 10);
  const weaponBonus = attacker.weapon?.bonus_atk || 0;
  const attackMod = forMod + weaponBonus;
  const total = roll + attackMod;
  const isCrit = roll === 20;
  const isFumble = roll === 1;

  // Stun effect: stunned targets have -2 CA
  const targetCA = target.ca - (hasStatusEffect(target, 'stunned') ? 2 : 0);
  const hits = isCrit || (!isFumble && total >= targetCA);
  return { roll, attackMod, total, hits, isCrit, isFumble };
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

/* ===== Enemy AI ===== */

export const processEnemyTurn = (enemy, targets) => {
  const actions = [];
  const livingTargets = targets.filter((t) => t.hp > 0);
  if (livingTargets.length === 0) return actions;

  // Check if enemy is stunned — skip turn
  if (hasStatusEffect(enemy, 'stunned')) return actions;

  let remainingPA = enemy.pa || 2;

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

export const calculateGoldReward = (enemies) => {
  return enemies.reduce((sum, e) => {
    const gold = e.gold || Math.floor(Math.random() * 6) + 1;
    return sum + gold;
  }, 0);
};
