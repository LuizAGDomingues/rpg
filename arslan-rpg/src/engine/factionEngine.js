import { FACTION_THRESHOLDS } from '../utils/constants';
import { clamp } from '../utils/formatters';

export const updateReputation = (currentRep, delta) => {
  return clamp(currentRep + delta, -100, 100);
};

export const getFactionStatus = (repValue) => {
  for (const t of FACTION_THRESHOLDS) {
    if (repValue >= t.min && repValue <= t.max) {
      return { label: t.label, color: t.color };
    }
  }
  return { label: 'Desconhecido', color: 'var(--text-muted)' };
};

export const checkFactionUnlocks = (factions) => {
  const unlocks = [];
  Object.entries(factions).forEach(([id, rep]) => {
    if (rep >= 50) unlocks.push({ factionId: id, tier: 'respected' });
    if (rep >= 80) unlocks.push({ factionId: id, tier: 'allied' });
  });
  return unlocks;
};

export const getFactionRelations = (factionId, factionsData) => {
  const faction = factionsData.find((f) => f.id === factionId);
  if (!faction) return { allies: [], enemies: [] };
  return { allies: faction.allies || [], enemies: faction.enemies || [] };
};

export const applyFactionEffects = (effects, currentFactions) => {
  const updated = { ...currentFactions };
  Object.entries(effects).forEach(([factionId, delta]) => {
    if (updated[factionId] !== undefined) {
      updated[factionId] = updateReputation(updated[factionId], delta);
    }
  });
  return updated;
};
