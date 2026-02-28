# Arslan: A Lenda do Príncipe — RPG Text-Based
## Documento de Design e Especificação Técnica Completa

> Este documento contém tudo que o Claude Code precisa para implementar o jogo do zero.
> Leia integralmente antes de começar qualquer implementação.

---

## 1. VISÃO GERAL

Jogo RPG de texto baseado no anime/manga **Arslan Senki (The Heroic Legend of Arslan)**.
O jogador sempre controla **Arslan**, príncipe de Pars, em sua jornada para retomar o trono
usurpado pelos Lusitanos. A narrativa cobre a **Primeira Temporada** da obra.

**Premissa:** Arslan escolhe sua classe no início, e essa escolha molda atributos, diálogos
disponíveis e estilo de jogo. As escolhas do jogador durante a narrativa determinam o desfecho.

---

## 2. STACK TÉCNICA

```
React 18 (Vite)
Zustand (estado global)
React Router v6 (navegação entre telas)
CSS Modules (estilização por componente)
LocalStorage (sistema de save/load)
JSON files (dados de lore, NPCs, itens, diálogos, quests)
```

**Sem backend. Sem banco de dados. 100% client-side.**

---

## 3. ESTRUTURA DE PASTAS

```
arslan-rpg/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── fonts/                  # Fontes locais se necessário
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── StatRow.jsx
│   │   │   ├── Panel.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Ornament.jsx        # Decorações SVG persas/medievais
│   │   ├── combat/
│   │   │   ├── CombatScreen.jsx    # Tela principal de combate
│   │   │   ├── CombatLog.jsx       # Log de ações do combate
│   │   │   ├── CombatUnit.jsx      # Card de cada combatente
│   │   │   ├── ActionBar.jsx       # Barra de PA e ações disponíveis
│   │   │   └── InitiativeTracker.jsx
│   │   ├── dialogue/
│   │   │   ├── DialogueScreen.jsx  # Tela de diálogo com NPCs
│   │   │   ├── DialogueBox.jsx     # Caixa de fala do NPC
│   │   │   ├── ChoiceList.jsx      # Lista de opções de resposta
│   │   │   └── NPCPortrait.jsx     # Silhueta/arte do NPC (CSS/SVG)
│   │   ├── narrative/
│   │   │   ├── NarrativeBox.jsx    # Caixa de texto narrativo principal
│   │   │   ├── ChoiceBox.jsx       # Caixas de escolha narrativa
│   │   │   └── ChapterTitle.jsx    # Título de capítulo animado
│   │   ├── map/
│   │   │   ├── WorldMap.jsx        # Mapa principal de Pars
│   │   │   ├── RegionCard.jsx      # Card de região no mapa
│   │   │   └── LocationList.jsx    # Locais disponíveis na região atual
│   │   ├── inventory/
│   │   │   ├── InventoryScreen.jsx
│   │   │   ├── ItemCard.jsx
│   │   │   ├── EquipmentSlots.jsx
│   │   │   └── ItemDetail.jsx
│   │   ├── party/
│   │   │   ├── PartyScreen.jsx     # Fichas do grupo
│   │   │   ├── CharacterSheet.jsx  # Ficha detalhada de um personagem
│   │   │   └── GeneralCard.jsx     # Card resumido de general
│   │   ├── factions/
│   │   │   ├── FactionsScreen.jsx
│   │   │   ├── FactionCard.jsx     # Card com barra de reputação
│   │   │   └── AllianceStatus.jsx
│   │   └── journal/
│   │       ├── JournalScreen.jsx
│   │       ├── QuestEntry.jsx
│   │       └── QuestDetail.jsx
│   ├── screens/
│   │   ├── TitleScreen.jsx         # Tela inicial
│   │   ├── ClassSelectScreen.jsx   # Escolha de classe
│   │   ├── GameScreen.jsx          # Tela principal de jogo (narrativa)
│   │   ├── MapScreen.jsx
│   │   ├── InventoryScreen.jsx
│   │   ├── PartyScreen.jsx
│   │   ├── FactionsScreen.jsx
│   │   ├── JournalScreen.jsx
│   │   └── SettingsScreen.jsx
│   ├── store/
│   │   ├── useGameStore.js         # Store principal Zustand
│   │   ├── slices/
│   │   │   ├── playerSlice.js      # Estado do Arslan
│   │   │   ├── partySlice.js       # Estado dos generais
│   │   │   ├── factionSlice.js     # Estado das facções
│   │   │   ├── inventorySlice.js   # Inventário e equipamentos
│   │   │   ├── questSlice.js       # Quests ativas e concluídas
│   │   │   ├── worldSlice.js       # Regiões, locais, flags de mundo
│   │   │   ├── narrativeSlice.js   # Cena atual, flags narrativos
│   │   │   └── combatSlice.js      # Estado de um combate ativo
│   ├── engine/
│   │   ├── narrativeEngine.js      # Lógica de progressão de cenas
│   │   ├── combatEngine.js         # Lógica de combate por turnos
│   │   ├── diceEngine.js           # Sistema de dados (d4, d6, d8, d10, d12, d20)
│   │   ├── dialogueEngine.js       # Lógica de diálogos condicionais
│   │   ├── questEngine.js          # Lógica de quests
│   │   ├── factionEngine.js        # Lógica de reputação
│   │   └── saveEngine.js           # Save/Load via LocalStorage
│   ├── data/
│   │   ├── classes/
│   │   │   ├── warrior.json
│   │   │   ├── diplomat.json
│   │   │   └── strategist.json
│   │   ├── characters/
│   │   │   ├── arslan.json
│   │   │   ├── daryun.json
│   │   │   ├── narsus.json
│   │   │   ├── elam.json
│   │   │   ├── gieve.json
│   │   │   ├── falangies.json
│   │   │   └── enemies/
│   │   │       ├── lusitanian_soldier.json
│   │   │       ├── kharlan.json
│   │   │       └── silvermask.json
│   │   ├── items/
│   │   │   ├── weapons.json
│   │   │   ├── armor.json
│   │   │   └── consumables.json
│   │   ├── factions/
│   │   │   └── factions.json
│   │   ├── world/
│   │   │   ├── regions.json
│   │   │   └── locations.json
│   │   ├── quests/
│   │   │   ├── main_quests.json
│   │   │   └── side_quests.json
│   │   └── narrative/
│   │       ├── act1_prologue.json
│   │       ├── act2_exile.json
│   │       ├── act3_alliance.json
│   │       └── act4_return.json
│   ├── styles/
│   │   ├── global.css              # Reset, variáveis CSS, tipografia
│   │   ├── theme.css               # Tema visual (cores, ornamentos)
│   │   └── animations.css          # Keyframes reutilizáveis
│   ├── utils/
│   │   ├── formatters.js           # Formatação de números, texto
│   │   ├── conditions.js           # Checagem de condições narrativas
│   │   └── constants.js            # Constantes do jogo
│   ├── App.jsx
│   ├── Router.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 4. TEMA VISUAL

**Estética:** Persa medieval, épico, sombrio e elegante. Inspirado em iluminuras islâmicas medievais
e manuscritos persas. Tom dourado sobre fundo escuro quase preto.

**Paleta de Cores (variáveis CSS globais):**
```css
--gold: #c9a84c;
--gold-light: #e8c96a;
--gold-dark: #8a6d2f;
--crimson: #8b1a1a;
--crimson-light: #c0392b;
--bg-dark: #0a0806;
--bg-mid: #13100a;
--bg-panel: #1a1510;
--bg-card: #201a12;
--text-light: #f0e6c8;
--text-muted: #a09070;
--text-dim: #605040;
--border: #3a2e1a;
--border-gold: #5a4520;
--hp-green: #2e7d32;
--hp-red: #b71c1c;
--mp-blue: #1565c0;  /* usado para PA (Pontos de Ação) */
--condition-poison: #558b2f;
--condition-bleed: #b71c1c;
--condition-stun: #f57f17;
```

**Tipografia (Google Fonts):**
- Títulos: `Cinzel Decorative` (caps, decorativo)
- Subtítulos/UI: `Cinzel` (serif clássico)
- Narrativa/corpo: `EB Garamond` (serif elegante, itálico para narração)

**Não usar:** Inter, Roboto, Arial, gradientes roxos, fundos brancos.

**Ornamentos:** Usar SVGs embutidos com padrões geométricos islâmicos para decoração de painéis,
divisores e bordas. Nada de imagens externas — silhuetas CSS para personagens no diálogo.

---

## 5. SISTEMA DE CLASSES

O jogador escolhe a classe de Arslan no início. Irreversível. Muda atributos base,
habilidades disponíveis e opções de diálogo ao longo do jogo.

### 5.1 Guerreiro
```json
{
  "id": "warrior",
  "name": "Guerreiro",
  "description": "Arslan segue os passos de Daryun. Lidera pelo exemplo em batalha.",
  "attributes": {
    "FOR": 16, "DES": 12, "CON": 15, "INT": 10, "SAB": 10, "CAR": 13
  },
  "hp_base": 24,
  "pa_base": 3,
  "proficiencies": ["espadas", "lanças", "escudos", "armadura_pesada"],
  "starting_skills": ["Golpe Preciso", "Resistência", "Inspirar Tropas"],
  "faction_bonus": { "nobreza_pars": 10, "cavalaria": 15 },
  "dialogue_tags": ["warrior"],
  "flavor": "Inspira lealdade através da força e coragem em campo de batalha."
}
```

### 5.2 Diplomata
```json
{
  "id": "diplomat",
  "name": "Diplomata",
  "description": "Arslan abraça o humanismo. Conquista aliados com palavras e visão.",
  "attributes": {
    "FOR": 10, "DES": 12, "CON": 10, "INT": 14, "SAB": 15, "CAR": 18
  },
  "hp_base": 16,
  "pa_base": 3,
  "proficiencies": ["espadas_leves", "arcos", "armadura_leve"],
  "starting_skills": ["Persuasão Nobre", "Leitura de Pessoas", "Discurso Inspirador"],
  "faction_bonus": { "escravos_libertos": 20, "sindhura": 10, "lusitanos_moderados": 15 },
  "dialogue_tags": ["diplomat"],
  "flavor": "Desbloqueia opções de diálogo exclusivas. Pode resolver conflitos sem combate."
}
```

### 5.3 Estrategista
```json
{
  "id": "strategist",
  "name": "Estrategista",
  "description": "Arslan como discípulo de Narsus. A mente é sua arma mais afiada.",
  "attributes": {
    "FOR": 10, "DES": 14, "CON": 10, "INT": 18, "SAB": 14, "CAR": 12
  },
  "hp_base": 16,
  "pa_base": 4,
  "proficiencies": ["espadas_leves", "arcos", "armadura_leve"],
  "starting_skills": ["Análise Tática", "Antecipar Movimento", "Plano de Batalha"],
  "faction_bonus": { "nobreza_pars": 5, "turan": 10 },
  "dialogue_tags": ["strategist"],
  "flavor": "Bônus em combates em grupo. Revela fraquezas inimigas. PA extra por turno."
}
```

---

## 6. SISTEMA DE ATRIBUTOS (Base D&D)

### 6.1 Os 6 Atributos
| Atributo | Abrev | Influência |
|---|---|---|
| Força | FOR | Dano físico, carregar peso, testes de força bruta |
| Destreza | DES | Iniciativa, esquiva, ataques à distância, furtividade |
| Constituição | CON | HP máximo, resistência a condições, saves de veneno |
| Inteligência | INT | Testes de conhecimento, detectar armadilhas, PA extra (Estrategista) |
| Sabedoria | SAB | Percepção, intuição, leitura de situação, cura |
| Carisma | CAR | Persuasão, intimidação, diálogos especiais, moral das tropas |

### 6.2 Modificadores
```
Valor 1-3   → Modificador -3
Valor 4-5   → Modificador -2
Valor 6-8   → Modificador -1
Valor 9-11  → Modificador  0
Valor 12-13 → Modificador +1
Valor 14-15 → Modificador +2
Valor 16-17 → Modificador +3
Valor 18-19 → Modificador +4
Valor 20    → Modificador +5
```

### 6.3 HP e PA
- **HP Máximo** = hp_base + (CON modificador × nível)
- **PA por turno** = pa_base (3 padrão, 4 para Estrategista)
- Ao subir de nível: +1 atributo à escolha OU +1 habilidade nova

---

## 7. SISTEMA DE COMBATE

### 7.1 Fluxo de um Combate
```
1. Trigger de combate (narrativa ou encontro)
2. Rolar Iniciativa para todos (d20 + mod DES), ordenar
3. Loop de turnos:
   a. Personagem atual recebe seus PA
   b. Jogador/IA escolhe ações
   c. Resolver ações (rolagens, dano, condições)
   d. Verificar condições de fim (todos inimigos mortos / aliados mortos / fuga)
