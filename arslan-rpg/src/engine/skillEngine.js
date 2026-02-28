import skillsData from '../data/skills/skills.json';
import { rollDice, rollD20, rollWeaponDamage } from './diceEngine';
import { rollAttack, rollDamage, addStatusEffect, hasStatusEffect, removeStatusEffect } from './combatEngine';
import { getModifierValue } from '../utils/formatters';

/* ===== Lookup ===== */

export const getSkillById = (skillId) => skillsData.skills[skillId] || null;

// Normalize skill name to ID (handles legacy display names)
const normalizeSkillId = (nameOrId) => {
  if (skillsData.skills[nameOrId]) return nameOrId;
  // Try to match by converting display name to snake_case
  const normalized = nameOrId
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  if (skillsData.skills[normalized]) return normalized;
  // Brute force search by name
  for (const [id, skill] of Object.entries(skillsData.skills)) {
    const skillNameNorm = skill.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    if (skillNameNorm === normalized) return id;
  }
  return null;
};

export const getSkillsForCombatant = (combatant) => {
  const skillIds = combatant.skills || [];
  return skillIds
    .map((idOrName) => {
      const id = normalizeSkillId(idOrName);
      return id ? getSkillById(id) : null;
    })
    .filter(Boolean);
};

/* ===== Validation ===== */

export const canUseSkill = (skill, caster, currentPA, cooldowns = {}, usesThisCombat = {}) => {
  if (!skill) return { canUse: false, reason: 'Habilidade invalida' };
  if (caster.hp <= 0) return { canUse: false, reason: 'Caido' };
  if (skill.passive) return { canUse: false, reason: 'Passiva' };
  if (currentPA < skill.pa_cost) return { canUse: false, reason: `Precisa ${skill.pa_cost} PA` };
  if ((cooldowns[skill.id] || 0) > 0) return { canUse: false, reason: `Cooldown: ${cooldowns[skill.id]} turnos` };
  if (skill.uses_per_combat && (usesThisCombat[skill.id] || 0) >= skill.uses_per_combat) {
    return { canUse: false, reason: 'Ja usada neste combate' };
  }
  return { canUse: true, reason: '' };
};

/* ===== Targeting ===== */

export const needsTargetSelection = (skill) => {
  return ['single_enemy', 'single_ally'].includes(skill.target_type);
};

export const getTargetType = (skill) => skill.target_type || 'single_enemy';

/* ===== Cooldown Management ===== */

export const tickCooldowns = (cooldowns) => {
  const updated = {};
  for (const [skillId, remaining] of Object.entries(cooldowns)) {
    if (remaining > 1) updated[skillId] = remaining - 1;
  }
  return updated;
};

/* ===== Main Resolver ===== */

const makeResult = (overrides = {}) => ({
  logs: [],
  allyUpdates: {},
  enemyUpdates: {},
  cooldownSet: {},
  useConsumed: null,
  paSpent: 0,
  ...overrides,
});

export const resolveSkill = (skill, caster, target, allAllies, allEnemies) => {
  const livingAllies = allAllies.filter((a) => a.hp > 0);
  const livingEnemies = allEnemies.filter((e) => e.hp > 0);

  let result;
  switch (skill.effect) {
    case 'bonus_damage':
      result = resolveBonusDamage(skill, caster, target);
      break;
    case 'temp_ca_buff':
      result = resolveTempCABuff(skill, caster);
      break;
    case 'ally_buff_enemy_debuff':
      result = resolveAllyBuffEnemyDebuff(skill, caster, livingAllies, livingEnemies);
      break;
    case 'aoe_damage':
      result = resolveAOEDamage(skill, caster, livingEnemies);
      break;
    case 'intimidate':
      result = resolveIntimidate(skill, caster, target);
      break;
    case 'reveal_stats':
      result = resolveRevealStats(skill, target);
      break;
    case 'ally_heal_and_buff':
      result = resolveAllyHealBuff(skill, caster, livingAllies);
      break;
    case 'reveal_initiative_and_bonus_action':
      result = resolveAnaliseTatica(skill, target);
      break;
    case 'negate_next_enemy_attack':
      result = resolveAnteciparMovimento(skill, caster, target);
      break;
    case 'pre_combat_buff':
      result = resolvePlanoDeBatalha(skill, caster, livingAllies);
      break;
    case 'ultimate_strategy':
      result = resolveUltimateStrategy(skill, caster, livingAllies);
      break;
    case 'intercept_damage':
      result = makeResult({ logs: [`🛡 ${caster.name}: Guardiao do Principe ativo.`] });
      break;
    case 'heavy_attack_stun':
      result = resolveHeavyAttackStun(skill, caster, target);
      break;
    case 'mark_target':
      result = resolveMarkTarget(skill, caster, target);
      break;
    case 'give_ally_extra_pa':
      result = resolveGiveExtraPA(skill, caster, target);
      break;
    case 'precision_shot':
      result = resolvePrecisionShot(skill, caster, target);
      break;
    case 'stabilize_or_cure_bleed':
      result = resolveFirstAid(skill, caster, target);
      break;
    case 'double_attack':
      result = resolveDoubleAttack(skill, caster, target);
      break;
    case 'ally_heal_and_morale':
      result = resolveBattleSong(skill, caster, livingAllies);
      break;
    case 'multi_target':
      result = resolveMultiTarget(skill, caster, livingEnemies);
      break;
    default:
      result = makeResult({ logs: [`⚠ ${skill.name}: efeito desconhecido.`] });
  }

  // Set cooldown if the skill has one
  if (skill.cooldown > 0) {
    result.cooldownSet[skill.id] = skill.cooldown + 1; // +1 because it ticks down at start of next turn
  }

  // Track uses_per_combat
  if (skill.uses_per_combat) {
    result.useConsumed = skill.id;
  }

  result.paSpent = skill.pa_cost;
  return result;
};

