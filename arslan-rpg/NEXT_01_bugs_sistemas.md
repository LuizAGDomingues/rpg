# ARSLAN NEXT — 01: Bugs e Sistemas a Implementar
> Implementar nesta ordem. Leia os outros arquivos deste conjunto antes de começar conteúdo novo.

---

# ARSLAN RPG — Documento de Evolução Completo
## Bugs, Implementações Faltantes, Melhorias e Conteúdo Massivo

> Leia este documento integralmente antes de implementar qualquer coisa.
> Siga a ordem das fases. Não pule etapas.

---

## PARTE 1 — BUGS E DESCONEXÕES ENCONTRADOS

### Bug 1 — gold_reward em combate nunca é parseado
**Arquivo:** `src/engine/combatEngine.js` → `calculateGoldReward`
**Problema:** `combat.gold_reward` é uma string como `"5d6"` mas a função ignora isso e usa `e.gold || random(6)+1` por inimigo.
**Correção:**
```javascript
// Em combatEngine.js, substituir calculateGoldReward por:
export const calculateGoldReward = (enemies, combatGoldReward) => {
  if (combatGoldReward) {
    const match = String(combatGoldReward).match(/(\d+)d(\d+)([+-]\d+)?/);
    if (match) {
      const [, qty, sides, bonus] = match;
      let total = 0;
      for (let i = 0; i < parseInt(qty); i++) total += Math.floor(Math.random() * parseInt(sides)) + 1;
      return total + (parseInt(bonus || 0));
    }
    const flat = parseInt(combatGoldReward);
    if (!isNaN(flat)) return flat;
  }
  return enemies.reduce((sum, e) => sum + (e.gold || Math.floor(Math.random() * 6) + 1), 0);
};
```
**Chamar em CombatScreen:** `calculateGoldReward(combat.enemies, combat.gold_reward)`

---

### Bug 2 — factionEngine.js e questEngine.js existem mas nunca são importados
**Problema:** As funções `checkFactionUnlocks`, `getAvailableQuests`, `checkQuestCompletion` estão escritas mas nenhum componente as importa. São código morto.
**Correção:**
- `FactionsScreen.jsx` deve importar `getFactionStatus` de `factionEngine` para exibir o label (Hostil/Aliado) no `FactionCard`.
- `JournalScreen.jsx` deve usar `getActiveQuestProgress` para mostrar barra de progresso nas quests ativas.
- `GameScreen.jsx` deve chamar `checkFactionUnlocks` toda vez que uma facção muda, para disparar eventos de milestone (ex: "Aliança com Sindhura estabelecida!").

---

### Bug 3 — Viagem no mapa não dispara eventos narrativos
**Problema:** `MapScreen` chama `store.setCurrentRegion(regionId)` mas nada acontece depois. Não há eventos de chegada, NPCs, ou gatilhos de cena.
**Correção:** Implementar `arrival_scene` nas regiões (ver Parte 3 — Sistema de Localização).

---

### Bug 4 — Side quests não têm caminho de início
**Problema:** `side_quests.json` existe, `questEngine.getAvailableQuests()` existe, mas nenhuma tela chama essa função. Quests secundárias só podem começar via `choice.start_quest` na narrativa, e os JSONs de cena não referenciam as side quests.
**Correção:** NPCs nos locais do mapa oferecem quests (implementar DialogueScreen — ver Parte 2).

---

### Bug 5 — Habilidades Lendárias não têm sistema de uso
**Problema:** `store.player.legendary_skills` existe, as fichas dos generais têm `legendary_skill` definida, mas não há UI de ativação em combate e o desbloqueio via quest não está conectado ao store.
**Correção:** Implementar na Parte 2 — Sistema de Habilidades Especiais.

---

### Bug 6 — Condição `narsus_recruited` no scene JSON falha
**Problema:** Na cena `post_scout_fight` do Ato 3, a condição `"condition": "narsus_recruited"` é avaliada como uma narrative flag (`state.narrative.flags["narsus_recruited"]`), mas o recrutamento usa `state.recruited_generals`. A flag `narsus_recruited` é setada em `set_flags` — isso funciona, MAS depende do jogador ter passado pela cena correta. Se o jogador continuar sem ter setado a flag, a condição falha silenciosamente.
**Correção:** Em `conditions.js`, o evaluator `rec` já trata `(\w+)_recruited` checando `recruited_generals`. Mas a flag também é setada via `set_flags`. Padronizar: remover checagem de narrative flags para `*_recruited` e usar SEMPRE `recruited_generals`. Garantir que todas as cenas que setam `narsus_recruited: true` em `set_flags` também chamem `recruit: "narsus"`.

---

## PARTE 2 — IMPLEMENTAÇÕES FALTANTES

### 2.1 — DialogueScreen (PRIORIDADE MÁXIMA)