4. Tela de resultado (XP, itens, narração)
```

### 7.2 Custos de PA
| Ação | Custo PA | Descrição |
|---|---|---|
| Atacar (básico) | 2 PA | Ataque padrão com arma equipada |
| Atacar (leve) | 1 PA | Ataque rápido, menor dano |
| Habilidade | 1-3 PA | Varia por habilidade |
| Defender | 1 PA | +2 CA até próximo turno |
| Esquivar | 1 PA | Próximo ataque contra si tem desvantagem |
| Mover | 1 PA | Reposicionar (afeta alcance de ataques) |
| Usar Item | 1 PA | Poção, bandagem, etc |
| Ajudar Aliado | 1 PA | Próxima ação do aliado tem vantagem |

### 7.3 Sistema de Dados
```
d4, d6, d8, d10, d12, d20, d100

Rolagem de ataque: d20 + modificador relevante vs CA do alvo
  - Resultado igual à CA: acerta
  - Resultado 20 natural: acerto crítico (dano dobrado)
  - Resultado 1 natural: falha crítica (efeito negativo)

Rolagem de dano: dado da arma + modificador (FOR para corpo a corpo, DES para distância)

Teste de atributo: d20 + modificador do atributo vs Dificuldade (DC)
  DC 5 = trivial | DC 10 = fácil | DC 15 = médio | DC 20 = difícil | DC 25 = heroico