/* ===== Individual Resolvers ===== */

// Helper: roll a saving throw
const rollSave = (target, attribute, dc) => {
  const mod = getModifierValue(target.attributes?.[attribute] || 10);
  const roll = rollD20();
  const total = roll + mod;
  return { roll, mod, total, success: total >= dc };
};

// Helper: roll damage from a dice string like "2d6" or "3d10+5"
const rollSkillDamage = (diceString) => {
  return rollWeaponDamage(diceString, 0);
};

// GOLPE PODEROSO — bonus_damage
function resolveBonusDamage(skill, caster, target) {
  const result = makeResult();
  const attack = rollAttack(caster, target);

  if (attack.hits) {
    const baseDmg = rollDamage(caster, attack.isCrit);
    const bonusDmg = rollSkillDamage(skill.bonus_dice);
    const totalDamage = baseDmg.total + bonusDmg.total;
    const newHP = Math.max(0, target.hp - totalDamage);

    result.logs.push(`✦ ${caster.name} usa ${skill.name}! (d20: ${attack.roll}+${attack.attackMod}=${attack.total} vs CA ${target.ca}) ${attack.isCrit ? '💥 CRITICO! ' : ''}Dano: ${baseDmg.total}+${bonusDmg.total}=${totalDamage}`);

    let targetUpdate = { hp: newHP };

    // Side effect (knockdown)
    if (skill.side_effect && newHP > 0) {
      const save = rollSave(target, skill.side_effect.save.attribute, skill.side_effect.save.dc);
      if (!save.success) {
        const fx = { name: skill.side_effect.name, duration: 1, label: 'Derrubado' };
        targetUpdate.status_effects = [...(target.status_effects || []).filter((e) => e.name !== fx.name), fx];
        result.logs.push(`  💥 ${target.name} foi derrubado! (Save CON: ${save.total} < DC ${skill.side_effect.save.dc})`);
      } else {
        result.logs.push(`  ${target.name} resiste ao derrubamento. (Save CON: ${save.total} >= DC ${skill.side_effect.save.dc})`);
      }
    }

    if (newHP <= 0) result.logs.push(`  ☠ ${target.name} foi derrotado!`);
    result.enemyUpdates[target.id] = targetUpdate;
  } else {
    result.logs.push(`✦ ${caster.name} usa ${skill.name}... e erra! (d20: ${attack.roll}+${attack.attackMod}=${attack.total} vs CA ${target.ca})`);
  }

  return result;
}

// POSTURA DEFENSIVA — temp_ca_buff
function resolveTempCABuff(skill, caster) {
  const result = makeResult();
  const buff = { name: 'defensive_stance', duration: 1, ca_bonus: skill.buff_value, label: 'Postura Defensiva' };
  const newEffects = [...(caster.status_effects || []).filter((e) => e.name !== 'defensive_stance'), buff];
  result.allyUpdates[caster.id] = {
    ca: caster.ca + skill.buff_value,
    status_effects: newEffects,
    _skillDefending: true,
    _skillDefendCA: skill.buff_value,
  };
  result.logs.push(`🛡 ${caster.name} usa ${skill.name}! +${skill.buff_value} CA ate o proximo turno.`);
  return result;
}

