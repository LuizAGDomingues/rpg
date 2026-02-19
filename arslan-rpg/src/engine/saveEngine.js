const SAVE_KEY = 'arslan_rpg_save';

export const saveGame = (gameState) => {
  const saveData = { version: '1.0.0', timestamp: Date.now(), state: gameState };
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
};

export const loadGame = () => {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw).state; } catch { return null; }
};

export const hasSave = () => !!localStorage.getItem(SAVE_KEY);
export const deleteSave = () => localStorage.removeItem(SAVE_KEY);

export const getSaveInfo = () => {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const save = JSON.parse(raw);
    return { version: save.version, timestamp: save.timestamp, date: new Date(save.timestamp).toLocaleString('pt-BR') };
  } catch { return null; }
};
