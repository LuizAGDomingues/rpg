import { checkCondition } from '../utils/conditions';
import { rollAttributeTest } from './diceEngine';
import { getModifierValue } from '../utils/formatters';

/**
 * Get a specific dialogue node by ID from a dialogue tree
 */
export const getDialogueNode = (dialogueData, nodeId) => {
  if (!dialogueData?.nodes) return null;
  return dialogueData.nodes.find((n) => n.id === nodeId) || null;
};

/**
 * Get filtered dialogue options for a node (respecting conditions)
 */
export const getDialogueOptions = (node, gameState) => {
  if (!node?.options) return [];
  return node.options.filter((opt) => {
    if (opt.condition && !checkCondition(opt.condition, gameState)) return false;
    return true;
  });
};

/**
 * Get the display text for a node, considering mood branches
 */
export const getNodeText = (node, mood) => {
  if (node.mood_check && node.branches) {
    const branch = node.branches[mood];
    if (branch?.text) return branch.text;
  }
  return node.text || '';
};

/**
 * Calculate NPC mood based on faction rep and narrative flags
 */
export const getNPCMood = (npcData, gameState) => {
  if (!npcData) return 'neutral';

  const baseMood = npcData.base_mood || 'neutral';
  const npcId = npcData.id;
  const flags = gameState.narrative?.flags || {};

  // Check explicit mood flags first
  if (flags[`offended_${npcId}`]) return 'hostile';
  if (flags[`helped_${npcId}`]) return 'friendly';
  if (flags[`${npcId}_angry`]) return 'hostile';
  if (flags[`${npcId}_grateful`]) return 'friendly';

  // Check faction reputation
  if (npcData.faction) {
    const factionRep = gameState.factions?.[npcData.faction];
    if (factionRep !== undefined) {
      if (factionRep >= 50) return 'friendly';
      if (factionRep >= 20) return 'neutral';
      if (factionRep <= -50) return 'hostile';
      if (factionRep <= -20) return 'suspicious';
    }
  }

  return baseMood;
};

/**
 * Process a dialogue choice: perform skill check (if any), apply effects to store
 * Returns { results[], nextNodeId, skillCheckResult? }
 */
export const processDialogueChoice = (option, gameState, store) => {
  const results = [];
  let nextNodeId = option.leads_to || null;
  let skillCheckResult = null;

  // Skill check (roll)
  if (option.roll) {
    const { attribute, dc } = option.roll;
    const attrValue = gameState.player?.attributes?.[attribute] || 10;
    const modifier = getModifierValue(attrValue);
    const roll = rollAttributeTest(modifier, dc);
    skillCheckResult = {
      attribute,
      dc,
      roll: roll.roll,
      modifier: roll.modifier,
      total: roll.total,
      success: roll.success,
      isCrit: roll.isCrit,
      isFumble: roll.isFumble,
    };
    results.push({ type: 'skill_check', ...skillCheckResult });

    // Redirect based on success/failure
    if (roll.success && option.success_next) {
      nextNodeId = option.success_next;
    } else if (!roll.success && option.failure_next) {
      nextNodeId = option.failure_next;
    }
    // If failed and no failure_next, still go to leads_to but skip positive effects
    if (!roll.success) {
      return { results, nextNodeId, skillCheckResult };
    }
  }

  // Apply character score change
  if (option.character_score) {
    store.updateCharacterScore(option.character_score);
  }

  // Apply faction effects (both singular and plural forms)
  const factionEffects = option.faction_effects || option.faction_effect;
  if (factionEffects) {
    Object.entries(factionEffects).forEach(([factionId, delta]) => {
      store.updateFaction(factionId, delta);
      results.push({ type: 'faction', faction: factionId, delta });
    });
  }

  // Apply narrative flags (object form)
  if (option.set_flags) {
    Object.entries(option.set_flags).forEach(([flag, value]) => {
      store.setNarrativeFlag(flag, value);
      results.push({ type: 'flag', flag, value });
    });
  }

  // Single flag shorthand
  if (option.set_flag) {
    store.setNarrativeFlag(option.set_flag, true);
    results.push({ type: 'flag', flag: option.set_flag, value: true });
  }

  // XP reward
  if (option.xp_reward) {
    store.addXP(option.xp_reward);
    results.push({ type: 'xp', amount: option.xp_reward });
  }

  // Start quest
  if (option.start_quest) {
    store.startQuest(option.start_quest);
    results.push({ type: 'quest', quest: option.start_quest });
  }

  // Complete quest
  if (option.complete_quest) {
    store.completeQuest(option.complete_quest);
    results.push({ type: 'quest_complete', questId: option.complete_quest });
  }

  // Transition to narrative scene
  if (option.next_scene) {
    results.push({ type: 'scene', sceneId: option.next_scene });
  }

  return { results, nextNodeId, skillCheckResult };
};

/**
 * Apply node-level effects (set_flags, faction_effect, xp_reward on the node itself)
 */
export const applyNodeEffects = (node, store) => {
  const results = [];

  if (node.set_flags) {
    Object.entries(node.set_flags).forEach(([flag, value]) => {
      store.setNarrativeFlag(flag, value);
      results.push({ type: 'flag', flag, value });
    });
  }

  // Single flag shorthand
  if (node.set_flag) {
    store.setNarrativeFlag(node.set_flag, true);
    results.push({ type: 'flag', flag: node.set_flag, value: true });
  }

  // Faction effects (both singular and plural forms)
  const factionEffects = node.faction_effects || node.faction_effect;
  if (factionEffects) {
    Object.entries(factionEffects).forEach(([factionId, delta]) => {
      store.updateFaction(factionId, delta);
      results.push({ type: 'faction', faction: factionId, delta });
    });
  }

  // character_score at node level (rare but supported)
  if (node.character_score) {
    store.updateCharacterScore(node.character_score);
  }

  if (node.xp_reward) {
    store.addXP(node.xp_reward);
    results.push({ type: 'xp', amount: node.xp_reward });
  }

  return results;
};
