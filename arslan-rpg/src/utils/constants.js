export const ATTRIBUTE_NAMES = {
  FOR: 'Forca', DES: 'Destreza', CON: 'Constituicao',
  INT: 'Inteligencia', SAB: 'Sabedoria', CAR: 'Carisma',
};

export const ATTRIBUTE_DESCRIPTIONS = {
  FOR: 'Dano fisico, carregar peso, testes de forca bruta',
  DES: 'Iniciativa, esquiva, ataques a distancia, furtividade',
  CON: 'HP maximo, resistencia a condicoes, saves de veneno',
  INT: 'Testes de conhecimento, detectar armadilhas, PA extra',
  SAB: 'Percepcao, intuicao, leitura de situacao, cura',
  CAR: 'Persuasao, intimidacao, dialogos especiais, moral das tropas',
};

export const DC_LABELS = { 5: 'Trivial', 10: 'Facil', 15: 'Medio', 20: 'Dificil', 25: 'Heroico' };

export const GAME_PHASES = {
  TITLE: 'title', CLASS_SELECT: 'class_select', PLAYING: 'playing',
  COMBAT: 'combat', DIALOGUE: 'dialogue', MAP: 'map',
  INVENTORY: 'inventory', JOURNAL: 'journal', FACTIONS: 'factions',
  PARTY: 'party', SETTINGS: 'settings',
};

export const FACTION_THRESHOLDS = [
  { min: -100, max: -50, label: 'Hostil', color: 'var(--hp-red)' },
  { min: -49, max: 0, label: 'Frio', color: 'var(--condition-stun)' },
  { min: 1, max: 49, label: 'Cauteloso', color: 'var(--text-muted)' },
  { min: 50, max: 79, label: 'Respeitoso', color: 'var(--gold)' },
  { min: 80, max: 100, label: 'Aliado', color: 'var(--hp-green)' },
];

export const PA_COSTS = {
  ATTACK_BASIC: 2, ATTACK_LIGHT: 1, DEFEND: 1,
  DODGE: 1, MOVE: 1, USE_ITEM: 1, HELP_ALLY: 1,
};
