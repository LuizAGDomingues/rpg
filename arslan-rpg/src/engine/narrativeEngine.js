import { checkCondition } from '../utils/conditions';

export const getScene = (sceneId, narrativeData) => {
  return narrativeData.scenes?.find((s) => s.id === sceneId) || null;
};

export const getAvailableChoices = (scene, gameState) => {
  if (!scene?.choices) return [];
  return scene.choices.filter((choice) => {
    if (!choice.condition) return true;
    return checkCondition(choice.condition, gameState);
  });
};

export const processChoice = (choice, gameState, store) => {
  const results = [];

  if (choice.faction_effects) {
    Object.entries(choice.faction_effects).forEach(([factionId, delta]) => {
      store.updateFaction(factionId, delta);
      results.push({ type: 'faction', faction: factionId, delta });
    });
  }

  if (choice.set_flags) {
    Object.entries(choice.set_flags).forEach(([flag, value]) => {
      store.setNarrativeFlag(flag, value);
    });
  }

  if (choice.set_world_flags) {
    Object.entries(choice.set_world_flags).forEach(([flag, value]) => {
      store.setWorldFlag(flag, value);
    });
  }

  if (choice.xp_reward) {
    store.addXP(choice.xp_reward);
    results.push({ type: 'xp', amount: choice.xp_reward });
  }

  if (choice.add_item) {
    store.addToInventory(choice.add_item);
    results.push({ type: 'item', item: choice.add_item });
  }

  if (choice.add_key_item) {
    store.addKeyItem(choice.add_key_item);
    results.push({ type: 'key_item', item: choice.add_key_item });
  }

  if (choice.recruit) {
    results.push({ type: 'recruit', generalId: choice.recruit });
  }

  if (choice.unlock_region) {
    store.unlockRegion(choice.unlock_region);
    results.push({ type: 'region', region: choice.unlock_region });
  }

  if (choice.start_quest) {
    store.startQuest(choice.start_quest);
    results.push({ type: 'quest', quest: choice.start_quest });
  }

  if (choice.complete_quest) {
    store.completeQuest(choice.complete_quest);
    results.push({ type: 'quest_complete', questId: choice.complete_quest });
  }

  if (choice.start_combat) {
    results.push({ type: 'combat', combatData: choice.start_combat });
  }

  if (choice.start_dialogue) {
    results.push({ type: 'dialogue', dialogueData: choice.start_dialogue });
  }

  store.addChoice({
    scene: gameState.currentScene,
    choice: choice.id,
    timestamp: Date.now(),
  });

  if (choice.next_scene) {
    store.setCurrentScene(choice.next_scene);
  }

  if (choice.set_act) {
    store.setCurrentAct(choice.set_act);
  }

  return results;
};

export const getNarrativeText = (scene) => {
  if (!scene) return [];
  if (Array.isArray(scene.text)) return scene.text;
  if (typeof scene.text === 'string') return [scene.text];
  return [];
};

export const getSceneTitle = (scene) => {
  return scene?.title || null;
};

export const getSceneType = (scene) => {
  return scene?.type || 'narrative';
};
