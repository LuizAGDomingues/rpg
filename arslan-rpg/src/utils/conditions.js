export const checkCondition = (condition, gameState) => {
  if (!condition) return true;
  // OR groups: any group matching is sufficient
  if (condition.includes(' OR ')) {
    return condition.split(' OR ').some((orPart) => {
      const andParts = orPart.split(' AND ');
      return andParts.every((part) => evaluateSingle(part.trim(), gameState));
    });
  }
  const parts = condition.split(' AND ');
  return parts.every((part) => evaluateSingle(part.trim(), gameState));
};

const evaluateSingle = (condition, state) => {
  // class == warrior
  const classMatch = condition.match(/^class\s*==\s*(\w+)$/);
  if (classMatch) return state.player.class === classMatch[1];

  // FOR >= 14
  const attrMatch = condition.match(/^(FOR|DES|CON|INT|SAB|CAR)\s*(>=|<=|>|<|==)\s*(\d+)$/);
  if (attrMatch) {
    const [, attr, op, val] = attrMatch;
    const v = state.player.attributes[attr] || 0;
    const n = parseInt(val);
    if (op === '>=') return v >= n;
    if (op === '<=') return v <= n;
    if (op === '>') return v > n;
    if (op === '<') return v < n;
    if (op === '==') return v === n;
  }

  // NOT prefix — negates the inner condition
  const notMatch = condition.match(/^NOT\s+(.+)$/);
  if (notMatch) return !evaluateSingle(notMatch[1].trim(), state);

  // general recruited — MUST be checked before generic narrative flags
  // to avoid narsus_recruited being intercepted by narrative.flags
  const rec = condition.match(/^(\w+)_recruited$/);
  if (rec) return state.recruited_generals.some((g) => g.id === rec[1]);

  // quest completed — MUST be checked before generic flags
  const qc = condition.match(/^quest_(\w+)_completed$/);
  if (qc) return state.quests.completed.some((q) => q.id === qc[1]);

  // quest active — MUST be checked before generic flags
  const qa = condition.match(/^quest_(\w+)_active$/);
  if (qa) return state.quests.active.some((q) => q.id === qa[1]);

  // act started
  const act = condition.match(/^act(\d+)_started$/);
  if (act) return state.currentAct >= parseInt(act[1]);

  // level check
  const lvl = condition.match(/^level\s*>=\s*(\d+)$/);
  if (lvl) return state.player.level >= parseInt(lvl[1]);

  // has key item
  const ki = condition.match(/^has_item_(\w+)$/);
  if (ki) return state.inventory.key_items.some((i) => i.id === ki[1]);

  // faction rep
  const fac = condition.match(/^faction_(\w+)\s*(>=|<=|>|<)\s*(-?\d+)$/);
  if (fac) {
    const [, factionId, op, val] = fac;
    const rep = state.factions[factionId] || 0;
    const n = parseInt(val);
    if (op === '>=') return rep >= n;
    if (op === '<=') return rep <= n;
    if (op === '>') return rep > n;
    if (op === '<') return rep < n;
  }

  // character_score comparison
  const csMatch = condition.match(/^character_score\s*(>=|<=|>|<|==)\s*(-?\d+)$/);
  if (csMatch) {
    const [, op, val] = csMatch;
    const score = state.player?.character_score || 0;
    const n = parseInt(val);
    if (op === '>=') return score >= n;
    if (op === '<=') return score <= n;
    if (op === '>') return score > n;
    if (op === '<') return score < n;
    if (op === '==') return score === n;
  }

  // Generic narrative flag (checked AFTER specific patterns)
  if (state.narrative.flags[condition] !== undefined) return !!state.narrative.flags[condition];

  // Generic world flag (checked AFTER specific patterns)
  if (state.world.world_flags[condition] !== undefined) return !!state.world.world_flags[condition];

  return false;
};