Vantagem: rola 2d20, usa o maior
Desvantagem: rola 2d20, usa o menor
```

### 7.4 Condições de Status
```json
{
  "sangramento": {
    "description": "Perde HP no início de cada turno",
    "effect": "dano_por_turno",
    "damage": "1d4",
    "duration": "até curado ou 3 turnos",
    "save": "CON DC 12 para encerrar no início do turno",
    "cause": ["espadas serrilhadas", "flechas", "critico com lâmina"]
  },
  "veneno": {
    "description": "Dano acumulativo e penalidade em atributo",
    "effect": "dano_por_turno + penalidade",
    "damage": "1d6",
    "penalty": "-2 FOR e DES",
    "duration": "até antídoto ou 5 turnos",
    "save": "CON DC 14 a cada turno",
    "cause": ["flechas envenenadas", "lâminas envenenadas", "animais"]
  },
  "atordoado": {
    "description": "Perde todos os PA neste turno",
    "effect": "sem_acoes",
    "duration": "1 turno",
    "save": "CON DC 13 para reduzir para -1 PA",
    "cause": ["golpe na cabeça", "queda", "habilidades específicas"]
  },
  "derrubado": {
    "description": "No chão. Próximos ataques corpo a corpo têm vantagem contra este alvo",
    "effect": "vulnerabilidade_cac",
    "duration": "até gastar 1 PA para levantar",
    "cause": ["habilidades de derrubada", "falha crítica de DES"]
  },
  "intimidado": {
    "description": "Penalidade em todas as rolagens enquanto a fonte de medo estiver visível",
    "effect": "desvantagem_rolagens",
    "penalty": "-3 em todos os testes",
    "duration": "até fim do combate ou save bem-sucedido",
    "save": "SAB DC 15 no início de cada turno",
    "cause": ["habilidades de intimidação", "presença avassaladora"]
  },
  "exausto": {
    "description": "Penalidade cumulativa em atributos físicos",
    "effect": "-2 FOR, DES, CON por nível de exaustão",
    "max_levels": 3,
    "cause": ["combates longos", "viagens forçadas", "privação de recursos"]
  }
}
```

### 7.5 Classe de Armadura (CA)
```
CA base = 10 + mod DES
Armadura leve: +2 CA
Armadura média: +4 CA, cap DES +2
Armadura pesada: +6 CA, sem bônus DES
Escudo: +2 CA adicional
```

### 7.6 Combate em Grupo
- Arslan + até **3 generais recrutados** participam
- Cada general tem sua própria ficha, PA e ações
- O jogador controla todos os aliados
- Ordem na iniciativa: todos rolam individualmente
- Se um general chega a 0 HP: **inconsciente** (não morto), precisa ser estabilizado em 3 turnos ou morre

---

## 8. PERSONAGENS JOGÁVEIS (Generais)

### 8.1 Daryun
```json
{
  "id": "daryun",
  "name": "Daryun",
  "title": "O Guerreiro Negro de Pars",
  "role": "Tanque / Atacante",
  "attributes": { "FOR": 20, "DES": 16, "CON": 18, "INT": 12, "SAB": 13, "CAR": 14 },
  "hp_base": 36,
  "pa_base": 3,
  "ca_base": 18,
  "weapon": "Lança de Guerra",
  "weapon_damage": "1d10+5",
  "passive": "Guardião: se aliado adjacente receber ataque, Daryun pode gastar 1 PA para interceptar e receber o dano no lugar",
  "skills": ["Golpe Devastador", "Postura Defensiva", "Carga de Cavalaria"],
  "legendary_skill": {
    "name": "Lança dos Mil Exércitos",
    "description": "Ataque em área que atinge todos os inimigos adjacentes. Dano: 3d10+5. Custo: 3 PA. Uma vez por combate.",
    "unlock_condition": "Completar a quest 'A Promessa do Guerreiro Negro'"
  },
  "recruit_arc": "Ato 1 — Fuga de Ecbatana (automático, parte da narrativa principal)",
  "loyalty": 100,
  "dialogue_personality": "honrado, direto, protetor, leal acima de tudo"
}
```

### 8.2 Narsus
```json
{
  "id": "narsus",
  "name": "Narsus",
  "title": "O Estrategista Exilado",
  "role": "Suporte Tático / Debuffer",
  "attributes": { "FOR": 12, "DES": 16, "CON": 12, "INT": 20, "SAB": 18, "CAR": 15 },
  "hp_base": 18,
  "pa_base": 3,
  "ca_base": 14,
  "weapon": "Espada Fina",
  "weapon_damage": "1d8+2",
  "passive": "Análise de Campo: no início do combate, revela os atributos de um inimigo à escolha",
  "skills": ["Plano Tático", "Criar Abertura", "Instrução de Combate"],
  "legendary_skill": {
    "name": "Estratégia Perfeita",
    "description": "Antes da rolagem de iniciativa, Narsus designa a posição de um inimigo na ordem de turnos (coloca-o por último). Uma vez por combate.",
    "unlock_condition": "Completar a quest 'O Preço do Gênio'"
  },
  "recruit_arc": "Ato 2 — Visita à casa de exílio de Narsus",
  "loyalty": 85,
  "dialogue_personality": "sarcástico, brilhante, arrogante na medida certa, leal a ideais"
}
```

### 8.3 Elam
```json
{
  "id": "elam",
  "name": "Elam",
  "title": "Servo e Aprendiz de Narsus",
  "role": "Suporte / Explorador",
  "attributes": { "FOR": 10, "DES": 18, "CON": 11, "INT": 15, "SAB": 16, "CAR": 12 },
  "hp_base": 14,
  "pa_base": 3,
  "ca_base": 14,
  "weapon": "Arco Curto",
  "weapon_damage": "1d6+4",
  "passive": "Furtividade: pode se mover sem custo de PA e sem provocar ataques de oportunidade",
  "skills": ["Tiro Preciso", "Reconhecimento", "Primeiros Socorros"],
  "legendary_skill": {
    "name": "Olhos nas Sombras",
    "description": "Antes do combate, Elam revela todas as condições, habilidades e itens dos inimigos. Também revela inimigos emboscados. Uma vez por região.",
    "unlock_condition": "Completar a quest 'As Cicatrizes de Elam'"
  },
  "recruit_arc": "Ato 2 — Junto com Narsus (automático)",
  "loyalty": 90,
  "dialogue_personality": "determinado, orgulhoso, crescendo, leal a Narsus e Arslan"
}
```

### 8.4 Gieve
```json
{
  "id": "gieve",
  "name": "Gieve",
  "title": "O Menestrel Errante",
  "role": "DPS Ágil / Suporte de Moral",
  "attributes": { "FOR": 13, "DES": 20, "CON": 12, "INT": 14, "SAB": 12, "CAR": 18 },
  "hp_base": 16,
  "pa_base": 3,
  "ca_base": 15,
  "weapon": "Espada + Arco",
  "weapon_damage": "1d8+5 (espada) / 1d8+5 (arco)",
  "passive": "Esquiva Graciosa: uma vez por turno, pode esquivar de um ataque de graça (sem custo de PA)",
  "skills": ["Golpe Duplo", "Canção de Batalha", "Desaparecer na Multidão"],
  "legendary_skill": {
    "name": "Flecha do Destino",
    "description": "Ataque de arco com acerto automático (ignora rolagem de ataque) e ignora CA do alvo. Dano: 3d8+5. Uma vez por combate.",
    "unlock_condition": "Completar a quest 'A Dívida do Menestrel'"
  },
  "recruit_arc": "Ato 3 — Encontro durante missão em Sindhura",
  "loyalty": 60,
  "dialogue_personality": "oportunista charmoso, movido por interesse próprio que vai se tornando lealdade genuína"
}
```

### 8.5 Falangies
```json
{
  "id": "falangies",
  "name": "Falangies",
  "title": "Arqueira da Cavalaria",
  "role": "Arqueira / Dano à Distância",
  "attributes": { "FOR": 12, "DES": 19, "CON": 13, "INT": 13, "SAB": 15, "CAR": 14 },
  "hp_base": 16,
  "pa_base": 3,
  "ca_base": 15,
  "weapon": "Arco Longo",
  "weapon_damage": "1d10+4",
  "passive": "Atirador Especialista: sem penalidade de desvantagem para atirar em combate corpo a corpo",
  "skills": ["Chuva de Flechas", "Tiro Certeiro", "Marcar Alvo"],
  "legendary_skill": {
    "name": "Chuva de Fogo",
    "description": "Bombardeio de flechas incendiárias em área 3x3. Todos os alvos sofrem 2d8 de dano e ficam com a condição Queimando (1d4 dano por turno, 3 turnos). Uma vez por combate.",
    "unlock_condition": "Completar a quest 'Honra da Cavalaria'"
  },
  "recruit_arc": "Ato 3 — Aliança com grupo de cavalaria de Pars",
  "loyalty": 75,
  "dialogue_personality": "guerreira honrada, séria em combate, leal à causa de Pars"
}
```

---

## 9. INIMIGOS PRINCIPAIS

### 9.1 Soldado Lusitano (inimigo padrão)
```json
{
  "id": "lusitanian_soldier",
  "name": "Soldado Lusitano",
  "attributes": { "FOR": 14, "DES": 10, "CON": 13, "INT": 8, "SAB": 8, "CAR": 8 },
  "hp": 18, "ca": 14, "pa": 2,
  "weapon": "Espada Longa", "damage": "1d8+2",
  "xp": 50, "gold_drop": "1d6",
  "item_drop": [{ "id": "potion_minor", "chance": 0.2 }],
  "ai": "agressivo_simples"
}
```

### 9.2 Kharlan (boss Ato 1)
```json
{
  "id": "kharlan",
  "name": "General Kharlan",
  "title": "O Traidor de Pars",
  "attributes": { "FOR": 18, "DES": 14, "CON": 16, "INT": 14, "SAB": 12, "CAR": 13 },
  "hp": 80, "ca": 17, "pa": 3,
  "weapon": "Espada Longa do General", "damage": "1d10+4",
  "skills": ["Golpe Poderoso", "Gritar Ordens (buffa aliados)", "Resistência de Veterano"],
  "xp": 400,
  "ai": "tático_boss",
  "lore": "Antigo general de Pars que traiu o rei por promessas dos Lusitanos"
}
```

### 9.3 Silvermask / Hermes (boss final)
```json
{
  "id": "silvermask",
  "name": "Silvermask",
  "title": "O Guerreiro da Máscara de Prata",
  "attributes": { "FOR": 19, "DES": 18, "CON": 17, "INT": 17, "SAB": 15, "CAR": 16 },
  "hp": 150, "ca": 19, "pa": 4,
  "weapon": "Espada Ancestral de Pars", "damage": "1d12+5",
  "skills": ["Golpe Relâmpago", "Recusa em Morrer (recupera 20 HP uma vez)", "Fúria da Máscara", "Herdeiro Legítimo (efeito narrativo)"],
  "xp": 1000,
  "ai": "tático_agressivo_boss",
  "phases": 2,
  "lore": "Identidade misteriosa. Busca o trono de Pars com rancor e determinação inabaláveis."
}
```

---

## 10. SISTEMA DE FACÇÕES

### 10.1 Facções e Reputação
Reputação vai de **-100 a +100**. Começa diferente para cada facção.

```json
{
  "nobreza_pars": {
    "name": "Nobreza de Pars",
    "starting_rep": 20,
    "description": "Lordes e cavaleiros de Pars. Conservadores. Desconfiam de Arslan por rumores de ilegitimidade.",
    "rep_thresholds": {
      "-100_to_-50": "Hostil: sabotam suprimentos e recusam audiência",
      "-49_to_0": "Frios: neutros, não ajudam",
      "1_to_49": "Cautelosos: cooperam sob pressão",
      "50_to_79": "Respeitosos: enviam soldados quando solicitado",
      "80_to_100": "Aliados: juram lealdade, fornecem tropas e recursos"
    },
    "key_npcs": ["Lord Hodir", "Lord Marzban"],
    "formal_alliance_req": 80
  },
  "lusitanos_moderados": {
    "name": "Lusitanos Moderados",
    "starting_rep": -60,
    "description": "Lusitanos que questionam a guerra santa. Minoria influente mas silenciosa.",
    "rep_thresholds": {
      "-100_to_-50": "Inimigos ativos",
      "-49_to_0": "Hostis mas passivos",
      "1_to_49": "Céticos mas abertos",
      "50_to_79": "Aliados secretos",
      "80_to_100": "Aliados declarados: fragilizam resistência lusitana"
    },
    "formal_alliance_req": 70
  },
  "sindhura": {
    "name": "Reino de Sindhura",
    "starting_rep": 0,
    "description": "Vizinhos ao sul. Oportunistas. Respeitam poder e negociação.",
    "rep_thresholds": {
      "-100_to_-50": "Guerra: bloqueiam rotas sul",
      "-49_to_0": "Neutros",
      "1_to_49": "Comércio aberto",
      "50_to_79": "Aliança comercial: recursos extras",
      "80_to_100": "Aliança militar: tropas de elefantes de guerra"
    },
    "formal_alliance_req": 75
  },
  "turan": {
    "name": "Cavaleiros de Turan",
    "starting_rep": -10,
    "description": "Nômades das estepes do norte. Respeitam força, honra e vitória em batalha.",
    "rep_thresholds": {
      "-100_to_-50": "Raids: atacam acampamentos",
      "-49_to_0": "Indiferentes",
      "1_to_49": "Curiosos: testem Arslan",
      "50_to_79": "Mercenários leais: reforços de cavalaria",
      "80_to_100": "Irmãos de batalha: cavalaria pesada completa"
    },
    "formal_alliance_req": 65
  },
  "escravos_libertos": {
    "name": "Escravos Libertos",
    "starting_rep": 0,
    "description": "Facção que Arslan pode criar libertando escravos. Cresce com escolhas humanistas.",
    "rep_thresholds": {
      "0_to_29": "Não existe ainda",
      "30_to_49": "Pequeno grupo: batedores e espiões",
      "50_to_79": "Força organizada: infantaria irregular",
      "80_to_100": "Exército da liberdade: força militar + inteligência em todo o reino"
    },
    "formal_alliance_req": 50,
    "note": "Só pode ser criada por escolhas narrativas. Diplomata tem bônus de +20 inicial ao recrutar."
  },
  "clero_mithra": {
    "name": "Templo de Mithra (Pars)",
    "starting_rep": 30,
    "description": "Clero tradicional de Pars. Influenciam a nobreza e o povo.",
    "rep_thresholds": {
      "-100_to_0": "Denunciam Arslan como ilegítimo",
      "1_to_49": "Silenciosos",
      "50_to_79": "Endossam a campanha",
      "80_to_100": "Legitimam Arslan publicamente: +20 rep com nobreza_pars"
    },
    "formal_alliance_req": 60
  }
}
```

### 10.2 Ganhos e Perdas de Reputação
- Cada escolha narrativa tem `faction_effects` listados no JSON da cena
- Exemplos: libertar escravos +20 escravos_libertos, -10 nobreza_pars, +5 clero_mithra
- Vitórias em batalha: +5 a +15 dependendo do inimigo
- Derrotas: -10 a -20 dependendo da facção envolvida
- Quests secundárias: maiores variações (+20 a +40)

---

## 11. SISTEMA DE INVENTÁRIO

### 11.1 Categorias
- **Armas** — equipadas por personagem (uma arma principal, uma secundária opcional)
- **Armaduras** — corpo, cabeça, braços (cada slot separado)
- **Consumíveis** — poções, bandagens, antídotos, comida (efeito imediato)
- **Chave** — itens de quest, não descartáveis
- **Recursos** — ouro, mantimentos, materiais para crafting futuro

### 11.2 Itens Base
```json
[
  { "id": "sword_iron", "name": "Espada de Ferro", "type": "weapon", "damage": "1d8", "bonus_atk": 1, "weight": "medium", "value": 50, "equippable_by": ["arslan", "daryun", "narsus", "gieve"] },
  { "id": "spear_war", "name": "Lança de Guerra", "type": "weapon", "damage": "1d10", "bonus_atk": 2, "weight": "heavy", "value": 80, "equippable_by": ["daryun"] },
  { "id": "bow_short", "name": "Arco Curto", "type": "weapon", "damage": "1d6", "bonus_atk": 2, "range": true, "value": 45, "equippable_by": ["elam", "falangies", "gieve"] },
  { "id": "armor_leather", "name": "Armadura de Couro", "type": "armor", "ca_bonus": 2, "value": 40 },
  { "id": "armor_chain", "name": "Cota de Malha", "type": "armor", "ca_bonus": 4, "value": 120 },
  { "id": "shield_wooden", "name": "Escudo de Madeira", "type": "shield", "ca_bonus": 1, "value": 20 },
  { "id": "potion_minor", "name": "Poção Menor de Cura", "type": "consumable", "effect": "heal", "value_range": "2d4+2", "value": 30 },
  { "id": "potion_standard", "name": "Poção de Cura", "type": "consumable", "effect": "heal", "value_range": "4d4+4", "value": 60 },
  { "id": "antidote", "name": "Antídoto", "type": "consumable", "effect": "cure_poison", "value": 40 },
  { "id": "bandage", "name": "Bandagem", "type": "consumable", "effect": "cure_bleed", "value": 10 }
]
```

---

## 12. SISTEMA DE QUESTS

### 12.1 Estrutura de uma Quest
```json
{
  "id": "quest_daryun_legendary",
  "name": "A Promessa do Guerreiro Negro",
  "type": "side_quest",
  "giver_npc": "daryun",
  "description": "Daryun menciona uma promessa feita ao pai de Arslan. Para honrá-la, ele precisa recuperar a lança ancestral da família que foi capturada em Atropatene.",
  "trigger": "daryun_recruited AND act2_started",
  "objectives": [
    { "id": "obj1", "description": "Falar com Daryun no acampamento", "type": "dialogue" },
    { "id": "obj2", "description": "Viajar às ruínas de Atropatene", "type": "travel", "location": "atropatene_ruins" },
    { "id": "obj3", "description": "Derrotar o capitão lusitano guardião", "type": "combat", "enemy": "lusitanian_captain" },
    { "id": "obj4", "description": "Recuperar a Lança Sagrada", "type": "item", "item": "sacred_spear" }
  ],
  "rewards": {
    "xp": 300,
    "item": "sacred_spear",
    "legendary_skill_unlock": "daryun_legendary",
    "faction_effects": { "nobreza_pars": 10 },
    "dialogue_unlock": "daryun_personal_story"
  }
}
```

### 12.2 Quests Principais (Atos)
```
Ato 1:
  - "A Queda de Ecbatana" (narrativa automática)
  - "Fuga com Daryun" (narrativa automática)
  - "Atravessar o Campo de Atropatene" (primeiro combate real)

