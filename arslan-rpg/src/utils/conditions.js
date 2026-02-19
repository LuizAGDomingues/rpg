export const checkCondition = (condition, gameState) => {
  if (!condition) return true;
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

  // narrative flag
  if (state.narrative.flags[condition] !== undefined) return !!state.narrative.flags[condition];

  // world flag
  if (state.world.world_flags[condition] !== undefined) return !!state.world.world_flags[condition];

  // quest completed
  const qc = condition.match(/^quest_(\w+)_completed$/);
  if (qc) return state.quests.completed.some((q) => q.id === qc[1]);

  // quest active
  const qa = condition.match(/^quest_(\w+)_active$/);
  if (qa) return state.quests.active.some((q) => q.id === qa[1]);

  // general recruited
  const rec = condition.match(/^(\w+)_recruited$/);
  if (rec) return state.recruited_generals.some((g) => g.id === rec[1]);

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

  return false;
};