**Criar:** `src/components/dialogue/DialogueScreen.jsx` + `.module.css`
**Criar:** `src/components/dialogue/DialogueBox.jsx`
**Criar:** `src/components/dialogue/NPCPortrait.jsx`
**Criar:** `src/data/dialogues/` (pasta com JSONs de NPC)

**Estrutura do componente DialogueScreen:**
```jsx
// DialogueScreen.jsx — renderiza quando gamePhase === 'dialogue'
// Layout:
// ┌─────────────────────────────────────────────┐
// │  [NPCPortrait CSS/SVG — silhueta do NPC]   │
// │                                             │
// │  ┌─────────────────────────────────────┐   │
// │  │ NOME DO NPC                         │   │
// │  │ Titulo / Ocupação                   │   │
// │  │                                     │   │
// │  │ "Texto da fala do NPC aqui..."      │   │
// │  └─────────────────────────────────────┘   │
// │                                             │
// │  [Indicador de Humor: ●●●●○ Amigável]      │
// │                                             │
// │  > Opção de diálogo 1                      │
// │  > Opção de diálogo 2 [CAR 14]             │
// │  > Opção de diálogo 3 [Quest]              │
// │  > Encerrar conversa                       │
// └─────────────────────────────────────────────┘

// Props recebidas do store.dialogue:
// { npcId, currentNodeId, npcData, location }

// Ao fechar: store.endDialogue()
// Ao iniciar quest: store.startQuest(questData)
// Ao completar quest: store.completeQuest(questId)
```

**Sistema de Humor do NPC:**
```javascript
// Humor calculado em tempo real:
const getNPCMood = (npcId, gameState) => {
  const npc = npcData[npcId];
  const baseMood = npc.base_mood; // 'neutral'
  const factionRep = gameState.factions[npc.faction];
  if (factionRep >= 50) return 'friendly';
  if (factionRep <= -50) return 'hostile';
  if (gameState.narrative.flags[`helped_${npcId}`]) return 'friendly';
  if (gameState.narrative.flags[`offended_${npcId}`]) return 'suspicious';
  return baseMood;
};
```

**NPCPortrait — silhuetas CSS:**
Cada NPC tem uma silhueta gerada por SVG embutido no componente. Não usar imagens externas.
```jsx
// Exemplo de silhueta para ferreiro
const portraits = {
  blacksmith: <svg>...</svg>,  // silhueta robusta com avental
  merchant: <svg>...</svg>,    // silhueta com chapéu e bolsa
  soldier: <svg>...</svg>,     // silhueta com armadura
  refugee: <svg>...</svg>,     // silhueta curvada, cansada
  noble: <svg>...</svg>,       // silhueta ereta com coroa
};
```

---

### 2.2 — Sistema de Localização (Locais do Mapa Vivos)

**Problema atual:** `MapScreen` mostra locais como texto estático. Nenhum local é clicável.

**Implementar:**
```javascript
// MapScreen deve mostrar locais da região atual como botões
// Cada local tem NPCs associados e eventos de chegada

// Estrutura do local em locations.json (já existe, expandir):
{
  "id": "ferreiro_kashan",
  "name": "Ferreiro de Kashan",
  "region": "kashan",
  "description": "Uma forja barulhenta que nunca para de trabalhar",
  "arrival_scene": null,           // cena narrativa ao chegar (opcional)
  "npcs": ["kaveh_blacksmith"],    // NPCs disponíveis aqui
  "shop": true,                    // tem loja
  "rest": false,                   // pode descansar aqui
  "unlock_condition": "act2_complete"
}

// Ao clicar num local:
// 1. Se tem arrival_scene → dispara cena narrativa
// 2. Mostra lista de NPCs disponíveis
// 3. Clicar num NPC → store.startDialogue({ npcId, location })
```

---

### 2.3 — Sistema de Habilidades Especiais em Combate

**Expandir CombatScreen para incluir habilidades:**

```jsx
// Novo botão na ActionBar: "⚡ Habilidade"
// Abre submenu com habilidades do personagem ativo

// Estrutura de habilidade:
{
  "id": "golpe_poderoso",
  "name": "Golpe Poderoso",
  "pa_cost": 2,
  "description": "Ataque com +2d6 de dano extra",
  "effect": "bonus_damage",
  "bonus_dice": "2d6",
  "cooldown": 0,          // 0 = sem cooldown, N = N turnos
  "target": "enemy"       // enemy | ally | self
}

// Habilidades Lendárias têm uses_per_combat: 1
// Mostrar contador de usos restantes no botão
```

**Skills por classe (expandir em warrior.json, diplomat.json, strategist.json):**
Cada skill precisa ter seu objeto completo com efeito mecânico, não só o nome string.

---

### 2.4 — Sistema de Descanso

```javascript
// Ao clicar em local com "rest": true no mapa:
// Opções: Descanso Curto (1h) ou Descanso Longo (8h)

// Descanso Curto: recupera 1/4 do HP máximo. Sem custo.
// Descanso Longo: recupera HP total. Custa 1 unidade de Mantimento (item consumível).
// Mantimentos são obtidos em combates e comprados em vendedores.

// Armazenar em store: inventory.rations (número)
// Adicionar à UI do inventário
```