Ato 2:
  - "O Pintor Exilado" (recrutar Narsus)
  - "Primeiros Aliados" (estabelecer acampamento base)
  - "O Sussurro das Facções" (primeiro contato com nobreza de Pars)

Ato 3:
  - "A Rota do Sul" (missão em Sindhura)
  - "O Menestrel e a Sacerdotisa" (recrutar Gieve, encontrar Falangies)
  - "Aliança ou Conquista" (decisão diplomática com Sindhura)

Ato 4:
  - "Marcha sobre Ecbatana" (preparação final)
  - "As Muralhas da Capital" (combate épico em grupo)
  - "Confronto com a Máscara" (boss final: Silvermask)
  - "O Trono de Pars" (desfecho baseado em escolhas)
```

### 12.3 Quests Secundárias Exemplos
```
- "A Promessa do Guerreiro Negro" (Daryun — lança lendária)
- "O Preço do Gênio" (Narsus — salvar um vilarejo com estratégia sem combate)
- "As Cicatrizes de Elam" (Elam — investigar passado dele)
- "A Dívida do Menestrel" (Gieve — resolver dívida de jogo perigosa)
- "Honra da Cavalaria" (Falangies — provar valor em torneio)
- "O Ferreiro de Kashan" (NPC comum — recuperar ferramentas roubadas por bandidos)
- "A Família Separada" (NPC refugiada — encontrar marido desaparecido)
- "O Mercador de Sindhura" (NPC — escolta segura, abre rota diplomática)
- "Manuscritos de Narsus" (Narsus — recuperar livros saqueados, unlock: nota científica sobre 'magia')
```

---

## 13. MAPA E REGIÕES

### 13.1 Modelo de Navegação
**Modelo Híbrido:** Dentro de uma região, movimentação livre entre locais disponíveis.
Entre regiões, necessário progresso narrativo. Regiões bloqueadas ficam visíveis no mapa
com ícone de cadeado e a condição de desbloqueio exibida.

### 13.2 Regiões
```json
[
  {
    "id": "ecbatana",
    "name": "Ecbatana",
    "description": "A capital de Pars. Tomada pelos Lusitanos.",
    "unlock_condition": "Ato 4: Marcha Final",
    "locations": ["palacio_real", "mercado_ecbatana", "templo_mithra", "bairro_pobre"]
  },
  {
    "id": "atropatene",
    "name": "Campo de Atropatene",
    "description": "Local da batalha desastrosa onde Pars caiu.",
    "unlock_condition": "Ato 1 — automático",
    "locations": ["campo_batalha", "ruinas_acampamento", "floresta_sul"]
  },
  {
    "id": "exilio_narsus",
    "name": "Vilarejo de Dahman",
    "description": "Vilarejo remoto onde Narsus vive em exílio.",
    "unlock_condition": "Ato 2 — após sobreviver a Atropatene",
    "locations": ["casa_narsus", "taberna_dahman", "ferreiro_dahman", "estepe_norte"]
  },
  {
    "id": "acampamento_base",
    "name": "Acampamento dos Exilados",
    "description": "O quartel-general móvel de Arslan.",
    "unlock_condition": "Ato 2 — automático",
    "locations": ["tenda_arslan", "area_treino", "cozinha_campo", "posto_vigia"]
  },
  {
    "id": "kashan",
    "name": "Fortaleza de Kashan",
    "description": "Fortaleza chave no coração de Pars.",
    "unlock_condition": "Ato 2 — quest principal",
    "locations": ["muralhas_kashan", "salao_lord", "ferreiro_kashan", "prisao_kashan"]
  },
  {
    "id": "sindhura",
    "name": "Reino de Sindhura",
    "description": "O reino vizinho ao sul. Oportunistas e poderosos.",
    "unlock_condition": "Ato 3 — quest principal",
    "locations": ["palacio_sindhura", "mercado_sindhura", "arena_sindhura", "fronteira_sul"]
  }
]
```

---

## 14. SISTEMA DE DIÁLOGO

### 14.1 Estrutura de um Diálogo
```json
{
  "id": "dialogue_kaveh_blacksmith",
  "npc": "kaveh_blacksmith",
  "location": "ferreiro_kashan",
  "trigger": "player_visits_location",
  "greeting": {
    "text": "Não atendo qualquer um aqui, príncipe ou não. O que você quer?",
    "mood": "suspicious"
  },
  "options": [
    {
      "id": "opt1",
      "text": "Preciso de uma espada melhor. Tenho ouro.",
      "condition": null,
      "leads_to": "shop_menu",
      "faction_effect": null
    },
    {
      "id": "opt2",
      "text": "Dizem que você sabe de tudo que acontece em Kashan.",
      "condition": "SAB >= 12 OR class == diplomat",
      "leads_to": "kaveh_info_branch",
      "faction_effect": null
    },
    {
      "id": "opt3",
      "text": "[Persuasão DC 14] Somos do mesmo povo. Lute conosco.",
      "condition": "CAR >= 14",
      "roll": { "attribute": "CAR", "dc": 14 },
      "success_leads_to": "kaveh_recruit_branch",
      "fail_leads_to": "kaveh_refuse_branch",
      "faction_effect": { "on_success": { "nobreza_pars": 5 } }
    },
    {
      "id": "opt4",
      "text": "Tenho uma tarefa para você, se estiver interessado.",
      "condition": "quest_ferreiro_active",
      "leads_to": "quest_ferreiro_branch"
    },
    {
      "id": "opt5",
      "text": "Até mais.",
      "leads_to": "exit"
    }
  ]
}
```

### 14.2 Sistema de Humor do NPC
Cada NPC tem um `mood` atual: `hostile`, `suspicious`, `neutral`, `friendly`, `loyal`.
O humor muda baseado em:
- Reputação da facção do NPC
- Escolhas anteriores do jogador
- Resultados de rolagens na conversa

O mood influencia quais opções aparecem, os textos das falas e os DCs dos testes.

---

## 15. NOTAS CIENTÍFICAS ("Registro do Erudito Narsus")

Qualquer elemento sobrenatural na lore deve ter uma explicação racional apresentada
como nota de rodapé com o estilo narrativo de Narsus.

```
Exemplos:
- Pedra de Rukhnabad → cristal mineral com propriedades ópticas que cria ilusões de luz
- Visões/sonhos proféticos → intoxicação por gases de fissuras geológicas no palácio
- "Bênçãos divinas" em batalha → efeito psicológico de moral elevada + posicionamento tático
- Curas milagrosas → ervas medicinais de conhecimento persa antigo mal documentado
```

Formato da nota:
```jsx
<NarsusNote>
  "O que o povo chama de milagre, eu chamo de física mal compreendida.
  [explicação racional]. — Narsus, Erudito de Pars"