// GRITO DE GUERRA — ally_buff_enemy_debuff
function resolveAllyBuffEnemyDebuff(skill, caster, livingAllies, livingEnemies) {
  const result = makeResult();
  const allyBuff = { name: 'attack_buff', duration: skill.ally_buff.duration, attack_bonus: skill.ally_buff.attack_bonus, label: 'Grito de Guerra' };

  result.logs.push(`📣 ${caster.name} usa ${skill.name}!`);

  // Buff all living allies
  for (const ally of livingAllies) {
    const newEffects = [...(ally.status_effects || []).filter((e) => e.name !== 'attack_buff'), allyBuff];
    result.allyUpdates[ally.id] = { status_effects: newEffects };
    result.logs.push(`  ⬆ ${ally.name} ganha +${skill.ally_buff.attack_bonus} em ataques!`);
  }

  // Debuff enemies (saving throw)
  for (const enemy of livingEnemies) {
    const save = rollSave(enemy, skill.enemy_effect.save.attribute, skill.enemy_effect.save.dc);
    if (!save.success) {
      const debuff = { name: 'intimidated', duration: 2, label: 'Intimidado' };
      const newEffects = [...(enemy.status_effects || []).filter((e) => e.name !== 'intimidated'), debuff];
      result.enemyUpdates[enemy.id] = { status_effects: newEffects };
      result.logs.push(`  😨 ${enemy.name} fica intimidado! (SAB: ${save.total} < DC ${skill.enemy_effect.save.dc})`);
    } else {
      result.logs.push(`  ${enemy.name} resiste a intimidacao. (SAB: ${save.total})`);
    }
  }

  return result;
}

// LANCA DOS MIL EXERCITOS — aoe_damage
function resolveAOEDamage(skill, caster, livingEnemies) {
  const result = makeResult();
  const dmg = rollSkillDamage(skill.damage);
  result.logs.push(`⚡ ${caster.name} usa ${skill.name}! Dano base: ${dmg.total} em todos os inimigos!`);

  for (const enemy of livingEnemies) {
    const newHP = Math.max(0, enemy.hp - dmg.total);
    const update = { hp: newHP };

    if (skill.side_effect && newHP > 0) {
      const save = rollSave(enemy, skill.side_effect.save.attribute, skill.side_effect.save.dc);
      if (!save.success) {
        const fx = { name: skill.side_effect.name, duration: 1, label: 'Derrubado' };
        update.status_effects = [...(enemy.status_effects || []).filter((e) => e.name !== fx.name), fx];
        result.logs.push(`  ${enemy.name}: -${dmg.total} HP, derrubado! (CON ${save.total} < DC ${skill.side_effect.save.dc})`);
      } else {
        result.logs.push(`  ${enemy.name}: -${dmg.total} HP (resiste derrubamento)`);
      }
    } else {
      result.logs.push(`  ${enemy.name}: -${dmg.total} HP${newHP <= 0 ? ' ☠ Derrotado!' : ''}`);
    }

    result.enemyUpdates[enemy.id] = update;
  }

  return result;
}

// PERSUASAO NOBRE — intimidate
function resolveIntimidate(skill, caster, target) {
  const result = makeResult();
  const carMod = getModifierValue(caster.attributes?.CAR || 10);
  const casterRoll = rollD20() + carMod;
  const save = rollSave(target, skill.save.attribute, skill.save.dc);

  if (casterRoll >= skill.save.dc && !save.success) {
    const debuff = { name: 'intimidated', duration: 2, label: 'Intimidado' };
    const newEffects = [...(target.status_effects || []).filter((e) => e.name !== 'intimidated'), debuff];
    result.enemyUpdates[target.id] = { status_effects: newEffects };
    result.logs.push(`🗣 ${caster.name} usa ${skill.name} em ${target.name}! (CAR: ${casterRoll}) ${target.name} fica intimidado! (-2 em ataques)`);
  } else {
    result.logs.push(`🗣 ${caster.name} tenta intimidar ${target.name}... sem efeito. (CAR: ${casterRoll}, Save SAB: ${save.total})`);
  }

  return result;
}