---

### 2.5 — Sistema de Loja

```javascript
// NPCs com shop: true abrem tela de compra no diálogo

// ShopScreen (modal dentro do DialogueScreen):
// Lista de itens do NPC com preços
// Botão Comprar: store.addGold(-price), store.addToInventory(item)
// Botão Vender: store.addGold(item.sell_price), store.removeFromInventory(uid)

// Preço de venda = 50% do valor base do item
```

---

### 2.6 — Sistema de Saves Múltiplos + Autosave

```javascript
// saveEngine.js — expandir para 3 slots de save + autosave
const SAVES = {
  slot1: 'arslan_save_1',
  slot2: 'arslan_save_2',
  slot3: 'arslan_save_3',
  auto: 'arslan_autosave',
};

// Autosave dispara:
// - Ao avançar de cena
// - Ao terminar um combate
// - Ao abrir o mapa

// SettingsScreen já existe — adicionar gestão de saves lá
```

---

### 2.7 — Tela de Game Over

```javascript
// Quando Arslan chega a 0 HP no combate e não é estabilizado:
// Não chamar store.endCombat() direto
// Transição para GameOverScreen com opção de:
// - Carregar último autosave
// - Voltar ao menu principal

// CombatScreen: se result.type === 'defeat', mostrar GameOverScreen
```

---

### 2.8 — Notificações de Milestone de Facções

```javascript
// Em GameScreen, após toda escolha, verificar checkFactionUnlocks()
// Se uma facção cruzou um limiar (+50 ou +80):
// Exibir banner animado: "⚜ Aliança Estabelecida: Nobreza de Pars"
// O banner some após 3s

// Implementar componente FactionMilestoneBanner.jsx
// Exibido acima dos ResultBadges no GameScreen
```

---

## PARTE 3 — MELHORIAS ADICIONAIS

### 3.1 — Animações e Feedback Visual

```css
/* CombatScreen: flash vermelho no card ao receber dano */
@keyframes damageFlash {
  0% { background: rgba(183, 28, 28, 0.5); }
  100% { background: transparent; }
}
.damagedCard { animation: damageFlash 0.4s ease; }

/* ResultBadge: slide up ao aparecer */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* HP Bar: transição suave ao diminuir */
.barFill { transition: width 0.6s ease; }

/* FactionBar: pisca dourado ao ganhar reputação */
@keyframes repGain {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: 0 0 12px var(--gold); }
}
```

### 3.2 — Música de Fundo (Web Audio API)

```javascript
// src/engine/audioEngine.js
// Sem assets externos. Gerar música procedural com Web Audio API.
// Três temas:
// - exploration: arpejo suave em dó menor, 60bpm
// - combat: percussão rítmica, tensão, 120bpm
// - dialogue: melodia de flauta simples
// - victory: fanfarra curta de 3 notas

// Controle de volume em SettingsScreen
// Toggle de mutar
```

### 3.3 — Indicador de Progresso do Ato

```jsx
// GameScreen — barra fina no topo mostrando progresso no ato atual
// Calculado por: cenas visitadas / total de cenas do ato
// Não spoila nada — só mostra visualmente quanto do ato foi explorado
```

### 3.4 — Glossário de Arslan Senki

```javascript
// Componente Tooltip em palavras-chave da narrativa
// Ex: ao passar o mouse em "Yaldabaoth" → popup com explicação
// Ao passar em "Atropatene" → popup com descrição histórica
// JSON: src/data/glossary.json

// Termos importantes para glossário:
// Pars, Ecbatana, Atropatene, Lusitanos, Yaldabaoth, Mithra,
// Sindhura, Turan, Daryun, Narsus, Silvermask/Hermes,
// Rukhnabad (com Nota de Narsus!), Andragoras, Tahamine
```

### 3.5 — Sistema de Reputação Visível

```jsx
// Em toda tela que mostra facção, exibir o efeito atual de cada status:
// Hostil (-100 a -50): "⚠ Atacam acampamentos. Inimigos ativos."
// Frio (-49 a 0): "Neutros. Não ajudam."
// Cauteloso (1 a 49): "Cooperam sob pressão."
// Respeitoso (50 a 79): "Enviam soldados quando solicitado."
// Aliado (80 a 100): "Lealdade total. Tropas e recursos disponíveis."
```

### 3.6 — Contador de Tropas

```javascript
// store.world.troop_count: número de soldados sob o comando de Arslan
// Começa em 0. Cresce com alianças e quests.
// Exibido na tela principal como: "⚔ Exército: 847 soldados"
// Contribuições:
//   nobreza_pars >= 80: +500
//   kashan alliance full: +500, partial: +200
//   escravos_libertos >= 50: +300
//   sindhura >= 75: +400 (elefantes de guerra)
//   turan >= 65: +300 (cavalaria)
// Calculado dinamicamente via selector do Zustand
```

---