</NarsusNote>
```

---

## 16. SISTEMA DE SAVE

```javascript
// saveEngine.js
const SAVE_KEY = 'arslan_rpg_save';

export const saveGame = (gameState) => {
  const saveData = {
    version: '1.0.0',
    timestamp: Date.now(),
    state: gameState
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
};

export const loadGame = () => {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  const save = JSON.parse(raw);
  return save.state;
};

export const hasSave = () => !!localStorage.getItem(SAVE_KEY);

export const deleteSave = () => localStorage.removeItem(SAVE_KEY);
```

---

## 17. STORE ZUSTAND — ESTRUTURA COMPLETA

```javascript
// useGameStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGameStore = create(
  persist(
    (set, get) => ({

      // ── META ──
      gamePhase: 'title', // 'title' | 'class_select' | 'playing' | 'combat' | 'dialogue' | 'map' | 'inventory' | 'journal' | 'factions' | 'party'
      currentAct: 1,
      currentScene: 'prologue_start',

      // ── PLAYER (ARSLAN) ──
      player: {
        class: null,
        name: 'Arslan',
        level: 1,
        xp: 0,
        xp_next: 100,
        attributes: {},
        hp: 0,
        hp_max: 0,
        pa: 3,
        ca: 10,
        equipment: { weapon: null, armor: null, shield: null },
        skills: [],
        legendary_skills: [],
        status_effects: [],
      },

      // ── PARTY ──
      party: [], // array de generais recrutados (max 3 em combate)
      recruited_generals: [], // todos recrutados

      // ── FACÇÕES ──
      factions: {
        nobreza_pars: 20,
        lusitanos_moderados: -60,
        sindhura: 0,
        turan: -10,
        escravos_libertos: 0,
        clero_mithra: 30,
      },

      // ── INVENTÁRIO ──
      inventory: {
        gold: 50,
        items: [],
        key_items: [],
      },

      // ── QUESTS ──
      quests: {
        active: [],
        completed: [],
        failed: [],
      },

      // ── MUNDO ──
      world: {
        current_region: 'atropatene',
        current_location: null,
        unlocked_regions: ['atropatene'],
        visited_locations: [],
        world_flags: {}, // flags booleanas para eventos únicos
      },

      // ── NARRATIVA ──
      narrative: {
        log: [], // histórico de parágrafos exibidos
        flags: {}, // flags narrativos (ex: daryun_knows_truth: false)
        choices_made: [], // registro de escolhas para ramificações
      },

      // ── COMBATE ATIVO ──
      combat: null, // null quando fora de combate

      // ── DIÁLOGO ATIVO ──
      dialogue: null, // null quando fora de diálogo

      // ── ACTIONS ──
      setGamePhase: (phase) => set({ gamePhase: phase }),
      setPlayerClass: (classData) => set((state) => ({
        player: { ...state.player, class: classData.id, attributes: classData.attributes,
          hp: classData.hp_base, hp_max: classData.hp_base, pa: classData.pa_base,
          skills: classData.starting_skills }
      })),
      recruitGeneral: (generalData) => set((state) => ({
        recruited_generals: [...state.recruited_generals, { ...generalData, current_hp: generalData.hp_base }]
      })),
      updateFaction: (factionId, delta) => set((state) => ({
        factions: { ...state.factions,
          [factionId]: Math.max(-100, Math.min(100, state.factions[factionId] + delta)) }
      })),
      addToInventory: (item) => set((state) => ({
        inventory: { ...state.inventory, items: [...state.inventory.items, item] }
      })),
      addGold: (amount) => set((state) => ({
        inventory: { ...state.inventory, gold: state.inventory.gold + amount }
      })),
      startCombat: (combatData) => set({ combat: combatData, gamePhase: 'combat' }),
      endCombat: () => set({ combat: null, gamePhase: 'playing' }),
      startDialogue: (dialogueData) => set({ dialogue: dialogueData, gamePhase: 'dialogue' }),
      endDialogue: () => set({ dialogue: null, gamePhase: 'playing' }),
      addNarrativeLog: (paragraph) => set((state) => ({
        narrative: { ...state.narrative, log: [...state.narrative.log, paragraph] }
      })),
      setNarrativeFlag: (flag, value) => set((state) => ({
        narrative: { ...state.narrative, flags: { ...state.narrative.flags, [flag]: value } }
      })),
      setWorldFlag: (flag, value) => set((state) => ({
        world: { ...state.world, world_flags: { ...state.world.world_flags, [flag]: value } }
      })),
      unlockRegion: (regionId) => set((state) => ({
        world: { ...state.world, unlocked_regions: [...state.world.unlocked_regions, regionId] }
      })),
      addXP: (amount) => set((state) => {
        const newXP = state.player.xp + amount;
        const levelUp = newXP >= state.player.xp_next;
        return {
          player: { ...state.player, xp: levelUp ? newXP - state.player.xp_next : newXP,
            level: levelUp ? state.player.level + 1 : state.player.level,
            xp_next: levelUp ? state.player.xp_next * 1.5 : state.player.xp_next }
        };
      }),
      startQuest: (quest) => set((state) => ({
        quests: { ...state.quests, active: [...state.quests.active, { ...quest, progress: {} }] }
      })),
      completeQuest: (questId) => set((state) => {
        const quest = state.quests.active.find(q => q.id === questId);
        return {
          quests: { active: state.quests.active.filter(q => q.id !== questId),
            completed: [...state.quests.completed, quest], failed: state.quests.failed }
        };
      }),

    }),
    { name: 'arslan-rpg-storage' }
  )
);