// LEITURA DE PESSOAS — reveal_stats
function resolveRevealStats(skill, target) {
  const result = makeResult();
  const effects = (target.status_effects || []).map((e) => e.label || e.name).join(', ') || 'Nenhuma';
  const hpPct = Math.round((target.hp / target.hp_max) * 100);

  result.logs.push(`🔍 ${skill.name} em ${target.name}:`);
  result.logs.push(`  HP: ${target.hp}/${target.hp_max} (${hpPct}%)`);
  result.logs.push(`  CA: ${target.ca} | PA: ${target.pa || '?'}`);
  result.logs.push(`  Condicoes: ${effects}`);
  if (target.weapon) result.logs.push(`  Arma: ${target.weapon.name} (${target.weapon.damage})`);
  if (target.ai) result.logs.push(`  Comportamento: ${target.ai}`);

  return result;
}

// DISCURSO INSPIRADOR — ally_heal_and_buff
function resolveAllyHealBuff(skill, caster, livingAllies) {
  const result = makeResult();
  const carMod = getModifierValue(caster.attributes?.CAR || 10);
  result.logs.push(`✨ ${caster.name} usa ${skill.name}!`);

  for (const ally of livingAllies) {
    const healRoll = rollSkillDamage(skill.heal);
    const healAmount = healRoll.total + carMod;
    const newHP = Math.min(ally.hp_max, ally.hp + healAmount);
    const moraleBuff = { name: 'morale', duration: skill.buff.duration, bonus: skill.buff.all_rolls, label: 'Moral Elevada' };
    const newEffects = [...(ally.status_effects || []).filter((e) => e.name !== 'morale'), moraleBuff];
    result.allyUpdates[ally.id] = { hp: newHP, status_effects: newEffects };
    result.logs.push(`  💚 ${ally.name}: +${healAmount} HP (${newHP}/${ally.hp_max}), moral +${skill.buff.all_rolls}`);
  }

  return result;
}

// ANALISE TATICA — reveal_initiative_and_bonus_action
function resolveAnaliseTatica(skill, target) {
  const result = makeResult();
  // Grant bonus PA to chosen ally
  if (target) {
    result.allyUpdates[target.id] = { bonusPA: 1 };
    result.logs.push(`🎯 Analise Tatica! ${target.name} ganha +1 PA extra neste turno!`);
  }
  return result;
}

// ANTECIPAR MOVIMENTO — negate_next_enemy_attack
function resolveAnteciparMovimento(skill, caster, target) {
  const result = makeResult();
  const fx = { name: 'movement_anticipated', duration: 1, label: 'Movimento Antecipado' };
  const newEffects = [...(target.status_effects || []).filter((e) => e.name !== 'movement_anticipated'), fx];
  result.enemyUpdates[target.id] = { status_effects: newEffects };
  result.logs.push(`🎯 ${caster.name} antecipa o movimento de ${target.name}! O proximo ataque dele erra automaticamente.`);
  return result;
}

// PLANO DE BATALHA — pre_combat_buff
function resolvePlanoDeBatalha(skill, caster, livingAllies) {
  const result = makeResult();
  const buff = { name: 'attack_buff', duration: skill.ally_buff.duration, attack_bonus: skill.ally_buff.attack_bonus, label: 'Plano de Batalha' };
  result.logs.push(`📋 ${caster.name} usa ${skill.name}!`);
  for (const ally of livingAllies) {
    const newEffects = [...(ally.status_effects || []).filter((e) => e.name !== 'attack_buff'), buff];
    result.allyUpdates[ally.id] = { status_effects: newEffects };
    result.logs.push(`  ⬆ ${ally.name} ganha +${skill.ally_buff.attack_bonus} em ataques!`);
  }
  return result;
}

// ESTRATEGIA PERFEITA — ultimate_strategy
function resolveUltimateStrategy(skill, caster, livingAllies) {
  const result = makeResult();
  const buff = {
    name: 'strategy_buff',
    duration: skill.ally_buff.duration,
    attack_bonus: skill.ally_buff.attack_bonus,
    ca_bonus: skill.ally_buff.ca_bonus,
    label: 'Estrategia Perfeita',
  };
  result.logs.push(`⚡ ${caster.name} usa ${skill.name}! HABILIDADE LENDARIA!`);
  for (const ally of livingAllies) {
    const newEffects = [...(ally.status_effects || []).filter((e) => e.name !== 'strategy_buff'), buff];
    result.allyUpdates[ally.id] = {
      ca: ally.ca + skill.ally_buff.ca_bonus,
      status_effects: newEffects,
    };
    result.logs.push(`  ⬆ ${ally.name}: +${skill.ally_buff.attack_bonus} ataque, +${skill.ally_buff.ca_bonus} CA por ${skill.ally_buff.duration} turnos!`);
  }
  return result;
}

