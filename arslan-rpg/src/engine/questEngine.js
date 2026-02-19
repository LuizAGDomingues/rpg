import { checkCondition } from '../utils/conditions';

export const getAvailableQuests = (allQuests, gameState) => {
  return allQuests.filter((q) => {
    const isActive = gameState.quests.active.some((a) => a.id === q.id);
    const isCompleted = gameState.quests.completed.some((c) => c.id === q.id);
    const isFailed = gameState.quests.failed.some((f) => f.id === q.id);
    if (isActive || isCompleted || isFailed) return false;
    if (q.start_condition && !checkCondition(q.start_condition, gameState)) return false;
    return true;
  });
};

export const checkQuestCompletion = (quest, gameState) => {
  if (!quest.completion_flag) return false;
  const flags = { ...gameState.narrative.flags, ...gameState.world.world_flags };
  return !!flags[quest.completion_flag];
};

export const getQuestRewards = (quest) => {
  return quest.rewards || { xp: 0, gold: 0, items: [] };
};

export const getActiveQuestProgress = (quest, gameState) => {
  if (!quest.objectives) return { total: 0, done: 0, percent: 0 };
  const total = quest.objectives.length;
  const flags = { ...gameState.narrative.flags, ...gameState.world.world_flags };
  const done = quest.objectives.filter((obj) => !!flags[obj.id]).length;
  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
};
