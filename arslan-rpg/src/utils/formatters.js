export const getModifierValue = (attributeValue) => {
  if (attributeValue <= 3) return -3;
  if (attributeValue <= 5) return -2;
  if (attributeValue <= 8) return -1;
  if (attributeValue <= 11) return 0;
  if (attributeValue <= 13) return 1;
  if (attributeValue <= 15) return 2;
  if (attributeValue <= 17) return 3;
  if (attributeValue <= 19) return 4;
  return 5;
};

export const formatModifier = (value) => {
  const mod = getModifierValue(value);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export const formatHP = (current, max) => `${current}/${max}`;

export const formatFactionRep = (value) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value}`;
};

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