// CARGA DE CAVALARIA — heavy_attack_stun
function resolveHeavyAttackStun(skill, caster, target) {
  const result = makeResult();
  const attack = rollAttack(caster, target);

  if (attack.hits) {
    const dmg = rollSkillDamage(skill.damage);
    const totalDamage = attack.isCrit ? dmg.total * 2 : dmg.total;
    const newHP = Math.max(0, target.hp - totalDamage);

    result.logs.push(`🐴 ${caster.name} usa ${skill.name}! (d20: ${attack.roll}) ${attack.isCrit ? '💥 CRITICO! ' : ''}Dano: ${totalDamage}`);

    let targetUpdate = { hp: newHP };

    // Stun if target is below 50% HP after damage
    if (newHP > 0 && newHP <= target.hp_max * 0.5) {
      const stun = { name: 'stunned', duration: 1, label: 'Atordoado' };
      targetUpdate.status_effects = [...(target.status_effects || []).filter((e) => e.name !== 'stunned'), stun];
      result.logs.push(`  💫 ${target.name} esta abaixo de 50% HP e fica atordoado!`);
    }

    if (newHP <= 0) result.logs.push(`  ☠ ${target.name} foi derrotado!`);
    result.enemyUpdates[target.id] = targetUpdate;
  } else {
    result.logs.push(`🐴 ${caster.name} tenta a ${skill.name}... e erra! (d20: ${attack.roll})`);
  }

  return result;
}

// CRIAR ABERTURA / MARCAR ALVO — mark_target
function resolveMarkTarget(skill, caster, target) {
  const result = makeResult();
  const mark = { name: 'marked', duration: skill.status_applied?.duration || 1, label: 'Marcado' };
  const newEffects = [...(target.status_effects || []).filter((e) => e.name !== 'marked'), mark];
  result.enemyUpdates[target.id] = { status_effects: newEffects };
  result.logs.push(`🎯 ${caster.name} usa ${skill.name} em ${target.name}! Ataques contra ele tem vantagem.`);
  return result;
}

// INSTRUCAO DE COMBATE — give_ally_extra_pa
function resolveGiveExtraPA(skill, caster, target) {
  const result = makeResult();
  result.allyUpdates[target.id] = { bonusPA: skill.bonus_pa || 1 };
  result.logs.push(`📖 ${caster.name} usa ${skill.name} em ${target.name}! +${skill.bonus_pa || 1} PA extra.`);
  return result;
}

// TIRO PRECISO — precision_shot
function resolvePrecisionShot(skill, caster, target) {
  const result = makeResult();
  // Roll attack with bonus
  const roll = rollD20();
  const forMod = getModifierValue(caster.attributes?.DES || caster.attributes?.FOR || 10);
  const weaponBonus = (caster.weapon?.bonus_atk || 0) + (skill.attack_bonus || 3);
  const total = roll + forMod + weaponBonus;
  const targetCA = target.ca - (hasStatusEffect(target, 'stunned') ? 2 : 0);
  const hits = roll === 20 || (roll !== 1 && total >= targetCA);
  const isCrit = roll === 20;

  if (hits) {
    const dmg = rollDamage(caster, isCrit);
    const newHP = Math.max(0, target.hp - dmg.total);
    result.enemyUpdates[target.id] = { hp: newHP };
    result.logs.push(`🏹 ${caster.name} usa ${skill.name}! (d20: ${roll}+${forMod + weaponBonus}=${total} vs CA ${targetCA}) ${isCrit ? '💥 CRITICO! ' : ''}Dano: ${dmg.total}`);
    if (newHP <= 0) result.logs.push(`  ☠ ${target.name} foi derrotado!`);
  } else {
    result.logs.push(`🏹 ${caster.name} usa ${skill.name}... e erra! (d20: ${roll}+${forMod + weaponBonus}=${total} vs CA ${targetCA})`);
  }

  return result;
}