export default useGameStore;
```

---

## 18. ENGINE DE COMBATE

```javascript
// combatEngine.js

export const rollDice = (sides, quantity = 1) => {
  let total = 0;
  for (let i = 0; i < quantity; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
};

export const getModifier = (attributeValue) => {
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

export const rollInitiative = (combatants) => {
  return combatants
    .map(c => ({ ...c, initiative: rollDice(20) + getModifier(c.attributes.DES) }))
    .sort((a, b) => b.initiative - a.initiative);
};

export const rollAttack = (attacker, target) => {
  const roll = rollDice(20);
  const isCrit = roll === 20;
  const isFumble = roll === 1;
  const attackMod = getModifier(attacker.attributes.FOR);
  const total = roll + attackMod;
  const hits = isCrit || (!isFumble && total >= target.ca);
  return { roll, total, hits, isCrit, isFumble };
};

export const rollDamage = (attacker, weapon, isCrit = false) => {
  const [quantity, sides, bonus] = parseWeaponDice(weapon.damage);
  const damageMod = getModifier(attacker.attributes.FOR);
  const rolled = rollDice(sides, isCrit ? quantity * 2 : quantity);
  return Math.max(1, rolled + damageMod + (bonus || 0));
};

export const parseWeaponDice = (diceString) => {
  // "2d8+3" → [2, 8, 3]
  const match = diceString.match(/(\d+)d(\d+)([+-]\d+)?/);
  return [parseInt(match[1]), parseInt(match[2]), match[3] ? parseInt(match[3]) : 0];
};

export const applyCondition = (target, condition) => {
  if (target.status_effects.find(e => e.id === condition.id)) return target;
  return { ...target, status_effects: [...target.status_effects, { ...condition, turns_remaining: condition.duration }] };
};

export const processConditions = (combatant) => {
  let hp = combatant.hp;
  const updatedEffects = combatant.status_effects
    .map(effect => {
      if (effect.id === 'sangramento') hp -= rollDice(4);
      if (effect.id === 'veneno') hp -= rollDice(6);
      return { ...effect, turns_remaining: effect.turns_remaining - 1 };
    })
    .filter(effect => effect.turns_remaining > 0);
  return { ...combatant, hp, status_effects: updatedEffects };
};

export const rollSave = (combatant, attribute, dc) => {
  const roll = rollDice(20);
  const mod = getModifier(combatant.attributes[attribute]);
  return (roll + mod) >= dc;
};
```

---

## 19. TELAS E COMPONENTES — RESUMO DE RESPONSABILIDADES

| Tela/Componente | Responsabilidade |
|---|---|
| `TitleScreen` | Menu inicial. Botões: Nova Jogo, Continuar (se hasSave()), Créditos |
| `ClassSelectScreen` | Exibe as 3 fichas de classe. Confirmar → inicia Ato 1 |
| `GameScreen` | Tela principal. NarrativeBox + ChoiceBox. Barra de navegação para outras telas |
| `CombatScreen` | Interface completa de combate por turnos. Overlay sobre GameScreen |
| `DialogueScreen` | Tela de diálogo com NPC. Retrato do NPC, caixa de fala, opções de resposta |
| `MapScreen` | Mapa visual de Pars. Regiões clicáveis. Locais disponíveis na região atual |
| `InventoryScreen` | Itens, equipamentos, ouro. Drag-and-drop para equipar |
| `PartyScreen` | Fichas detalhadas de Arslan e generais recrutados |
| `FactionsScreen` | Barras de reputação de todas as facções. Status de aliança |
| `JournalScreen` | Quests ativas e concluídas. Objetivos marcados |

---

## 20. PRIORIDADE DE IMPLEMENTAÇÃO (MVP)

```
Fase 1 — Fundação
  ✓ Setup Vite + React + Zustand + React Router
  ✓ Theme CSS global (cores, fontes, variáveis)
  ✓ TitleScreen funcional
  ✓ ClassSelectScreen funcional
  ✓ useGameStore completo

Fase 2 — Narrativa
  ✓ GameScreen com NarrativeBox e ChoiceBox
  ✓ narrativeEngine lendo act1_prologue.json
  ✓ Primeiro ato jogável (prólogo até recrutar Daryun)

Fase 3 — Combate
  ✓ CombatScreen completo
  ✓ combatEngine com iniciativa, PA, rolagens, condições
  ✓ Primeiro combate real (Campo de Atropatene)

Fase 4 — Exploração
  ✓ MapScreen com regiões do Ato 1 e 2
  ✓ Sistema de locais e visitas
  ✓ DialogueScreen com primeiro NPC não-essencial

Fase 5 — Progressão
  ✓ InventoryScreen
  ✓ Recrutamento de Narsus e Elam
  ✓ PartyScreen
  ✓ Sistema de facções e FactionsScreen

Fase 6 — Conteúdo
  ✓ Atos 2, 3 e 4 completos
  ✓ Todas as quests secundárias
  ✓ JournalScreen
  ✓ Sistema de save/load polido
```

---

## 21. OBSERVAÇÕES FINAIS PARA O CLAUDE CODE

1. **Sempre manter a estética:** Fundos escuros, dourado, fontes Cinzel/EB Garamond. Nunca usar branco puro ou roxo.

2. **Dados são separados da lógica:** Toda lore, diálogos e stats ficam em `/src/data/`. A engine apenas lê e processa.

3. **Sem magia:** Se qualquer elemento sobrenatural aparecer na narrativa, incluir um `<NarsusNote>` com explicação racional.

4. **Condições de diálogo sempre verificadas:** Antes de renderizar uma opção de diálogo, verificar `condition` do JSON. Opções com rolagem mostram o DC para o jogador saber o risco.

5. **Estado do jogo é a fonte de verdade:** Tudo vem do Zustand. Componentes apenas leem e disparam actions.

6. **Save automático:** Zustand persist já cuida disso via LocalStorage. Manter `name: 'arslan-rpg-storage'`.

7. **Animações sutis mas presentes:** Parágrafos narrativos aparecem com fadeIn. Dano no combate com flash vermelho. Ganhos de XP/reputação com animação de número flutuando.

8. **Mobile-friendly:** Layout responsivo. No mobile, painel lateral vira aba inferior ou drawer.

---

*Documento gerado em: Fevereiro 2026*
*Versão: 1.0.0 — Arslan: A Lenda do Príncipe*
