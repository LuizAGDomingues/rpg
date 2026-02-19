export const rollDice = (sides, quantity = 1) => {
  const rolls = [];
  let total = 0;
  for (let i = 0; i < quantity; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    total += roll;
  }
  return { total, rolls };
};

export const rollD20 = () => rollDice(20).total;
export const rollD4 = () => rollDice(4).total;
export const rollD6 = () => rollDice(6).total;
export const rollD8 = () => rollDice(8).total;
export const rollD10 = () => rollDice(10).total;
export const rollD12 = () => rollDice(12).total;
export const rollD100 = () => rollDice(100).total;

export const rollWithAdvantage = () => {
  const r1 = rollD20(), r2 = rollD20();
  return { result: Math.max(r1, r2), rolls: [r1, r2], type: 'advantage' };
};

export const rollWithDisadvantage = () => {
  const r1 = rollD20(), r2 = rollD20();
  return { result: Math.min(r1, r2), rolls: [r1, r2], type: 'disadvantage' };
};

export const parseWeaponDice = (diceString) => {
  const match = diceString.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return { quantity: 1, sides: 6, bonus: 0 };
  return { quantity: parseInt(match[1]), sides: parseInt(match[2]), bonus: match[3] ? parseInt(match[3]) : 0 };
};

export const rollWeaponDamage = (diceString, extraBonus = 0) => {
  const { quantity, sides, bonus } = parseWeaponDice(diceString);
  const { total, rolls } = rollDice(sides, quantity);
  return { total: Math.max(1, total + bonus + extraBonus), rolls, formula: diceString };
};

export const rollAttributeTest = (modifier, dc) => {
  const roll = rollD20();
  const total = roll + modifier;
  return { roll, modifier, total, dc, success: total >= dc, isCrit: roll === 20, isFumble: roll === 1 };
};