// PRIMEIROS SOCORROS — stabilize_or_cure_bleed
function resolveFirstAid(skill, caster, target) {
  const result = makeResult();
  if (target.hp <= 0) {
    // Stabilize: bring to 1 HP
    result.allyUpdates[target.id] = { hp: 1 };
    result.logs.push(`🩹 ${caster.name} usa ${skill.name} em ${target.name}! Estabilizado com 1 HP.`);
  } else if (hasStatusEffect(target, 'bleed')) {
    // Cure bleed
    const newEffects = (target.status_effects || []).filter((e) => e.name !== 'bleed');
    result.allyUpdates[target.id] = { status_effects: newEffects };
    result.logs.push(`🩹 ${caster.name} usa ${skill.name} em ${target.name}! Sangramento removido.`);
  } else {
    // Small heal
    const newHP = Math.min(target.hp_max, target.hp + 4);
    result.allyUpdates[target.id] = { hp: newHP };
    result.logs.push(`🩹 ${caster.name} usa ${skill.name} em ${target.name}! +4 HP.`);
  }
  return result;
}

// GOLPE DUPLO — double_attack
function resolveDoubleAttack(skill, caster, target) {
  const result = makeResult();
  result.logs.push(`⚔⚔ ${caster.name} usa ${skill.name}!`);

  for (let i = 0; i < 2; i++) {
    const attack = rollAttack(caster, target);
    if (attack.hits) {
      const dmg = rollDamage(caster, attack.isCrit);
      const currentHP = result.enemyUpdates[target.id]?.hp ?? target.hp;
      const newHP = Math.max(0, currentHP - dmg.total);
      result.enemyUpdates[target.id] = { ...result.enemyUpdates[target.id], hp: newHP };
      result.logs.push(`  Ataque ${i + 1}: Acertou! (d20: ${attack.roll}) ${attack.isCrit ? '💥 CRITICO! ' : ''}Dano: ${dmg.total}`);
      if (newHP <= 0) result.logs.push(`  ☠ ${target.name} foi derrotado!`);
    } else {
      result.logs.push(`  Ataque ${i + 1}: Errou! (d20: ${attack.roll})`);
    }
  }

  return result;
}

// CANCAO DE BATALHA — ally_heal_and_morale
function resolveBattleSong(skill, caster, livingAllies) {
  const result = makeResult();
  result.logs.push(`🎵 ${caster.name} usa ${skill.name}!`);

  for (const ally of livingAllies) {
    const heal = rollSkillDamage(skill.heal);
    const newHP = Math.min(ally.hp_max, ally.hp + heal.total);
    const immunity = {
      name: 'intimidation_immunity',
      duration: skill.immunity_duration || 3,
      immunity: skill.immunity,
      label: 'Moral Inabalavel',
    };
    const newEffects = [...(ally.status_effects || []).filter((e) => e.name !== 'intimidation_immunity'), immunity];
    result.allyUpdates[ally.id] = { hp: newHP, status_effects: newEffects };
    result.logs.push(`  🎵 ${ally.name}: +${heal.total} HP, imune a intimidacao.`);
  }

  return result;
}

// CHUVA DE FLECHAS — multi_target
function resolveMultiTarget(skill, caster, livingEnemies) {
  const result = makeResult();
  const targetCount = Math.min(skill.targets || 3, livingEnemies.length);
  // Pick random targets
  const shuffled = [...livingEnemies].sort(() => Math.random() - 0.5);
  const targets = shuffled.slice(0, targetCount);

  result.logs.push(`🏹 ${caster.name} usa ${skill.name}!`);

  for (const enemy of targets) {
    const dmg = rollSkillDamage(skill.damage);
    const currentHP = result.enemyUpdates[enemy.id]?.hp ?? enemy.hp;
    const newHP = Math.max(0, currentHP - dmg.total);
    const update = { hp: newHP };

    let sideMsg = '';
    if (skill.side_effect && newHP > 0) {
      const save = rollSave(enemy, skill.side_effect.save.attribute, skill.side_effect.save.dc);
      if (!save.success) {
        const fx = { name: skill.side_effect.name, duration: skill.side_effect.duration || 1, label: 'Lentificado' };
        update.status_effects = [...(enemy.status_effects || []).filter((e) => e.name !== fx.name), fx];
        sideMsg = `, lentificado!`;
      }
    }

    result.enemyUpdates[enemy.id] = { ...(result.enemyUpdates[enemy.id] || {}), ...update };
    result.logs.push(`  🎯 ${enemy.name}: -${dmg.total} HP${sideMsg}${newHP <= 0 ? ' ☠ Derrotado!' : ''}`);
  }

  return result;
}
