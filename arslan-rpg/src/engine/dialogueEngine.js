import { checkCondition } from '../utils/conditions';
import { rollAttributeTest } from './diceEngine';

export const getDialogueOptions = (dialogue, gameState) => {
  if (!dialogue || !dialogue.options) return [];
  return dialogue.options.filter((opt) => {
    if (opt.condition && !checkCondition(opt.condition, gameState)) return false;
    return true;
  });
};

export const processDialogueChoice = (option, gameState) => {
  const results = [];

  if (option.skill_check) {
    const { attribute, dc } = option.skill_check;
    const attrValue = gameState.player.attributes[attribute] || 10;
    const roll = rollAttributeTest(attrValue);
    const success = roll.total >= dc;
    results.push({
      type: 'skill_check',
      attribute,
      dc,
      roll: roll.roll,
      modifier: roll.modifier,
      total: roll.total,
      success,
    });
    if (success && option.success_next) {
      results.push({ type: 'next_dialogue', id: option.success_next });
    } else if (!success && option.failure_next) {
      results.push({ type: 'next_dialogue', id: option.failure_next });
    }
  }

  if (option.faction_effects) {
    Object.entries(option.faction_effects).forEach(([faction, delta]) => {
      results.push({ type: 'faction', faction, delta });
    });
  }

  if (option.set_flags) {
    Object.entries(option.set_flags).forEach(([flag, value]) => {
      results.push({ type: 'flag', flag, value });
    });
  }

  if (option.xp_reward) {
    results.push({ type: 'xp', amount: option.xp_reward });
  }

  if (option.next_scene) {
    results.push({ type: 'scene', sceneId: option.next_scene });
  }

  return results;
};

export const getNPCMood = (npcId, gameState) => {
  const factionRep = gameState.factions || {};
  const npcFlags = gameState.narrative.flags || {};

  if (npcFlags[`${npcId}_angry`]) return 'hostile';
  if (npcFlags[`${npcId}_grateful`]) return 'friendly';

  const rep = Object.values(factionRep).reduce((sum, v) => sum + v, 0);
  if (rep > 50) return 'friendly';
  if (rep < -20) return 'suspicious';
  return 'neutral';
};
