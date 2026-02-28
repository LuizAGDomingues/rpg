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

## PARTE 4 — CONTEÚDO MASSIVO

### 4.1 — NPCs COMPLETOS (16 novos NPCs)

```json
// src/data/npcs/npcs.json

[
  {
    "id": "kaveh_blacksmith",
    "name": "Kaveh",
    "title": "Ferreiro de Kashan",
    "location": "ferreiro_kashan",
    "faction": "nobreza_pars",
    "base_mood": "suspicious",
    "portrait_type": "blacksmith",
    "description": "Velho ferreiro de mãos calejadas. Trabalhou para o exército de Pars por 30 anos. Perdeu o filho em Atropatene.",
    "shop_items": ["sword_iron", "sword_steel", "spear_war", "armor_chain", "shield_iron", "bandage", "potion_minor"],
    "dialogue_tree": "kaveh_dialogue",
    "quest_giver": ["sq_kaveh_son", "sq_stolen_steel"],
    "dialogue_tags": ["any"]
  },
  {
    "id": "rania_healer",
    "name": "Rania",
    "title": "Curandeira do Acampamento",
    "location": "tenda_arslan",
    "faction": "escravos_libertos",
    "base_mood": "friendly",
    "portrait_type": "healer",
    "description": "Ex-escrava liberta que aprendeu medicina com um médico persa. Cura os feridos do acampamento. Leal a Arslan por ele ter libertado sua aldeia.",
    "shop_items": ["potion_minor", "potion_standard", "antidote", "bandage", "herbal_tea"],
    "dialogue_tree": "rania_dialogue",
    "quest_giver": ["sq_rania_herbs", "sq_missing_medicine"],
    "dialogue_tags": ["any"]
  },
  {
    "id": "shapur_merchant",
    "name": "Shapur",
    "title": "Mercador Errante",
    "location": "mercado_sindhura",
    "faction": "sindhura",
    "base_mood": "neutral",
    "portrait_type": "merchant",
    "description": "Mercador de Sindhura que percorre as rotas comerciais há 20 anos. Sabe de tudo o que acontece nos reinos vizinhos. Seu lealdade vai para quem paga mais — mas pode ser conquistada.",
    "shop_items": ["exotic_spice", "silk_rope", "smoke_bomb", "poison_arrow", "sindhuri_blade"],
    "dialogue_tree": "shapur_dialogue",
    "quest_giver": ["sq_shapur_escort", "sq_stolen_cargo"],
    "dialogue_tags": ["any"]
  },
  {
    "id": "hodir_lord",
    "name": "Lord Hodir",
    "title": "Senhor de Kashan",
    "location": "salao_lord",
    "faction": "nobreza_pars",
    "base_mood": "cautious",
    "portrait_type": "noble",
    "description": "Nobre de Pars, pragmático e orgulhoso. Resistiu aos lusitanos por meses, mais por teimosia do que por heroísmo. Avalia Arslan como um investimento.",
    "shop_items": [],
    "dialogue_tree": "hodir_dialogue",
    "quest_giver": ["sq_hodir_spy", "sq_noble_debt"],
    "dialogue_tags": ["warrior", "strategist", "diplomat"]
  },
  {
    "id": "etoile_lusitana",
    "name": "Etoile",
    "title": "Soldada Lusitana",
    "location": "fronteira_sul",
    "faction": "lusitanos_moderados",
    "base_mood": "suspicious",
    "portrait_type": "soldier",
    "description": "Jovem soldada lusitana que questiona a guerra santa. Acredita em Yaldabaoth mas não na violência indiscriminada. Encontra-se com Arslan em segredo. Potencial aliada crucial.",
    "shop_items": [],
    "dialogue_tree": "etoile_dialogue",
    "quest_giver": ["sq_etoile_letter", "sq_lusitano_deserter"],
    "dialogue_tags": ["diplomat"]
  },
  {
    "id": "sam_warrior",
    "name": "Sam",
    "title": "Veterano de Pars",
    "location": "area_treino",
    "faction": "nobreza_pars",
    "base_mood": "neutral",
    "portrait_type": "soldier",
    "description": "Veterano de 50 anos que sobreviveu a três guerras. Ensinava esgrima no exército antes da queda. Agora treina os recrutas no acampamento de Arslan. Não tem paciência para fraqueza.",
    "shop_items": ["training_sword", "practice_shield"],
    "dialogue_tree": "sam_dialogue",
    "quest_giver": ["sq_sam_training_quest", "sq_veterans_blade"],
    "dialogue_tags": ["warrior"]
  },
  {
    "id": "azrael_priest",
    "name": "Padre Azrael",
    "title": "Sacerdote de Mithra",
    "location": "templo_mithra",
    "faction": "clero_mithra",
    "base_mood": "neutral",
    "portrait_type": "priest",
    "description": "Sacerdote idoso que escondeu os tesouros do Templo de Mithra antes da invasão. Guarda segredos sobre a linhagem real de Pars — e sobre quem Arslan realmente é.",
    "shop_items": ["sacred_incense", "blessed_bandage", "prayer_scroll"],
    "dialogue_tree": "azrael_dialogue",
    "quest_giver": ["sq_sacred_relics", "sq_truth_of_arslan"],
    "dialogue_tags": ["any"]
  },
  {
    "id": "mina_refugee",
    "name": "Mina",
    "title": "Refugiada de Ecbatana",
    "location": "campo_batalha",
    "faction": "escravos_libertos",
    "base_mood": "fearful",
    "portrait_type": "refugee",
    "description": "Mulher que fugiu de Ecbatana com sua filha pequena. Seu marido, um soldado de Pars, desapareceu após Atropatene. Vive no acampamento de refugiados, esperando notícias.",
    "shop_items": [],
    "dialogue_tree": "mina_dialogue",
    "quest_giver": ["sq_mina_husband"],
    "dialogue_tags": ["any"]
  },
  {
    "id": "jahan_spy",
    "name": "Jahan",
    "title": "Informante",
    "location": "taberna_dahman",
    "faction": "sindhura",
    "base_mood": "suspicious",
    "portrait_type": "merchant",
    "description": "Ninguém sabe para quem Jahan realmente trabalha. Ele mesmo diz ser apenas um viajante. Mas suas informações sobre movimentação de tropas lusitanas são sempre precisas — e sempre têm um preço.",
    "shop_items": ["intel_map_north", "intel_map_south", "spy_dagger"],
    "dialogue_tree": "jahan_dialogue",
    "quest_giver": ["sq_jahan_contract", "sq_double_agent"],
    "dialogue_tags": ["strategist"]
  },
  {
    "id": "daria_slave",
    "name": "Daria",
    "title": "Escrava Liberta",
    "location": "acampamento_base",
    "faction": "escravos_libertos",
    "base_mood": "cautious",
    "portrait_type": "refugee",
    "description": "Uma das primeiras escravas libertadas por Arslan. Ex-escrava de uma família nobre de Pars. Inteligente e determinada, tornou-se a porta-voz dos libertos no acampamento. Pode criar a facção Escravos Libertos se Arslan der apoio suficiente.",
    "shop_items": [],
    "dialogue_tree": "daria_dialogue",
    "quest_giver": ["sq_free_slaves", "sq_daria_manifesto", "sq_liberation_network"],
    "dialogue_tags": ["diplomat"]
  },
  {
    "id": "bahram_turan",
    "name": "Bahram",
    "title": "Guerreiro de Turan",
    "location": "estepe_norte",
    "faction": "turan",
    "base_mood": "hostile",
    "portrait_type": "warrior",
    "description": "Líder de uma pequena tribo de cavaleiros de Turan. Testarúdo, honrado, e desconfiante de sedentários. Respeita apenas força e coragem demonstrados em combate. Pode se tornar um aliado valioso — se você provar seu valor.",
    "shop_items": ["turan_horse_bow", "turan_saber", "steppe_armor"],
    "dialogue_tree": "bahram_dialogue",
    "quest_giver": ["sq_turan_duel", "sq_stolen_horses"],
    "dialogue_tags": ["warrior"]
  },
  {
    "id": "yusuf_scholar",
    "name": "Yusuf",
    "title": "Erudito Errante",
    "location": "ruinas_acampamento",
    "faction": "clero_mithra",
    "base_mood": "friendly",
    "portrait_type": "scholar",
    "description": "Estudioso que coleta manuscritos e conhecimento por toda Pars. Amigo de Narsus de longa data. Sabe sobre a Pedra de Rukhnabad, os aquedutos de Ecbatana e os segredos da família real. Oferece contexto lore profundo.",
    "shop_items": ["ancient_map", "medical_tome", "military_treatise"],
    "dialogue_tree": "yusuf_dialogue",
    "quest_giver": ["sq_lost_manuscripts", "sq_rukhnabad_secret"],
    "dialogue_tags": ["strategist", "diplomat"]
  },
  {
    "id": "farid_cook",
    "name": "Farid",
    "title": "Cozinheiro do Acampamento",
    "location": "cozinha_campo",
    "faction": "escravos_libertos",
    "base_mood": "friendly",
    "portrait_type": "commoner",
    "description": "Ex-escravo que trabalhava na cozinha do palácio real. Sabe de todos os segredos que eram ditos perto dos serviçais — que os nobres sempre ignoram. Uma fonte inesperada de inteligência política.",
    "shop_items": ["ration", "hearty_stew", "dried_meat"],
    "dialogue_tree": "farid_dialogue",
    "quest_giver": ["sq_palace_secrets", "sq_farid_family"],
    "dialogue_tags": ["any"]
  },
  {
    "id": "ishtar_dancer",
    "name": "Ishtar",
    "title": "Dançarina e Informante",
    "location": "mercado_ecbatana",
    "faction": "escravos_libertos",
    "base_mood": "neutral",
    "portrait_type": "performer",
    "description": "Dançarina que usou sua posição nos salões dos nobres lusitanos para coletar informações. Trabalha para a resistência de Ecbatana. Só pode ser acessada no Ato 4 após o cerco iniciar.",
    "shop_items": [],
    "dialogue_tree": "ishtar_dialogue",
    "quest_giver": ["sq_resistance_ecbatana", "sq_palace_blueprint"],
    "dialogue_tags": ["diplomat", "strategist"]
  },
  {
    "id": "commander_vahriz",
    "name": "Vahriz",
    "title": "Comandante Caído",
    "location": "campo_batalha",
    "faction": "nobreza_pars",
    "base_mood": "neutral",
    "portrait_type": "soldier",
    "description": "Comandante ferido encontrado no campo de Atropatene. Lutou até o fim ao lado do Rei. Sabe como Kharlan traiu o exército. Pode revelar detalhes sobre o que realmente aconteceu na batalha — e sobre o passado de Arslan.",
    "shop_items": [],
    "dialogue_tree": "vahriz_dialogue",
    "quest_giver": ["sq_truth_of_atropatene", "sq_vahriz_sword"],
    "dialogue_tags": ["any"]
  },
  {
    "id": "zahra_witch",
    "name": "Zahra",
    "title": "Herbalista Misteriosa",
    "location": "floresta_sul",
    "faction": "clero_mithra",
    "base_mood": "mysterious",
    "portrait_type": "mystic",
    "description": "Velha herbalista que vive na floresta ao sul de Dahman. Dizem que ela é bruxa — Narsus tem uma explicação racional: ela usa ervas alucinógenas para criar suas 'visões'. Vende ingredientes raros e poções de efeitos únicos.",
    "shop_items": ["vision_herb", "paralysis_extract", "fire_oil", "antidote_strong", "elixir_strength"],
    "dialogue_tree": "zahra_dialogue",
    "quest_giver": ["sq_zahras_curse", "sq_rare_herbs"],
    "narsus_note": "O que Zahra chama de 'maldição' é intoxicação por vapores de enxofre de uma fissura geológica sob sua cabana. A 'cura' é simplesmente evacuar o local por 48 horas.",
    "dialogue_tags": ["any"]
  }
]
```

---

### 4.2 — DIÁLOGOS COMPLETOS DOS NPCs

```json
// src/data/dialogues/kaveh_dialogue.json
{
  "id": "kaveh_dialogue",
  "npc": "kaveh_blacksmith",
  "nodes": [
    {
      "id": "start",
      "text": "Não atendo qualquer um. O que você quer, rapaz?",
      "mood_check": true,
      "branches": {
        "hostile": { "text": "Príncipe ou não, não tenho nada para você. Saia." },
        "suspicious": { "text": "Não atendo qualquer um. O que você quer, rapaz?" },
        "friendly": { "text": "Ah, o Príncipe. Que posso fazer por você hoje?" }
      },
      "options": [
        { "id": "buy", "text": "Quero ver suas mercadorias.", "leads_to": "shop" },
        { "id": "ask_atropatene", "text": "Você perdeu alguém em Atropatene?", "leads_to": "kaveh_grief", "condition": null },
        { "id": "ask_quest", "text": "Preciso de uma arma especial. Tem como fazer uma?", "leads_to": "kaveh_commission", "condition": "level >= 3" },
        { "id": "persuade", "text": "[CAR 12] Ouvi dizer que você conhece tudo que acontece em Kashan.", "leads_to": "kaveh_info", "condition": "CAR >= 12", "roll": { "attribute": "CAR", "dc": 12 } },
        { "id": "exit", "text": "Até mais.", "leads_to": "exit" }
      ]
    },
    {
      "id": "kaveh_grief",
      "text": "Meu filho. Fardad. Tinha 19 anos quando marchou para Atropatene. Não voltou. Nenhum dos meninos de Kashan voltou.",
      "options": [
        { "id": "condolences", "text": "Sinto muito. Prometo que a morte de Fardad não será esquecida.", "leads_to": "kaveh_softened", "faction_effect": { "nobreza_pars": 3 } },
        { "id": "ask_quest_son", "text": "Posso tentar descobrir o que aconteceu com ele.", "leads_to": "kaveh_quest_offer" },
        { "id": "back", "text": "Voltar.", "leads_to": "start" }
      ]
    },
    {
      "id": "kaveh_quest_offer",
      "text": "Você... faria isso? No campo de Atropatene, há uma placa de identificação que Fardad usava. Era de bronze com o emblema da nossa família. Se puder trazer...",
      "options": [
        { "id": "accept_quest", "text": "Trarei a placa de Fardad.", "leads_to": "quest_accepted", "start_quest": "sq_kaveh_son" },
        { "id": "decline", "text": "Não posso prometer isso agora.", "leads_to": "start" }
      ]
    },
    {
      "id": "kaveh_softened",
      "text": "Hm. Um príncipe que escuta. Raro. O que você precisar da minha forja, príncipe, terá desconto.",
      "options": [
        { "id": "buy_discount", "text": "Obrigado, Kaveh. Ver suas mercadorias.", "leads_to": "shop" },
        { "id": "exit", "text": "Obrigado.", "leads_to": "exit" }
      ]
    },
    {
      "id": "kaveh_info",
      "text": "Hm. Você tem bons olhos, príncipe. Sim, eu ouço muita coisa nesta forja. Dizem que há um espião lusitano em Kashan — alguém na corte de Hodir. Não sei quem, mas quando ouço cochichar perto da minha porta à noite...",
      "options": [
        { "id": "ask_more", "text": "Conte mais.", "leads_to": "kaveh_spy_info", "start_quest": "sq_hodir_spy" },
        { "id": "thanks", "text": "Vou investigar isso.", "leads_to": "exit" }
      ]
    }
  ]
}
```

```json
// src/data/dialogues/narsus_dialogue.json (diálogo no acampamento)
{
  "id": "narsus_dialogue",
  "npc": "narsus",
  "location": "tenda_arslan",
  "nodes": [
    {
      "id": "start",
      "text": "Ah, Arslan. Precisa de mais algum milagre estratégico? Ou veio admirer minha pintura mais recente?",
      "options": [
        { "id": "ask_strategy", "text": "Preciso do seu conselho sobre os lusitanos.", "leads_to": "narsus_strategy_advice" },
        { "id": "painting", "text": "Mostre-me a pintura.", "leads_to": "narsus_painting_quest", "start_quest": "sq_narsus_painting", "condition": "NOT saw_painting" },
        { "id": "ask_past", "text": "Por que você foi exilado, Narsus?", "leads_to": "narsus_backstory", "condition": "narsus_recruited" },
        { "id": "legendary_quest", "text": "Daryun me contou sobre um plano que você nunca implementou...", "leads_to": "narsus_legendary_start", "condition": "level >= 5 AND narsus_recruited AND NOT quest_narsus_legendary_active" },
        { "id": "exit", "text": "Nada por enquanto.", "leads_to": "exit" }
      ]
    },
    {
      "id": "narsus_backstory",
      "text": "Defendi que Pars deveria abolir a escravatura. O Rei Andragoras considerou isso uma ameaça à ordem social. Fui exilado. E honestamente? Fui feliz em Dahman. Até vocês aparecerem.",
      "options": [
        { "id": "agree_slavery", "text": "Você estava certo. Pars tem que mudar.", "leads_to": "narsus_respect", "faction_effect": { "escravos_libertos": 5, "nobreza_pars": -3 }, "condition": "class == diplomat" },
        { "id": "pragmatic", "text": "A escravatura é errada, mas muda gradualmente. Precisamos do trono primeiro.", "leads_to": "narsus_pragmatic_response", "condition": "class == strategist" },
        { "id": "back", "text": "Entendo.", "leads_to": "start" }
      ]
    }
  ]
}
```

---

### 4.3 — QUESTS SECUNDÁRIAS COMPLETAS (23 novas quests)

```json
// src/data/quests/side_quests_expanded.json — SUBSTITUIR side_quests.json

[
  {
    "id": "sq_kaveh_son",
    "name": "A Placa de Fardad",
    "type": "side_quest",
    "giver_npc": "kaveh_blacksmith",
    "act": 1,
    "description": "Kaveh, o ferreiro de Kashan, perdeu seu filho Fardad em Atropatene. Ele pede que você encontre a placa de identificação de bronze do filho no campo de batalha.",
    "objectives": [
      { "id": "obj1", "text": "Visitar as Ruínas de Atropatene" },
      { "id": "obj2", "text": "Encontrar a placa de identificação de Fardad" },
      { "id": "obj3", "text": "Derrotar os saqueadores que guardam a área" },
      { "id": "obj4", "text": "Devolver a placa a Kaveh" }
    ],
    "start_condition": "arrived_dahman",
    "combat": {
      "enemies": [
        { "name": "Saqueador Lusitano", "hp": 12, "ca": 12, "pa": 2, "weapon": { "name": "Adaga", "damage": "1d4+1" } },
        { "name": "Saqueador Lusitano", "hp": 12, "ca": 12, "pa": 2, "weapon": { "name": "Adaga", "damage": "1d4+1" } }
      ],
      "xp_reward": 80
    },
    "rewards": {
      "xp": 200,
      "gold": 60,
      "item": { "id": "kaveh_sword", "name": "Espada de Fardad", "type": "weapon", "damage": "1d8+2", "bonus_atk": 2, "description": "Forjada por Kaveh para seu filho. Carrega o peso da perda e da memória." },
      "faction_effects": { "nobreza_pars": 10 },
      "npc_loyalty_change": { "kaveh_blacksmith": "friendly" },
      "lore_unlock": "truth_of_atropatene_partial"
    }
  },
  {
    "id": "sq_mina_husband",
    "name": "A Família Separada",
    "type": "side_quest",
    "giver_npc": "mina_refugee",
    "act": 1,
    "description": "Mina, uma refugiada de Ecbatana, perdeu o marido Tariq após a batalha. Investigue o que aconteceu com ele nos campos ao sul.",
    "objectives": [
      { "id": "obj1", "text": "Falar com Mina no acampamento de refugiados" },
      { "id": "obj2", "text": "Investigar o posto de prisioneiros lusitano" },
      { "id": "obj3", "text": "Libertar Tariq ou descobrir seu destino" }
    ],
    "start_condition": "act1_complete",
    "branches": {
      "found_alive": {
        "combat": { "enemies": [{ "name": "Guarda Lusitano", "hp": 16, "ca": 13, "pa": 2, "weapon": { "name": "Lança", "damage": "1d8+1" } }] },
        "outcome": "Tariq está vivo. Libertar ele do cativeiro lusitano.",
        "rewards_extra": { "faction_effects": { "escravos_libertos": 15 } }
      },
      "found_dead": {
        "outcome": "Tariq morreu em combate. Trazer seus pertences para Mina.",
        "rewards_extra": { "faction_effects": { "escravos_libertos": 10, "clero_mithra": 5 } }
      }
    },
    "rewards": {
      "xp": 150,
      "gold": 0,
      "faction_effects": { "escravos_libertos": 10 }
    }
  },
  {
    "id": "sq_narsus_painting",
    "name": "A Obra-Prima de Narsus",
    "type": "side_quest",
    "giver_npc": "narsus",
    "act": 2,
    "description": "Narsus insiste que você aprecie sua pintura mais recente. Segundo Elam, é o pior trabalho que ele já viu. Daryun se recusou a olhar.",
    "objectives": [
      { "id": "obj1", "text": "Ver a pintura de Narsus" },
      { "id": "obj2", "text": "Dar uma opinião honesta (ou diplomática)" }
    ],
    "start_condition": "narsus_recruited",
    "choices": [
      { "id": "honest", "text": "É... única, Narsus.", "result": "Narsus ri. Elam cochicha 'Isso é eufemismo'.", "effect": { "narsus_mood": "amused" } },
      { "id": "compliment_class", "text": "[Diplomata] É uma obra ousada de visão experimental.", "condition": "class == diplomat", "result": "Narsus parece genuinamente satisfeito pela primeira vez.", "effect": { "narsus_mood": "pleased", "faction_effects": { "clero_mithra": 3 } } },
      { "id": "brutal", "text": "É terrível, Narsus.", "result": "Silêncio. Daryun ri pela primeira vez em semanas.", "effect": { "narsus_mood": "offended_but_respects_honesty" } }
    ],
    "rewards": {
      "xp": 50,
      "item": { "id": "narsus_painting_gift", "name": "Pintura de Narsus", "type": "key_item", "description": "Uma pintura de qualidade... questionável. Narsus diz que vai valer fortunas no futuro." },
      "unlock_dialogue": "narsus_personal_story"
    }
  },
  {
    "id": "sq_daryun_legendary",
    "name": "A Promessa do Guerreiro Negro",
    "type": "side_quest",
    "giver_npc": "daryun",
    "act": 2,
    "description": "Daryun menciona uma promessa feita ao pai de Arslan antes da guerra. Ele precisa recuperar a Lança Sagrada da família, capturada em Atropatene, para honrá-la.",
    "objectives": [
      { "id": "obj1", "text": "Conversar com Daryun no acampamento sobre a promessa" },
      { "id": "obj2", "text": "Viajar às Ruínas de Atropatene" },
      { "id": "obj3", "text": "Derrotar o Capitão Lusitano que guarda o depósito de armas" },
      { "id": "obj4", "text": "Recuperar a Lança Sagrada de Pars" }
    ],
    "start_condition": "narsus_recruited AND act2_started",
    "combat": {
      "name": "Guarda do Depósito",
      "enemies": [
        { "name": "Capitão Lusitano de Elite", "hp": 40, "ca": 17, "pa": 3, "attributes": { "FOR": 16, "DES": 14, "CON": 15, "INT": 11, "SAB": 10, "CAR": 12 }, "weapon": { "name": "Espada de Duas Mãos", "damage": "2d6+3" }, "on_hit_effect": { "name": "bleed", "duration": 2 }, "on_hit_chance": 0.25 },
        { "name": "Guarda de Elite", "hp": 22, "ca": 15, "pa": 2, "weapon": { "name": "Espada Longa", "damage": "1d8+2" } }
      ],
      "xp_reward": 250
    },
    "rewards": {
      "xp": 400,
      "item": { "id": "sacred_spear", "name": "Lança Sagrada de Pars", "type": "weapon", "damage": "1d12+4", "bonus_atk": 3, "equippable_by": ["daryun"], "description": "A lança ancestral dos guerreiros de Pars. Forjada há 200 anos. Carrega o peso de um juramento." },
      "legendary_skill_unlock": { "character": "daryun", "skill": "lanca_dos_mil_exercitos" },
      "faction_effects": { "nobreza_pars": 10 }
    }
  },
  {
    "id": "sq_elam_past",
    "name": "As Cicatrizes de Elam",
    "type": "side_quest",
    "giver_npc": "elam",
    "act": 2,
    "description": "Elam carrega cicatrizes visíveis de sua vida antes de Narsus. Ao se aproximar, você descobre que ele foi escravo. Investigar seu passado pode fortalecer os laços do grupo.",
    "objectives": [
      { "id": "obj1", "text": "Notar as cicatrizes de Elam durante treino" },
      { "id": "obj2", "text": "Ganhar confiança suficiente para ele contar sua história [SAB 12]" },
      { "id": "obj3", "text": "Encontrar o ex-dono de Elam no vilarejo de Dahman" }
    ],
    "start_condition": "narsus_recruited AND camp_established",
    "branches": {
      "confront": {
        "combat": { "enemies": [{ "name": "Mercador Corrupto", "hp": 15, "ca": 12, "pa": 2, "weapon": { "name": "Faca", "damage": "1d4+1" } }] },
        "outcome": "Confrontar o ex-dono de Elam diretamente.",
        "rewards_extra": { "faction_effects": { "escravos_libertos": 10 } }
      },
      "legal": {
        "outcome": "Usar influência de Arslan para invalidar o registro de escravidão de Elam legalmente.",
        "condition": "class == diplomat",
        "rewards_extra": { "faction_effects": { "escravos_libertos": 15, "nobreza_pars": 5 } }
      }
    },
    "rewards": {
      "xp": 250,
      "legendary_skill_unlock": { "character": "elam", "skill": "olhos_nas_sombras" },
      "unlock_dialogue": "elam_full_story",
      "faction_effects": { "escravos_libertos": 15 }
    }
  },
  {
    "id": "sq_gieve_debt",
    "name": "A Dívida do Menestrel",
    "type": "side_quest",
    "giver_npc": "gieve",
    "act": 3,
    "description": "Gieve deve uma quantia enorme a um senhor de guerra de Sindhura por uma aposta de jogo que deu terrivelmente errado. O credor mandou assassinos. Gieve precisa de ajuda para resolver isso — de uma forma ou de outra.",
    "objectives": [
      { "id": "obj1", "text": "Ouvir o problema de Gieve" },
      { "id": "obj2", "text": "Localizar o agente do credor em Sindhura" },
      { "id": "obj3", "text": "Resolver a dívida de Gieve" }
    ],
    "start_condition": "gieve_recruited",
    "branches": {
      "pay": {
        "cost_gold": 200,
        "outcome": "Pagar a dívida de Gieve com o tesouro do grupo.",
        "rewards_extra": { "gieve_loyalty": "+20" }
      },
      "fight": {
        "combat": { "enemies": [{ "name": "Assassino de Sindhura", "hp": 18, "ca": 14, "pa": 3, "weapon": { "name": "Cimitarra", "damage": "1d8+3" }, "on_hit_effect": { "name": "poison", "duration": 3 }, "on_hit_chance": 0.35 }, { "name": "Assassino de Sindhura", "hp": 18, "ca": 14, "pa": 3, "weapon": { "name": "Cimitarra", "damage": "1d8+3" } }], "xp_reward": 200 },
        "outcome": "Derrotar os assassinos enviados para matar Gieve.",
        "rewards_extra": { "faction_effects": { "sindhura": -10 } }
      },
      "negotiate": {
        "condition": "class == diplomat AND CAR >= 15",
        "outcome": "Negociar um perdão da dívida em troca de favores futuros de Arslan.",
        "rewards_extra": { "faction_effects": { "sindhura": 10 } }
      }
    },
    "rewards": {
      "xp": 300,
      "legendary_skill_unlock": { "character": "gieve", "skill": "flecha_do_destino" }
    }
  },
  {
    "id": "sq_falangies_honor",
    "name": "Honra da Cavalaria",
    "type": "side_quest",
    "giver_npc": "falangies",
    "act": 3,
    "description": "Falangies foi expulsa desonrosamente de sua unidade de cavalaria por um comandante corrupto que queria seu posto. Ela quer provar seu valor em um torneio.",
    "objectives": [
      { "id": "obj1", "text": "Ouvir a história de Falangies" },
      { "id": "obj2", "text": "Registrar Falangies no Torneio de Kashan" },
      { "id": "obj3", "text": "Apoiá-la durante o torneio" },
      { "id": "obj4", "text": "Enfrentar o comandante corrupto na final" }
    ],
    "start_condition": "falangies_recruited AND full_kashan_alliance",
    "combat": {
      "name": "Final do Torneio",
      "enemies": [{ "name": "Comandante Bahador", "hp": 45, "ca": 16, "pa": 3, "attributes": { "FOR": 16, "DES": 15, "CON": 14, "INT": 12, "SAB": 10, "CAR": 13 }, "weapon": { "name": "Arco de Guerra", "damage": "1d10+3", "bonus_atk": 2 } }],
      "xp_reward": 300
    },
    "rewards": {
      "xp": 400,
      "item": { "id": "falangies_bow", "name": "Arco das Estepes", "type": "weapon", "damage": "1d10+4", "bonus_atk": 3, "equippable_by": ["falangies"], "description": "Arco forjado pelos mestres arqueiros de Turan. Alcance e precisão incomparáveis." },
      "legendary_skill_unlock": { "character": "falangies", "skill": "chuva_de_fogo" },
      "faction_effects": { "nobreza_pars": 15 }
    }
  },
  {
    "id": "sq_narsus_legendary",
    "name": "O Preço do Gênio",
    "type": "side_quest",
    "giver_npc": "narsus",
    "act": 3,
    "description": "Um vilarejo ao leste está cercado por três facções armadas que ameaçam destruí-lo por um mal-entendido. Narsus aposta que consegue resolver o problema sem derramar uma gota de sangue.",
    "objectives": [
      { "id": "obj1", "text": "Investigar a situação no vilarejo de Khurram" },
      { "id": "obj2", "text": "Identificar o verdadeiro conflito entre as facções [INT 14]" },
      { "id": "obj3", "text": "Implementar o plano de Narsus para dividir as facções sem combate" }
    ],
    "start_condition": "narsus_recruited AND act3_started",
    "no_combat": true,
    "skill_checks": [
      { "skill": "INT", "dc": 14, "success": "Narsus revela a solução completa", "fail": "Combate inevitável com uma das facções" }
    ],
    "rewards": {
      "xp": 500,
      "legendary_skill_unlock": { "character": "narsus", "skill": "estrategia_perfeita" },
      "faction_effects": { "nobreza_pars": 5, "escravos_libertos": 10 },
      "item": { "id": "narsus_treatise", "name": "Tratado de Estratégia de Narsus", "type": "key_item", "description": "Notas de Narsus sobre táticas militares. Aumenta INT de Arslan em +1 permanentemente ao ler." }
    }
  },
  {
    "id": "sq_hodir_spy",
    "name": "O Espião de Hodir",
    "type": "side_quest",
    "giver_npc": "kaveh_blacksmith",
    "act": 3,
    "description": "Kaveh suspeita de um espião lusitano na corte de Lord Hodir. Investigar pode salvar a aliança com Kashan — ou destruí-la se você errar.",
    "objectives": [
      { "id": "obj1", "text": "Investigar a corte de Hodir discretamente" },
      { "id": "obj2", "text": "Identificar o espião [SAB 15 ou Elam recrutado]" },
      { "id": "obj3", "text": "Capturar ou eliminar o espião" }
    ],
    "start_condition": "full_kashan_alliance OR partial_kashan_alliance",
    "branches": {
      "capture": { "outcome": "Capturar o espião e interrogá-lo para obter informações sobre as forças lusitanas." },
      "eliminate": { "combat": { "enemies": [{ "name": "Espião Lusitano", "hp": 20, "ca": 13, "pa": 3, "attributes": { "FOR": 12, "DES": 18, "CON": 12, "INT": 16, "SAB": 14, "CAR": 15 }, "weapon": { "name": "Adaga Venenada", "damage": "1d6+3" }, "on_hit_effect": { "name": "poison", "duration": 4 }, "on_hit_chance": 0.5 }] } },
      "wrong_person": { "outcome": "Se você acusar a pessoa errada, Hodir fica ofendido.", "faction_effects": { "nobreza_pars": -20 } }
    },
    "rewards": {
      "xp": 350,
      "intel_item": { "id": "lusitanian_plans", "name": "Planos Lusitanos", "type": "key_item", "description": "Plantas e planos de movimento do exército lusitano. Reduz dificuldade de batalhas no Ato 4." },
      "faction_effects": { "nobreza_pars": 15 }
    }
  },
  {
    "id": "sq_free_slaves_caravan",
    "name": "Correntes Partidas",
    "type": "side_quest",
    "giver_npc": "daria_slave",
    "act": 2,
    "description": "Uma caravana lusitana transporta 30 escravos parsenses rumo ao norte. Daria pede que você a intercepte antes que cruzem a fronteira.",
    "objectives": [
      { "id": "obj1", "text": "Localizar a rota da caravana [INT 12 ou Jahan informante]" },
      { "id": "obj2", "text": "Interceptar a caravana antes da fronteira" },
      { "id": "obj3", "text": "Libertar os escravos" }
    ],
    "start_condition": "camp_established",
    "combat": {
      "name": "Ataque à Caravana",
      "enemies": [
        { "name": "Guarda da Caravana", "hp": 16, "ca": 13, "pa": 2, "weapon": { "name": "Espada Curta", "damage": "1d6+1" } },
        { "name": "Guarda da Caravana", "hp": 16, "ca": 13, "pa": 2, "weapon": { "name": "Espada Curta", "damage": "1d6+1" } },
        { "name": "Supervisor Lusitano", "hp": 22, "ca": 14, "pa": 3, "weapon": { "name": "Chicote + Faca", "damage": "1d6+2" }, "on_hit_effect": { "name": "bleed", "duration": 2 }, "on_hit_chance": 0.3 }
      ],
      "xp_reward": 180
    },
    "rewards": {
      "xp": 300,
      "gold": 80,
      "faction_effects": { "escravos_libertos": 25, "nobreza_pars": -15 },
      "world_flag": "escravos_libertos_founded",
      "troop_bonus": 50
    }
  },
  {
    "id": "sq_turan_duel",
    "name": "O Desafio das Estepes",
    "type": "side_quest",
    "giver_npc": "bahram_turan",
    "act": 3,
    "description": "Bahram, líder dos cavaleiros de Turan, só respeita quem prova valor em combate singular. Ele desafia Arslan para um duelo — não à morte, mas até um lado ceder.",
    "objectives": [
      { "id": "obj1", "text": "Aceitar o desafio de Bahram" },
      { "id": "obj2", "text": "Vencer o duelo contra Bahram" }
    ],
    "start_condition": "act3_started",
    "combat": {
      "name": "Duelo das Estepes — Bahram",
      "allies_disabled": true,
      "note": "ARSLAN COMBATE SOZINHO. Generais não participam.",
      "enemies": [
        { "name": "Bahram, Guerreiro de Turan", "hp": 35, "ca": 15, "pa": 3, "attributes": { "FOR": 17, "DES": 16, "CON": 14, "INT": 11, "SAB": 12, "CAR": 13 }, "weapon": { "name": "Sabre das Estepes", "damage": "1d8+4", "bonus_atk": 2 } }
      ],
      "xp_reward": 300
    },
    "rewards": {
      "xp": 400,
      "item": { "id": "turan_token", "name": "Emblema de Turan", "type": "key_item", "description": "Prova de respeito dos cavaleiros de Turan. Necessário para aliança formal." },
      "faction_effects": { "turan": 30 },
      "troop_bonus": 150
    }
  },
  {
    "id": "sq_rukhnabad_secret",
    "name": "O Segredo de Rukhnabad",
    "type": "side_quest",
    "giver_npc": "yusuf_scholar",
    "act": 2,
    "description": "O erudito Yusuf encontrou referências a uma câmara secreta sob o Rio Rukhnabad que pode conter artefatos do primeiro Rei de Pars. E Narsus tem uma teoria bem diferente sobre o que realmente está lá.",
    "objectives": [
      { "id": "obj1", "text": "Ouvir a teoria de Yusuf sobre Rukhnabad" },
      { "id": "obj2", "text": "Discutir com Narsus [revela Nota Científica]" },
      { "id": "obj3", "text": "Explorar as cavernas de Rukhnabad" },
      { "id": "obj4", "text": "Derrotar os guardiões animais que vivem lá" }
    ],
    "start_condition": "camp_established",
    "combat": {
      "name": "Guardiões de Rukhnabad",
      "enemies": [
        { "name": "Lobo Gigante das Cavernas", "hp": 24, "ca": 13, "pa": 2, "weapon": { "name": "Presas", "damage": "1d8+3" }, "on_hit_effect": { "name": "bleed", "duration": 2 }, "on_hit_chance": 0.3 },
        { "name": "Lobo Gigante das Cavernas", "hp": 24, "ca": 13, "pa": 2, "weapon": { "name": "Presas", "damage": "1d8+3" } }
      ],
      "xp_reward": 200
    },
    "narsus_note": "O que Yusuf chama de 'magia ancestral' são cristais de calcita com propriedades reflectivas incomuns criando ilusões de luz. A câmara foi construída com precisão arquitetônica para amplificar sons e criar o efeito de 'voz divina'. Nada sobrenatural — apenas engenharia persa do século IV.",
    "rewards": {
      "xp": 400,
      "item": { "id": "rukhnabad_stone", "name": "Fragmento de Rukhnabad", "type": "key_item", "description": "Um cristal mineral com propriedades ópticas únicas. Historicamente ligado à legitimidade dos reis de Pars. Aumenta reputação com Clero de Mithra." },
      "faction_effects": { "clero_mithra": 20 }
    }
  },
  {
    "id": "sq_palace_secrets",
    "name": "Segredos do Palácio",
    "type": "side_quest",
    "giver_npc": "farid_cook",
    "act": 2,
    "description": "Farid, que trabalhava na cozinha do palácio, ouviu conversas dos nobres sobre a origem de Arslan. O que ele sabe pode mudar tudo.",
    "objectives": [
      { "id": "obj1", "text": "Ganhar a confiança de Farid" },
      { "id": "obj2", "text": "Ouvir o que ele sabe sobre os segredos do palácio" }
    ],
    "start_condition": "camp_established",
    "skill_check": { "attribute": "CAR", "dc": 10, "fail_path": "Farid tem medo de falar. Precisa de mais confiança." },
    "rewards": {
      "xp": 150,
      "lore_unlock": "arslan_true_origin_hint",
      "flag_set": "knows_palace_secret",
      "unlock_dialogue": "azrael_truth_path"
    }
  },
  {
    "id": "sq_truth_of_arslan",
    "name": "A Verdade do Príncipe",
    "type": "side_quest",
    "giver_npc": "azrael_priest",
    "act": 3,
    "description": "O Padre Azrael guarda um segredo sobre o nascimento de Arslan que o Rei Andragoras jurou esconder. A verdade pode legitimar — ou destruir — sua reivindicação ao trono.",
    "objectives": [
      { "id": "obj1", "text": "Encontrar o Padre Azrael no Templo de Mithra" },
      { "id": "obj2", "text": "Apresentar o Fragmento de Rukhnabad como prova de boa fé [has_item_rukhnabad_stone]" },
      { "id": "obj3", "text": "Ouvir a verdade sobre seu nascimento" }
    ],
    "start_condition": "quest_sq_rukhnabad_secret_completed AND knows_palace_secret",
    "rewards": {
      "xp": 600,
      "lore_unlock": "arslan_true_origin_revealed",
      "flag_set": "knows_true_origin",
      "faction_effects": { "clero_mithra": 25, "nobreza_pars": -10 },
      "unlock_choice_in_act4": "offer_redemption_silvermask"
    }
  },
  {
    "id": "sq_etoile_letter",
    "name": "A Carta de Etoile",
    "type": "side_quest",
    "giver_npc": "etoile_lusitana",
    "act": 4,
    "description": "Etoile quer mandar uma carta para sua família em Lusitânia explicando por que ela não vai voltar. Mas a carta precisa chegar sem ser interceptada.",
    "objectives": [
      { "id": "obj1", "text": "Aceitar entregar a carta de Etoile" },
      { "id": "obj2", "text": "Encontrar um mensageiro confiável em Sindhura" },
      { "id": "obj3", "text": "Garantir a entrega sem interceptação" }
    ],
    "start_condition": "act4_started AND lusitano_neutrality",
    "rewards": {
      "xp": 300,
      "faction_effects": { "lusitanos_moderados": 20 },
      "unlock": "etoile_joins_reconstruction"
    }
  },
  {
    "id": "sq_daria_manifesto",
    "name": "O Manifesto da Liberdade",
    "type": "side_quest",
    "giver_npc": "daria_slave",
    "act": 3,
    "description": "Daria escreveu um manifesto pela abolição da escravatura em Pars. Ela quer que Arslan o assine e endosse publicamente. É uma declaração política de enormes consequências.",
    "objectives": [
      { "id": "obj1", "text": "Ler o manifesto de Daria" },
      { "id": "obj2", "text": "Decidir: assinar publicamente, assinar em privado, ou recusar" }
    ],
    "start_condition": "quest_sq_free_slaves_caravan_completed",
    "branches": {
      "sign_public": {
        "outcome": "Arslan endossa publicamente a abolição.",
        "faction_effects": { "escravos_libertos": 30, "nobreza_pars": -25 },
        "troop_bonus": 200,
        "lore_note": "A decisão mais importante e irreversível que Arslan pode tomar."
      },
      "sign_private": {
        "outcome": "Arslan apoia em privado mas não publicamente ainda.",
        "faction_effects": { "escravos_libertos": 10, "nobreza_pars": -5 }
      },
      "refuse": {
        "outcome": "Arslan recusa. Daria fica desapontada mas continua apoiando.",
        "faction_effects": { "escravos_libertos": -15 }
      }
    },
    "rewards": {
      "xp": 250,
      "flag_set": "manifesto_decision_made"
    }
  },
  {
    "id": "sq_resistance_ecbatana",
    "name": "A Resistência de Ecbatana",
    "type": "side_quest",
    "giver_npc": "ishtar_dancer",
    "act": 4,
    "description": "Ishtar lidera uma resistência interna dentro de Ecbatana. Ela tem informações valiosas sobre as defesas do palácio — mas precisa de apoio para agir durante a batalha final.",
    "objectives": [
      { "id": "obj1", "text": "Contatar Ishtar antes do cerco" },
      { "id": "obj2", "text": "Passar informações sobre o plano de ataque" },
      { "id": "obj3", "text": "Ishtar sabota os portões durante a batalha" }
    ],
    "start_condition": "act4_started AND chose_strategy",
    "rewards": {
      "xp": 500,
      "combat_bonus": "portao_sabotado_reduce_enemy_count",
      "faction_effects": { "escravos_libertos": 20 }
    }
  },
  {
    "id": "sq_vahriz_sword",
    "name": "A Espada do Último Comandante",
    "type": "side_quest",
    "giver_npc": "commander_vahriz",
    "act": 1,
    "description": "O Comandante Vahriz está morrendo de seus ferimentos. Sua última vontade é que sua espada de cerimônia seja encontrada e preservada — ela foi levada por um sargento lusitano como troféu.",
    "objectives": [
      { "id": "obj1", "text": "Ouvir o pedido de Vahriz" },
      { "id": "obj2", "text": "Localizar o sargento lusitano que carrega a espada" },
      { "id": "obj3", "text": "Recuperar a espada" }
    ],
    "start_condition": null,
    "combat": {
      "enemies": [{ "name": "Sargento Lusitano Veterano", "hp": 28, "ca": 15, "pa": 3, "attributes": { "FOR": 15, "DES": 12, "CON": 14, "INT": 10, "SAB": 10, "CAR": 11 }, "weapon": { "name": "Espada Longa +1", "damage": "1d8+3", "bonus_atk": 2 } }],
      "xp_reward": 150
    },
    "rewards": {
      "xp": 300,
      "item": { "id": "vahriz_sword", "name": "Espada de Vahriz", "type": "weapon", "damage": "1d8+3", "bonus_atk": 2, "description": "A espada do último comandante leal de Pars. Gravada com o juramento do exército." },
      "faction_effects": { "nobreza_pars": 15, "clero_mithra": 5 }
    }
  },
  {
    "id": "sq_zahras_curse",
    "name": "A Maldição de Zahra",
    "type": "side_quest",
    "giver_npc": "zahra_witch",
    "act": 2,
    "description": "Aldeias próximas acreditam que Zahra os amaldiçoou com uma doença misteriosa. Zahra jura que é inocente. Investigar com Narsus revela a verdade científica — e o verdadeiro culpado.",
    "objectives": [
      { "id": "obj1", "text": "Investigar as aldeias afetadas" },
      { "id": "obj2", "text": "Consultar Narsus sobre os sintomas [Nota Científica]" },
      { "id": "obj3", "text": "Descobrir a fonte real da doença" },
      { "id": "obj4", "text": "Resolver o problema" }
    ],
    "start_condition": "camp_established",
    "narsus_note": "A 'doença' são sintomas de intoxicação por chumbo da água. Alguém contaminou o poço com resíduos de fundição — provavelmente acidental, possivelmente intencional. Zahra não tem nenhuma responsabilidade. A 'cura' é simples: água limpa e quelação natural com certas ervas.",
    "rewards": {
      "xp": 350,
      "item": { "id": "zahras_elixir", "name": "Elixir de Zahra", "type": "consumable", "effect": "cure_all_conditions", "description": "Cura todos os status negativos. Extremamente raro." },
      "faction_effects": { "escravos_libertos": 10, "clero_mithra": 10 }
    }
  },
  {
    "id": "sq_lost_manuscripts",
    "name": "Manuscritos Perdidos",
    "type": "side_quest",
    "giver_npc": "yusuf_scholar",
    "act": 2,
    "description": "Yusuf perdeu sua coleção de manuscritos raros durante a fuga de Ecbatana. Um deles contém estratégias militares do primeiro exército de Pars — informações que Narsus ficaria obcecado em ler.",
    "objectives": [
      { "id": "obj1", "text": "Localizar onde os manuscritos foram levados" },
      { "id": "obj2", "text": "Infiltrar o acampamento lusitano que os confiscou" },
      { "id": "obj3", "text": "Recuperar os manuscritos" }
    ],
    "start_condition": "camp_established",
    "combat": {
      "name": "Acampamento do Bibliotecário Lusitano",
      "enemies": [
        { "name": "Bibliotecário Lusitano", "hp": 12, "ca": 11, "pa": 2, "weapon": { "name": "Cajado", "damage": "1d6" } },
        { "name": "Escolta Lusitana", "hp": 18, "ca": 14, "pa": 2, "weapon": { "name": "Espada", "damage": "1d8+2" } },
        { "name": "Escolta Lusitana", "hp": 18, "ca": 14, "pa": 2, "weapon": { "name": "Espada", "damage": "1d8+2" } }
      ],
      "xp_reward": 150
    },
    "rewards": {
      "xp": 300,
      "item": { "id": "ancient_military_tome", "name": "Tratados Militares de Pars Antigo", "type": "key_item", "description": "Estratégias do primeiro exército de Pars. Narsus estuda por semanas e desenvolve uma habilidade extra." },
      "unlock_skill": { "character": "narsus", "skill": "emboscada_perfeita" }
    }
  }
]
```

---

### 4.4 — ITENS COMPLETOS (60+ itens)

```json
// src/data/items/weapons.json — EXPANDIDO

[
  { "id": "sword_iron", "name": "Espada de Ferro", "type": "weapon", "damage": "1d8", "bonus_atk": 1, "value": 50 },
  { "id": "sword_steel", "name": "Espada de Aço", "type": "weapon", "damage": "1d8+1", "bonus_atk": 2, "value": 120, "requires": "level >= 2" },
  { "id": "sword_light", "name": "Espada Leve", "type": "weapon", "damage": "1d6+1", "bonus_atk": 1, "value": 40 },
  { "id": "sword_ceremonial", "name": "Espada Cerimonial de Pars", "type": "weapon", "damage": "1d8+3", "bonus_atk": 2, "value": 0, "unique": true },
  { "id": "kaveh_sword", "name": "Espada de Fardad", "type": "weapon", "damage": "1d8+2", "bonus_atk": 2, "value": 0, "unique": true, "lore": "Forjada por Kaveh para seu filho. Nunca usada em batalha por ele." },
  { "id": "vahriz_sword", "name": "Espada de Vahriz", "type": "weapon", "damage": "1d8+3", "bonus_atk": 2, "value": 0, "unique": true },
  { "id": "sacred_spear", "name": "Lança Sagrada de Pars", "type": "weapon", "damage": "1d12+4", "bonus_atk": 3, "equippable_by": ["daryun"], "value": 0, "unique": true },
  { "id": "sindhuri_blade", "name": "Lâmina de Sindhura", "type": "weapon", "damage": "1d8+2", "bonus_atk": 2, "on_hit_effect": { "name": "bleed", "chance": 0.2, "duration": 2 }, "value": 200 },
  { "id": "turan_saber", "name": "Sabre de Turan", "type": "weapon", "damage": "1d8+3", "bonus_atk": 2, "value": 180 },
  { "id": "spy_dagger", "name": "Adaga do Espião", "type": "weapon", "damage": "1d6+3", "bonus_atk": 3, "on_hit_effect": { "name": "poison", "chance": 0.35, "duration": 3 }, "value": 250 },
  { "id": "turan_horse_bow", "name": "Arco de Cavalaria de Turan", "type": "weapon", "damage": "1d8+3", "bonus_atk": 3, "range": true, "equippable_by": ["elam", "falangies", "gieve"], "value": 220 },
  { "id": "falangies_bow", "name": "Arco das Estepes", "type": "weapon", "damage": "1d10+4", "bonus_atk": 3, "range": true, "equippable_by": ["falangies"], "value": 0, "unique": true },
  { "id": "poison_arrow", "name": "Flecha Envenenada (x5)", "type": "weapon", "damage": "1d6+2", "bonus_atk": 1, "range": true, "on_hit_effect": { "name": "poison", "chance": 1.0, "duration": 3 }, "quantity": 5, "value": 80 },
  { "id": "fire_arrow", "name": "Flecha de Fogo (x5)", "type": "weapon", "damage": "1d6+1d4", "bonus_atk": 1, "range": true, "on_hit_effect": { "name": "burning", "chance": 0.5, "duration": 2 }, "quantity": 5, "value": 100 },
  { "id": "training_sword", "name": "Espada de Treino", "type": "weapon", "damage": "1d6", "bonus_atk": 0, "value": 10 }
]
```

```json
// src/data/items/armor.json — EXPANDIDO

[
  { "id": "armor_leather", "name": "Armadura de Couro", "type": "armor", "ca_bonus": 2, "value": 40 },
  { "id": "armor_chain", "name": "Cota de Malha", "type": "armor", "ca_bonus": 4, "value": 120 },
  { "id": "armor_scale", "name": "Armadura de Escamas", "type": "armor", "ca_bonus": 5, "value": 200, "requires": "level >= 3" },
  { "id": "armor_plate", "name": "Armadura de Placas de Pars", "type": "armor", "ca_bonus": 6, "equippable_by": ["arslan", "daryun"], "value": 400, "requires": "level >= 4" },
  { "id": "armor_steppe", "name": "Couro das Estepes", "type": "armor", "ca_bonus": 3, "bonus_DES": 1, "value": 160 },
  { "id": "armor_silk_sindhura", "name": "Seda Reforçada de Sindhura", "type": "armor", "ca_bonus": 3, "saves_bonus": { "poison": 2 }, "value": 180 },
  { "id": "shield_wooden", "name": "Escudo de Madeira", "type": "shield", "ca_bonus": 1, "value": 20 },
  { "id": "shield_iron", "name": "Escudo de Ferro", "type": "shield", "ca_bonus": 2, "value": 60 },
  { "id": "shield_tower", "name": "Escudo Torre de Pars", "type": "shield", "ca_bonus": 3, "equippable_by": ["arslan", "daryun"], "value": 150 },
  { "id": "practice_shield", "name": "Escudo de Treino", "type": "shield", "ca_bonus": 1, "value": 10 }
]
```

```json
// src/data/items/consumables.json — EXPANDIDO

[
  { "id": "potion_minor", "name": "Poção Menor de Cura", "type": "consumable", "effect": "heal", "value_range": "2d4+2", "value": 30 },
  { "id": "potion_standard", "name": "Poção de Cura", "type": "consumable", "effect": "heal", "value_range": "4d4+4", "value": 60 },
  { "id": "potion_greater", "name": "Poção Superior de Cura", "type": "consumable", "effect": "heal", "value_range": "6d6+6", "value": 150, "requires": "level >= 3" },
  { "id": "elixir_strength", "name": "Elixir de Força", "type": "consumable", "effect": "temp_buff", "buff": { "FOR": 4 }, "duration_turns": 3, "value": 200 },
  { "id": "elixir_speed", "name": "Elixir de Velocidade", "type": "consumable", "effect": "temp_buff", "buff": { "DES": 4, "pa_bonus": 1 }, "duration_turns": 3, "value": 200 },
  { "id": "elixir_iron_skin", "name": "Elixir de Pele de Ferro", "type": "consumable", "effect": "temp_buff", "buff": { "ca_bonus": 3 }, "duration_turns": 4, "value": 200 },
  { "id": "antidote", "name": "Antídoto", "type": "consumable", "effect": "cure_poison", "value": 40 },
  { "id": "antidote_strong", "name": "Antídoto Forte", "type": "consumable", "effect": "cure_all_conditions", "value": 120 },
  { "id": "bandage", "name": "Bandagem", "type": "consumable", "effect": "cure_bleed", "value": 10 },
  { "id": "herbal_tea", "name": "Chá de Ervas", "type": "consumable", "effect": "heal_and_clear_debuff", "value_range": "1d6+2", "value": 25 },
  { "id": "smoke_bomb", "name": "Bomba de Fumaça", "type": "consumable", "effect": "escape_combat", "escape_chance": 0.75, "value": 60 },
  { "id": "fire_oil", "name": "Óleo de Fogo", "type": "consumable", "effect": "area_burn", "damage": "2d6", "area": true, "value": 80 },
  { "id": "vision_herb", "name": "Erva da Visão", "type": "consumable", "effect": "reveal_enemy_stats", "value": 90 },
  { "id": "paralysis_extract", "name": "Extrato Paralisante", "type": "consumable", "effect": "stun_enemy", "stun_chance": 0.7, "duration_turns": 2, "value": 150 },
  { "id": "zahras_elixir", "name": "Elixir de Zahra", "type": "consumable", "effect": "cure_all_conditions", "value": 0, "unique": true },
  { "id": "ration", "name": "Ração de Campo", "type": "consumable", "effect": "rest_enable", "value": 15 },
  { "id": "hearty_stew", "name": "Ensopado Farto", "type": "consumable", "effect": "heal_and_temp_buff", "value_range": "2d6+2", "buff": { "CON": 1 }, "duration_turns": 5, "value": 35 },
  { "id": "dried_meat", "name": "Carne Seca", "type": "consumable", "effect": "heal", "value_range": "1d4", "value": 12 },
  { "id": "sacred_incense", "name": "Incenso Sagrado", "type": "consumable", "effect": "morale_buff", "buff": { "all_saves": 2 }, "duration_turns": 5, "value": 80 },
  { "id": "prayer_scroll", "name": "Rolo de Oração", "type": "consumable", "effect": "revive", "revive_hp_percent": 0.25, "value": 250, "note": "Estabiliza um aliado inconsciente com 25% HP" },
  { "id": "blessed_bandage", "name": "Bandagem Abençoada", "type": "consumable", "effect": "heal_and_cure_bleed", "value_range": "1d8+2", "value": 40 }
]
```

---

### 4.5 — INIMIGOS EXPANDIDOS (15+ tipos)

```json
// src/data/characters/enemies/ — arquivos novos

// lusitanian_champion.json
{
  "id": "lusitanian_champion",
  "name": "Campeão Lusitano",
  "description": "O melhor guerreiro de um batalhão lusitano. Usa armadura completa e é veterano de dezenas de batalhas.",
  "attributes": { "FOR": 17, "DES": 13, "CON": 16, "INT": 11, "SAB": 11, "CAR": 12 },
  "hp": 45, "ca": 17, "pa": 3,
  "weapon": { "name": "Machado de Guerra", "damage": "2d6+4", "bonus_atk": 2 },
  "on_hit_effect": { "name": "stunned", "chance": 0.2, "duration": 1 },
  "xp": 180, "gold": 25,
  "ai": "aggressive_boss"
}

// lusitanian_inquisitor.json
{
  "id": "lusitanian_inquisitor",
  "name": "Inquisidor Lusitano",
  "description": "Sacerdote-guerreiro de Yaldabaoth. Inspira seus aliados com fervor religioso e aplica penalidades de medo nos inimigos.",
  "attributes": { "FOR": 14, "DES": 12, "CON": 14, "INT": 15, "SAB": 17, "CAR": 16 },
  "hp": 30, "ca": 15, "pa": 3,
  "weapon": { "name": "Maça Sagrada", "damage": "1d8+3", "bonus_atk": 2 },
  "passive": "Fervor: aliados lusitanos ganham +2 em rolagens de ataque enquanto o Inquisidor estiver vivo",
  "on_hit_effect": { "name": "intimidated", "chance": 0.4, "duration": 2 },
  "xp": 220, "gold": 20,
  "ai": "support_aggressive"
}

// desert_bandit.json
{
  "id": "desert_bandit",
  "name": "Bandido do Deserto",
  "attributes": { "FOR": 13, "DES": 14, "CON": 11, "INT": 8, "SAB": 9, "CAR": 9 },
  "hp": 14, "ca": 12, "pa": 2,
  "weapon": { "name": "Cimitarra Enferrujada", "damage": "1d6+2" },
  "xp": 40, "gold": 8, "ai": "cowardly"
}

// bandit_leader.json
{
  "id": "bandit_leader",
  "name": "Líder de Bandidos",
  "attributes": { "FOR": 15, "DES": 14, "CON": 13, "INT": 11, "SAB": 10, "CAR": 14 },
  "hp": 30, "ca": 14, "pa": 3,
  "weapon": { "name": "Cimitarra + Adaga", "damage": "1d8+3" },
  "passive": "Liderança: bandidos aliados não fogem enquanto o líder estiver vivo",
  "xp": 120, "gold": 30, "ai": "tactical_boss"
}

// wolf_giant.json
{
  "id": "wolf_giant",
  "name": "Lobo das Cavernas",
  "attributes": { "FOR": 16, "DES": 15, "CON": 14, "INT": 3, "SAB": 12, "CAR": 7 },
  "hp": 28, "ca": 13, "pa": 2,
  "weapon": { "name": "Presas e Garras", "damage": "1d8+4" },
  "on_hit_effect": { "name": "bleed", "chance": 0.35, "duration": 2 },
  "xp": 100, "gold": 0, "ai": "aggressive_animal"
}

// assassin_sindhura.json
{
  "id": "assassin_sindhura",
  "name": "Assassino de Sindhura",
  "attributes": { "FOR": 13, "DES": 20, "CON": 12, "INT": 14, "SAB": 14, "CAR": 12 },
  "hp": 22, "ca": 15, "pa": 3,
  "weapon": { "name": "Cimitarra Venenada", "damage": "1d8+4", "bonus_atk": 3 },
  "on_hit_effect": { "name": "poison", "chance": 0.4, "duration": 3 },
  "passive": "Esquiva Mortal: uma vez por combate, ignora automaticamente um ataque",
  "xp": 160, "gold": 20, "ai": "tactical_aggressive"
}

// turan_horseman.json
{
  "id": "turan_horseman",
  "name": "Cavaleiro de Turan",
  "attributes": { "FOR": 15, "DES": 16, "CON": 13, "INT": 10, "SAB": 12, "CAR": 11 },
  "hp": 24, "ca": 15, "pa": 3,
  "weapon": { "name": "Sabre das Estepes + Arco", "damage": "1d8+3" },
  "passive": "Carga Montada: no primeiro turno, ataque causa dano dobrado",
  "xp": 130, "gold": 15, "ai": "aggressive_fast"
}

// corrupt_noble_guard.json
{
  "id": "corrupt_noble_guard",
  "name": "Guarda do Nobre Corrupto",
  "attributes": { "FOR": 14, "DES": 12, "CON": 13, "INT": 10, "SAB": 9, "CAR": 10 },
  "hp": 22, "ca": 15, "pa": 2,
  "weapon": { "name": "Espada Longa Polida", "damage": "1d8+2" },
  "xp": 80, "gold": 18, "ai": "defensive"
}

// kharlan.json (já existe — expandir)
// Adicionar segunda fase ao boss:
{
  "id": "kharlan",
  "phase2": {
    "trigger_hp_percent": 0.4,
    "name": "Kharlan Desesperado",
    "hp_recovery": 15,
    "new_attack": { "name": "Golpe do Traidor", "damage": "2d6+5", "bonus_atk": 4 },
    "dialogue_trigger": "Kharlan grita: 'Eu fiz isso por PARS! Andragoras era um tirano!' Você percebe — ele acredita nisso."
  }
}
```

---

### 4.6 — HABILIDADES COMPLETAS DOS PERSONAGENS

```json
// src/data/skills/skills.json

{
  "warrior": [
    { "id": "golpe_poderoso", "name": "Golpe Poderoso", "pa_cost": 2, "description": "Ataque com +2d6 de dano extra. Chance de derrubar o alvo (STR vs CON DC 14).", "effect": "bonus_damage", "bonus_dice": "2d6", "side_effect": { "name": "derrubado", "chance": 0.4, "save": { "attribute": "CON", "dc": 14 } }, "cooldown": 0 },
    { "id": "postura_defensiva", "name": "Postura Defensiva", "pa_cost": 1, "description": "+3 CA até início do próximo turno. Próximo ataque contra você tem desvantagem.", "effect": "temp_ca_buff", "buff_value": 3, "duration": "until_next_turn", "cooldown": 0 },
    { "id": "grito_de_guerra", "name": "Grito de Guerra", "pa_cost": 1, "description": "Todos os aliados ganham +2 em ataques no próximo turno. Inimigos em alcance testam SAB DC 12 ou ficam intimidados.", "effect": "ally_buff_enemy_debuff", "ally_buff": { "attack_bonus": 2, "duration": 1 }, "enemy_effect": { "name": "intimidated", "chance": 0.5, "save": { "attribute": "SAB", "dc": 12 } }, "cooldown": 3 },
    { "id": "lanca_dos_mil_exercitos", "name": "Lança dos Mil Exércitos", "pa_cost": 3, "description": "HABILIDADE LENDÁRIA — Atinge todos os inimigos em área. Dano: 3d10+5. Força todos a testar CON DC 16 ou ficam derrubados.", "effect": "aoe_damage", "damage": "3d10+5", "side_effect": { "name": "derrubado", "save": { "attribute": "CON", "dc": 16 } }, "uses_per_combat": 1, "legendary": true, "equippable_by": ["daryun"] }
  ],
  "diplomat": [
    { "id": "persuasao_nobre", "name": "Persuasão Nobre", "pa_cost": 1, "description": "Fora de combate: +4 em testes de CAR para persuadir. Em combate: tenta intimidar um inimigo (CAR vs SAB DC 14).", "effect": "charisma_bonus_or_intimidate", "cooldown": 2 },
    { "id": "leitura_de_pessoas", "name": "Leitura de Pessoas", "pa_cost": 1, "description": "Revela HP atual, condições e principal fraqueza de um inimigo.", "effect": "reveal_stats", "cooldown": 0 },
    { "id": "discurso_inspirador", "name": "Discurso Inspirador", "pa_cost": 2, "description": "Restaura 1d8+CAR mod HP para cada aliado. Dura 2 turnos: aliados ganham moral (+1 em todas as rolagens).", "effect": "ally_heal_and_buff", "heal": "1d8", "buff": { "all_rolls": 1, "duration": 2 }, "cooldown": 4 }
  ],
  "strategist": [
    { "id": "analise_tatica", "name": "Análise Tática", "pa_cost": 1, "description": "Revela a ordem de iniciativa completa. Um aliado à escolha pode agir imediatamente fora de sua vez (1 vez por combate).", "effect": "reveal_initiative_and_bonus_action", "uses_per_combat": 1, "cooldown": 0 },
    { "id": "antecipar_movimento", "name": "Antecipar Movimento", "pa_cost": 1, "description": "O próximo ataque de um inimigo escolhido automaticamente erra (você 'previu' o movimento). Cooldown 3 turnos.", "effect": "negate_next_enemy_attack", "cooldown": 3 },
    { "id": "plano_de_batalha", "name": "Plano de Batalha", "pa_cost": 2, "description": "No início do combate (antes do 1º turno), todos os aliados ganham +3 em iniciativa e +2 em ataque no primeiro turno.", "effect": "pre_combat_buff", "cooldown": 0 },
    { "id": "estrategia_perfeita", "name": "Estratégia Perfeita", "pa_cost": 3, "description": "HABILIDADE LENDÁRIA — Redesenha a ordem de iniciativa. Escolhe onde cada inimigo fica na fila. Um aliado age antes de todos.", "effect": "reorder_initiative", "uses_per_combat": 1, "legendary": true, "equippable_by": ["narsus"] }
  ],
  "generals": {
    "daryun": [
      { "id": "guardia_do_principe", "name": "Guardião do Príncipe", "pa_cost": 1, "description": "PASSIVA — Se Arslan for atacado, Daryun pode interceptar gastando 1 PA e recebendo o dano no lugar.", "effect": "intercept_damage", "trigger": "ally_attacked", "target_condition": "target_id == arslan", "cooldown": 0 },
      { "id": "carga_de_cavalaria", "name": "Carga de Cavalaria", "pa_cost": 3, "description": "Ataque massivo: 2d10+5 em um alvo. Se o alvo tiver menos de 50% HP, atordoa por 1 turno.", "effect": "heavy_attack_stun", "damage": "2d10+5", "stun_condition": "target_hp < 50%", "cooldown": 3 }
    ],
    "narsus": [
      { "id": "criar_abertura", "name": "Criar Abertura", "pa_cost": 1, "description": "Aponta uma fraqueza tática: próximo ataque aliado contra o alvo tem vantagem.", "effect": "grant_advantage_to_ally", "cooldown": 0 },
      { "id": "instrucao_de_combate", "name": "Instrução de Combate", "pa_cost": 2, "description": "Um aliado à escolha ganha +1 PA extra neste turno.", "effect": "give_ally_extra_pa", "cooldown": 2 }
    ],
    "elam": [
      { "id": "tiro_preciso", "name": "Tiro Preciso", "pa_cost": 2, "description": "Ataque de arco sem penalidade de combate próximo. +3 de bônus de ataque. Ignora cover.", "effect": "precision_shot", "cooldown": 0 },
      { "id": "primeiros_socorros", "name": "Primeiros Socorros", "pa_cost": 1, "description": "Estabiliza aliado inconsciente a 1 HP. Ou remove condição de sangramento de aliado.", "effect": "stabilize_or_cure_bleed", "cooldown": 0 }
    ],
    "gieve": [
      { "id": "golpe_duplo", "name": "Golpe Duplo", "pa_cost": 2, "description": "Dois ataques em 1 PA. Cada um com o modificador normal. Pode alvos diferentes.", "effect": "double_attack", "cooldown": 0 },
      { "id": "cancao_de_batalha", "name": "Canção de Batalha", "pa_cost": 2, "description": "Todos os aliados recuperam 1d6 HP e ficam imunes a intimidação por 3 turnos. Efeito de moral.", "effect": "ally_heal_and_morale", "heal": "1d6", "immunity": "intimidated", "duration": 3, "cooldown": 4 }
    ],
    "falangies": [
      { "id": "chuva_de_flechas", "name": "Chuva de Flechas", "pa_cost": 2, "description": "Atinge 3 inimigos aleatórios com 1d6+3 cada. Todos os atingidos testam CON DC 12 ou ficam lentificados.", "effect": "multi_target", "targets": 3, "damage": "1d6+3", "side_effect": { "name": "slowed", "save": { "attribute": "CON", "dc": 12 } }, "cooldown": 2 },
      { "id": "marcar_alvo", "name": "Marcar Alvo", "pa_cost": 1, "description": "Marca um inimigo: todos os ataques contra ele têm vantagem pelo próximo turno.", "effect": "mark_target", "cooldown": 0 }
    ]
  }
}
```

---

### 4.7 — EVENTOS ALEATÓRIOS DE VIAGEM

```json
// src/data/world/travel_events.json
// Disparados aleatoriamente (30% de chance) ao viajar entre regiões

[
  {
    "id": "travel_merchant",
    "name": "Mercador na Estrada",
    "description": "Um mercador solitário oferece itens raros por preços exorbitantes.",
    "type": "merchant",
    "probability": 0.15,
    "shop_items_random": 3,
    "price_multiplier": 1.5
  },
  {
    "id": "travel_ambush",
    "name": "Emboscada!",
    "description": "Bandidos ou soldados lusitanos atacam o grupo em movimento.",
    "type": "combat",
    "probability": 0.25,
    "enemy_count_range": [2, 4],
    "enemy_pool": ["desert_bandit", "lusitanian_soldier", "lusitanian_scout"],
    "xp_bonus": 1.2
  },
  {
    "id": "travel_refugee",
    "name": "Grupo de Refugiados",
    "description": "Um grupo de parsenses fugindo dos lusitanos pede ajuda.",
    "type": "narrative_choice",
    "probability": 0.2,
    "choices": [
      { "text": "Dar suprimentos e escolta", "cost_gold": 20, "faction_effects": { "escravos_libertos": 10 } },
      { "text": "Dar informações sobre rotas seguras", "faction_effects": { "escravos_libertos": 5 } },
      { "text": "Não pode ajudar agora", "faction_effects": { "escravos_libertos": -5 } }
    ]
  },
  {
    "id": "travel_ruins",
    "name": "Ruínas Misteriosas",
    "description": "Uma estrutura antiga marca a paisagem. Pode ter itens valiosos — ou perigos.",
    "type": "exploration",
    "probability": 0.1,
    "choices": [
      { "text": "Explorar com cuidado [DES 12]", "success": "item_random_rare", "fail": "combat_trap" },
      { "text": "Ignorar e seguir caminho", "effect": "nothing" }
    ]
  },
  {
    "id": "travel_narsus_insight",
    "name": "Observação de Narsus",
    "description": "Durante a viagem, Narsus observa algo no terreno ou nas pessoas que pode ser útil.",
    "type": "intel",
    "probability": 0.15,
    "condition": "narsus_recruited",
    "effect": "reveal_random_intel",
    "intel_pool": [
      "Posição de um acampamento lusitano não mapeado",
      "Rota de suprimentos que pode ser sabotada",
      "Nome de um nobre de Pars que ainda resiste em segredo"
    ]
  },
  {
    "id": "travel_daryun_training",
    "name": "Treino em Marcha",
    "description": "Daryun propõe um treino enquanto viajam. Lento mas eficiente.",
    "type": "training",
    "probability": 0.1,
    "condition": "daryun_recruited",
    "effect": "xp_bonus",
    "xp_amount": 30,
    "dialogue": "\"Mesmo em marcha, o guerreiro treina a mente. Me conte o que faria se o flanco esquerdo quebrasse.\""
  },
  {
    "id": "travel_gieve_song",
    "name": "A Canção da Jornada",
    "description": "Gieve toca uma música que melhora o moral do grupo.",
    "type": "buff",
    "probability": 0.1,
    "condition": "gieve_recruited",
    "effect": "morale_boost",
    "buff": { "all_next_combat_rolls": 1 },
    "duration": "next_combat"
  },
  {
    "id": "travel_lusitanian_patrol",
    "name": "Patrulha Lusitana",
    "description": "Uma patrulha lusitana avança na sua direção. Vocês têm tempo para reagir.",
    "type": "narrative_choice",
    "probability": 0.2,
    "choices": [
      { "text": "Combater!", "leads_to_combat": true },
      { "text": "Esconder [DES 13]", "roll": { "attribute": "DES", "dc": 13 }, "success": "pass", "fail": "combat" },
      { "text": "[Diplomata] Disfarçar como comerciantes [CAR 14]", "condition": "class == diplomat", "roll": { "attribute": "CAR", "dc": 14 }, "success": "pass_plus_intel", "fail": "combat" }
    ]
  }
]
```

---

### 4.8 — LORE E NOTAS DE NARSUS EXPANDIDAS

```json
// src/data/lore/narsus_notes.json

[
  {
    "id": "note_rukhnabad",
    "title": "Sobre a Pedra de Rukhnabad",
    "trigger": "quest_sq_rukhnabad_secret_completed",
    "content": "O que o povo chama de 'magia sagrada de Rukhnabad' é, na realidade, cristais de calcita com estrutura romboédrica que refratam luz de forma incomum. A câmara foi construída no século III por artesãos que compreendiam acústica e óptica sem o vocabulário para descrever. O efeito de 'voz de deus' é amplificação natural por tubos de pedra. Fascinante engenharia. Nada sobrenatural. — Narsus"
  },
  {
    "id": "note_yaldabaoth",
    "title": "Sobre Yaldabaoth e a Religião Lusitana",
    "trigger": "act3_started",
    "content": "Yaldabaoth não é diferente de Mithra em estrutura doutrinária — ambos prometem ordem, propósito e vida após a morte em troca de obediência. A diferença está no uso político: os sacerdotes de Yaldabaoth são instrumentos de controle estatal mais explícitos. Religiões que proíbem questionar suas premissas não são espiritualidade — são administração de massas com roupagem divina. Isso inclui Mithra, naturalmente. — Narsus"
  },
  {
    "id": "note_slavery",
    "title": "Sobre a Escravatura em Pars",
    "trigger": "camp_established",
    "content": "Pars justifica a escravatura com argumento econômico: a aristocracia depende de trabalho escravo para manter a prosperidade que por sua vez financia o exército. É circular e conveniente. O que ninguém calcula é o custo real: um escravo tem zero incentivo para produtividade além do mínimo necessário para evitar punição. Um trabalhador livre e pago produz mais. A abolição não é apenas moral — é economicamente superior. Andragoras foi burro em me exilar. — Narsus"
  },
  {
    "id": "note_atropatene_betrayal",
    "title": "Reconstrução da Traição de Atropatene",
    "trigger": "knows_palace_secret",
    "content": "A batalha de Atropatene não foi perdida por inferioridade militar. Analisei os relatos sobreviventes. Os lusitanos sabiam do terreno, da posição, do momento do ataque. Isso é inteligência. Inteligência que só poderia vir de alguém próximo ao comando de Pars. Kharlan abriu os portões, sim. Mas alguém abriu a boca antes. E essa pessoa ainda pode estar em Kashan. — Narsus"
  },
  {
    "id": "note_silvermask_identity",
    "title": "Especulação Sobre Silvermask",
    "trigger": "act4_started",
    "content": "A mascara de prata não é meramente estética. É uma declaração. Quem esconde o rosto em batalha não quer ser reconhecido — mas quer ser temido. Isso sugere que a identidade verdadeira é conhecida por alguém importante. Analisei os padrões de combate relatados: formação clássica de Pars, não lusitana. Este homem foi treinado aqui. Talvez por alguém que eu conheço. Tenho uma teoria mas prefiro não colocá-la no papel ainda. — Narsus"
  },
  {
    "id": "note_arslan_origin",
    "title": "A Questão da Linhagem",
    "trigger": "knows_true_origin",
    "content": "Confirmado o que eu suspeitava há anos. O sangue real não mente, mas a política real sempre mente. O que Arslan representa agora é mais importante do que o que ele é geneticamente. Um rei não é sua biologia — é o que escolhe ser e pelo que escolhe lutar. Se ele continuar sendo quem tem sido desde Ecbatana, Pars estará melhor servida do que em toda a história da dinastia. Isso é tudo que importa. — Narsus"
  }
]
```

---

### 4.9 — EVENTOS DE ACAMPAMENTO

```json
// src/data/world/camp_events.json
// Eventos que acontecem no acampamento entre missões

[
  {
    "id": "camp_daryun_story",
    "name": "Noite de Guarda com Daryun",
    "trigger": "camp_established AND NOT camp_daryun_story_seen",
    "type": "narrative_event",
    "text": [
      "A noite no acampamento é fria. Daryun está de guarda, como sempre — não por necessidade, mas por hábito.",
      "Você se senta ao lado dele. Por um longo momento, nenhum dos dois fala.",
      "\"Eu conheci seu pai quando ele ainda era príncipe,\" Daryun finalmente diz. \"Ele era diferente de você. Mais duro. Mais calculista.\"",
      "\"Mas ele tinha algo que os outros não tinham: nunca pedia a seus homens o que ele mesmo não estava disposto a fazer.\"",
      "\"Você tem isso também, Alteza. É o suficiente.\""
    ],
    "choices": [
      { "id": "ask_father", "text": "\"O que aconteceu com ele, Daryun?\"", "next_node": "daryun_father_truth" },
      { "id": "silence", "text": "Ficar em silêncio junto com ele.", "faction_effects": { "nobreza_pars": 3 }, "xp_reward": 20 }
    ],
    "set_flag": "camp_daryun_story_seen"
  },
  {
    "id": "camp_narsus_painting_argument",
    "name": "A Grande Discussão Artística",
    "trigger": "saw_painting AND gieve_recruited AND NOT camp_painting_argument_seen",
    "type": "comedy_event",
    "text": [
      "O acampamento está em guerra. Não com os lusitanos — com a pintura mais recente de Narsus.",
      "Gieve examina a obra com expressão de quem mordeu um limão. \"Narsus, isso é... ousado.\"",
      "\"É arte,\" Narsus responde, impassível.",
      "\"É um cavalo com seis pernas,\" Elam murmura.",
      "\"É um cavalo em MOVIMENTO,\" Narsus corrige. \"A técnica captura múltiplos momentos simultâneos.\"",
      "\"Técnica?\" Gieve coloca a mão no peito. \"Eu toco flauta, escrevo poesia, fiz o povo chorar em quatro países. Se eu fizesse algo assim, me jogariam no rio.\""
    ],
    "choices": [
      { "id": "defend_narsus", "text": "\"É certamente... memorável.\"", "xp_reward": 15 },
      { "id": "side_with_gieve", "text": "\"Concordo com Gieve. Tem seis pernas.\"", "xp_reward": 15 }
    ],
    "set_flag": "camp_painting_argument_seen"
  },
  {
    "id": "camp_elam_archery",
    "name": "Elam Ensina Tiro",
    "trigger": "narsus_recruited AND NOT camp_elam_archery_seen",
    "type": "training_event",
    "text": [
      "Elam está praticando tiro ao alvo quando você passa.",
      "\"Alteza, quer tentar?\" ele oferece o arco com uma ligeira hesitação — como se temesse que você errasse e fosse embaraçoso.",
      "Você pega o arco. Elam corrige sua postura sem pedir permissão — puro instinto de arqueiro.",
      "\"Respira fundo. Solte quando o ar sair. Não quando entrar.\"",
      "A flecha parte. Toca a borda do alvo.",
      "\"Melhor do que eu esperava,\" Elam admite."
    ],
    "effect": { "xp": 25, "skill_hint": "DES" },
    "set_flag": "camp_elam_archery_seen"
  },
  {
    "id": "camp_gieve_song",
    "name": "A Canção do Exílio",
    "trigger": "gieve_recruited AND NOT camp_gieve_song_seen",
    "type": "morale_event",
    "text": [
      "Tarde da noite, quando o acampamento está quieto, o som de uma flauta corta o ar.",
      "Gieve toca sozinho, de costas para o fogo, olhando as estrelas.",
      "A melodia é diferente de tudo que você já ouviu dele em público. Mais quieta. Mais honesta.",
      "Ninguém comenta. Todos ouvem.",
      "Quando termina, Gieve vira para você com aquele sorriso usual — como se a vulnerabilidade dos últimos minutos nunca tivesse acontecido.",
      "\"Boa noite, Príncipe.\""
    ],
    "effect": {
      "xp": 30,
      "morale_buff": { "next_combat_all_rolls": 2, "duration": "next_combat" },
      "gieve_loyalty_hint": true
    },
    "set_flag": "camp_gieve_song_seen"
  },
  {
    "id": "camp_falangies_prayer",
    "name": "Oração ao Amanhecer",
    "trigger": "falangies_recruited AND NOT camp_falangies_prayer_seen",
    "type": "narrative_event",
    "text": [
      "Antes que o sol nasça, Falangies está ajoelhada diante de um pequeno altar que ela construiu com pedras do acampamento.",
      "Você a encontra assim, em silêncio, os olhos fechados.",
      "Ela não se surpreende com sua presença. Como se soubesse que você estava lá.",
      "\"Mithra não fala a quem não ouve,\" ela diz sem abrir os olhos. \"Mas ele escuta a todos — o rei e o escravo, o vencedor e o derrotado.\"",
      "\"Peço apenas que Pars mereça o que está por vir.\""
    ],
    "effect": { "xp": 20, "faction_effects": { "clero_mithra": 5 } },
    "set_flag": "camp_falangies_prayer_seen"
  }
]
```

---

### 4.10 — GLOSSÁRIO COMPLETO

```json
// src/data/lore/glossary.json

[
  { "term": "Pars", "definition": "Grande reino persa, vasto e poderoso, governado pela dinastia Kayani. Capital: Ecbatana. Conhecido por sua cavalaria de elite e sistema de escravatura." },
  { "term": "Ecbatana", "definition": "A capital de Pars. Uma das cidades mais ricas do mundo conhecido. Tomada pelos Lusitanos na queda do Rei Andragoras." },
  { "term": "Atropatene", "definition": "Campo de batalha onde o exército de Pars foi destruído. A traição de Kharlan abriu os portões. Marco zero da invasão Lusitana." },
  { "term": "Lusitanos", "definition": "Povo guerreiro do oeste, movido por fervor religioso em nome de Yaldabaoth. Invadiram Pars sob o comando do Rei Innocentis VII. Excelentes guerreiros, problemáticos administradores." },
  { "term": "Yaldabaoth", "definition": "Deus dos Lusitanos. Religião monoteísta que proíbe a escravatura — o que é, ironicamente, a principal razão de tensão com a nobreza de Pars. Os escravos libertos por Arslan veneram Yaldabaoth parcialmente por isso." },
  { "term": "Mithra", "definition": "Deus tradicional de Pars. Divindade da luz, contratos e honra. O Templo de Mithra foi profanado pelos Lusitanos. Falangies é sacerdotisa de Mithra." },
  { "term": "Daryun", "definition": "O Cavaleiro Negro. Considerado o mais forte guerreiro de Pars. Sobrinho do falecido comandante Vahriz. Leal a Arslan acima de tudo." },
  { "term": "Narsus", "definition": "Estrategista de gênio, exilado por defender a abolição da escravatura. Talento incomparável em tática e planejamento. Pinta quadros terríveis em seu tempo livre." },
  { "term": "Silvermask", "definition": "Guerreiro misterioso de máscara de prata que reivindica o trono de Pars. Sua identidade é desconhecida. Luta com técnica de Pars, não de Lusitânia." },
  { "term": "Kharlan", "definition": "Antigo general de Pars que traiu o Rei Andragoras e abriu as portas de Atropatene para os Lusitanos. Acredita ter agido pelo bem de Pars." },
  { "term": "Rukhnabad", "definition": "Rio sagrado de Pars. Uma câmara antiga em suas margens é considerada local de poder divino. Narsus tem uma explicação alternativa (ver Notas do Erudito)." },
  { "term": "Sindhura", "definition": "Reino poderoso ao sul de Pars. Neutral na guerra, pragmático nos negócios. Famoso pelos elefantes de guerra que podem mudar o rumo de batalhas." },
  { "term": "Turan", "definition": "Confederação de tribos de cavaleiros nômades ao norte. Não têm Estado formal. Respeitam apenas força demonstrada em combate. Cavalaria leve incomparável." },
  { "term": "Andragoras", "definition": "Rei de Pars, pai (adotivo?) de Arslan. Capturado pelos Lusitanos. Sua legitimidade e seu passado são questões abertas." },
  { "term": "Tahamine", "definition": "Rainha de Pars, mãe de Arslan. Figura misteriosa. A natureza de sua relação com Andragoras e a origem de Arslan são temas sensíveis na corte." },
  { "term": "Elam", "definition": "Servo e aprendiz de Narsus. Ex-escravo que encontrou no mestre um propósito e uma família. Arqueiro de talento excepcional para sua idade." },
  { "term": "Gieve", "definition": "Menestrel errante, espadachim e autoproclamado poeta. Inicialmente motivado por interesse próprio, desenvolve lealdade genuína ao grupo. Toca flauta em momentos vulneráveis." },
  { "term": "Falangies", "definition": "Sacerdotisa guerreira de Mithra. Séria, honrada, movida por fé genuína — não fanática. Arqueira de precisão incomparável." }
]
```

---

## PARTE 5 — ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

```
Fase A — Corrigir Bugs (1-2 dias)
  □ Bug 1: parseWar gold_reward em combate
  □ Bug 2: importar factionEngine em FactionsScreen
  □ Bug 3: importar questEngine em JournalScreen
  □ Bug 6: padronizar sistema de flags *_recruited

Fase B — DialogueScreen (3-5 dias)
  □ Criar src/components/dialogue/DialogueScreen.jsx
  □ Criar src/components/dialogue/DialogueBox.jsx
  □ Criar src/components/dialogue/NPCPortrait.jsx (SVGs)
  □ Criar src/data/dialogues/ com JSONs de todos os NPCs
  □ Conectar gamePhase === 'dialogue' ao DialogueScreen em Router
  □ Adicionar botões de NPC nos locais do MapScreen

Fase C — Sistema de Localização (2-3 dias)
  □ Expandir locations.json com npcs[], shop, rest, arrival_scene
  □ MapScreen: locais clicáveis → lista de NPCs
  □ Conectar clique em NPC ao store.startDialogue()
  □ Criar ShopModal dentro do DialogueScreen

Fase D — Habilidades em Combate (2-3 dias)
  □ Criar src/data/skills/skills.json completo
  □ Expandir CombatScreen com botão "Habilidade"
  □ Implementar sistema de cooldown por habilidade
  □ Implementar habilidades lendárias com uses_per_combat: 1
  □ ClassSelectScreen: mostrar habilidades iniciais com efeitos mecânicos

Fase E — Conteúdo (5-7 dias)
  □ Adicionar todos os NPCs ao npcs.json
  □ Adicionar todos os diálogos aos JSONs de dialogue
  □ Substituir side_quests.json pelo side_quests_expanded.json
  □ Adicionar items expandidos
  □ Adicionar inimigos expandidos
  □ Adicionar skills.json

Fase F — Sistemas Adicionais (3-4 dias)
  □ Sistema de descanso (rest: true nos locais)
  □ Loja funcional com compra/venda
  □ Eventos aleatórios de viagem
  □ Eventos de acampamento
  □ Notificações de milestone de facção
  □ Contador de tropas
  □ Glossário com tooltip

Fase G — Polimento (2-3 dias)
  □ Animações de dano em combate
  □ Indicador de progresso do ato
  □ Saves múltiplos + autosave expandido
  □ Tela de Game Over decente
  □ Mobile responsivo completo
  □ Áudio procedural (opcional)
```

---

## NOTAS FINAIS PARA O CLAUDE CODE

1. **Preservar o que funciona.** A narrativa dos 4 atos, o sistema de combate, o store Zustand e as engines estão bem implementados. Não refatorar o que está funcionando — apenas expandir.

2. **DialogueScreen é a prioridade absoluta.** Sem ela, 80% do novo conteúdo é inacessível. Implementar primeiro.

3. **side_quests_expanded.json substitui side_quests.json.** Não fazer merge — substituir o arquivo completamente.

4. **skills.json é novo.** Criar a pasta `src/data/skills/` e o arquivo. Atualizar as fichas de classes e generais para referenciar os IDs de skills.

5. **Habilidades Lendárias precisam de flag de desbloqueio no store.** Ao completar a quest que desbloqueia a habilidade, chamar `store.addLegendarySkill({ character: 'daryun', skillId: 'lanca_dos_mil_exercitos' })`. Implementar essa action no useGameStore.

6. **Todos os novos NPCs precisam de portrait_type.** Criar os SVGs de silhueta no NPCPortrait.jsx para: blacksmith, healer, merchant, noble, soldier, priest, refugee, scholar, commoner, performer, mystic, warrior, mystic.

7. **Glossário.** Usar componente Tooltip wrapper. Ao carregar um parágrafo narrativo, detectar termos do glossário e envolvê-los em `<GlossaryTooltip term="Pars">Pars</GlossaryTooltip>`.

8. **Eventos de acampamento** disparam automaticamente quando o jogador visita a tenda_arslan, desde que o flag de trigger seja verdadeiro e o evento não tenha sido visto. Checar no início do GameScreen se há um evento de acampamento pendente.

9. **Eventos de viagem** disparam com 30% de probabilidade ao usar `store.setCurrentRegion()`. Checar no MapScreen antes de completar a viagem.

10. **Não inventar conteúdo fora do documento.** Todo item, quest, NPC e inimigo deve vir deste documento ou do documento original `arslan-rpg-project.md`.

---
*Documento gerado em: Fevereiro 2026*
*Versão: 2.0.0 — Arslan RPG Next*
*Total de conteúdo novo: 16 NPCs, 20 quests, 60+ itens, 15+ inimigos, 25+ habilidades, 8 eventos de viagem, 5 eventos de acampamento, glossário completo*

---

## PARTE 6 — SISTEMA DE CARÁTER DE ARSLAN

> Não é um medidor visível de "bem/mal". É o mundo reagindo ao tipo de rei que Arslan está se tornando. Invisível para o jogador, mas sentido em todo lugar.

### 6.1 — O Tracker de Caráter

```javascript
// store.player.character_score: número de -100 a +100
// Começa em 0 — neutro, ainda sem forma
// NUNCA mostrar para o jogador. O mundo simplesmente reage.

// Exemplos de mudanças:
// +15: Libertou escravos publicamente
// +10: Perdoou Silvermask (desfecho sábio)
// +10: Priorizou civis durante batalha
// +8:  Recusou riqueza de Hodir; pediu aliança sem contrapartida
// -10: Prometeu manter escravatura para ganhar apoio da nobreza
// -15: Executou prisioneiros para dar exemplo
// -8:  Ignorou grupo de refugiados na estrada
// -20: Puniu Silvermask com crueldade desnecessária
```

### 6.2 — Como o Mundo Reage ao Caráter

```json
// src/data/world/character_reactions.json
[
  {
    "id": "reaction_low_character",
    "trigger_condition": "character_score <= -30",
    "effects": [
      {
        "location": "acampamento_base",
        "scene_change": "O acampamento está mais quieto. Menos pessoas te olham nos olhos.",
        "faction_modifier": { "escravos_libertos": -10 }
      },
      {
        "npc": "daria_slave",
        "dialogue_change": "Daria faz o que você pede. Não oferece mais sugestões."
      },
      {
        "troop_recruitement": "Escravos libertos e refugiados param de se voluntariar. Recrutamento cai 40%.",
        "world_flag": "reputation_feared"
      }
    ]
  },
  {
    "id": "reaction_very_negative",
    "trigger_condition": "character_score <= -60",
    "effects": [
      {
        "scene_injection": "act4_march",
        "text": "Na marcha para Ecbatana, o canto das tropas que virou ritual parou. Os soldados marcham em silêncio.",
        "note": "Pequeno detalhe. Sem fanfarra. O jogador sente se estiver prestando atenção."
      },
      {
        "npc": "narsus",
        "dialogue_change": "Narsus ainda oferece estratégias. Parou de discutir filosofia. É eficiente e distante.",
        "world_flag": "narsus_disillusioned"
      },
      {
        "npc": "etoile_lusitana",
        "dialogue_change": "Etoile não aparece na fronteira. O mensageiro diz que ela 'reconsiderou'.",
        "note": "Etoile só aparece se Arslan demonstrou ser diferente dos outros conquistadores."
      }
    ]
  },
  {
    "id": "reaction_high_character",
    "trigger_condition": "character_score >= 40",
    "effects": [
      {
        "scene_injection": "travel_any",
        "probability": 0.2,
        "text": "Na beira da estrada, um grupo de crianças para e olha a coluna passar. Uma delas acena.",
        "note": "Momentos de esperança que aparecem organicamente, sem anúncio."
      },
      {
        "troop_recruitment": "Refugiados se voluntariam sem que Arslan precise pedir. +50 soldados.",
        "world_flag": "reputation_beloved"
      }
    ]
  },
  {
    "id": "reaction_very_high_character",
    "trigger_condition": "character_score >= 70",
    "effects": [
      {
        "scene_injection": "act4_ecbatana_walls",
        "text": "Quando o exército de Arslan chega às muralhas, um sino começa a soar de dentro. Depois outro. Depois mais.",
        "text_2": "Não é alarme. É o sino do Templo de Mithra — o mesmo que os Lusitanos proibiram tocar.",
        "text_3": "Alguém dentro da cidade está abrindo os portões por dentro.",
        "note": "Recompensa narrativa máxima. O povo age por conta própria. Nenhum texto de 'você ganhou'. A cena diz tudo.",
        "gameplay_effect": "Batalha de Ecbatana: -2 inimigos iniciais. Portão abre automaticamente no turno 3."
      }
    ]
  }
]
```

---

## PARTE 7 — ÁRVORES DE DIÁLOGO DRAMÁTICAS

### 7.1 — O Confronto com Kharlan (Antes do Boss)

> Kharlan não é vilão simples. Acredita genuinamente que salvou Pars de um rei pior. Este diálogo acontece antes do combate. Substitui a transição direta para boss_kharlan.

```json
{
  "id": "kharlan_confrontation",
  "title": "O Último General",
  "type": "dramatic_dialogue",
  "text": [
    "Kharlan está sozinho na ponte. Poderia ter fugido. Escolheu não fugir.",
    "Ele te olha por um longo momento — não com ódio. Com algo mais difícil de nomear.",
    "\"Você cresceu, Arslan. Parece seu pai quando jovem.\" Uma pausa. \"Antes de Andragoras se tornar o que se tornou.\""
  ],
  "choices": [
    {
      "id": "accuse",
      "text": "\"Você destruiu Pars. Milhares morreram por causa de você.\"",
      "npc_response": "\"Milhares morreriam de qualquer forma. Andragoras estava levando Pars para uma guerra de três frentes que não podíamos ganhar. Eu vi os mapas que ele escondia. O que eu fiz foi cirurgia. Dolorosa. Mas cirurgia.\"",
      "choices": [
        {
          "id": "dont_believe",
          "text": "\"Mentiras de um traidor para justificar covardia.\"",
          "character_score": -3,
          "leads_to_combat": true,
          "combat_mood": "angry"
        },
        {
          "id": "consider",
          "text": "\"Mesmo que seja verdade — havia outro caminho. Sempre há.\"",
          "character_score": +5,
          "npc_response": "Kharlan para. Algo quebra na expressão dele. \"Talvez. Eu já não sei mais.\" Ele ergue a espada. \"Mas é tarde demais para os dois.\"",
          "leads_to_combat": true
        }
      ]
    },
    {
      "id": "ask_why",
      "text": "\"Por quê, Kharlan? Você era o general mais respeitado de Pars.\"",
      "character_score": +3,
      "npc_response": "A pergunta parece surpreendê-lo. Não a acusação — a pergunta honesta.",
      "npc_response_2": "\"Porque eu vi o que Andragoras planejava para os nobres que o questionavam. Para sua rainha.\" Uma pausa. \"Para você.\"",
      "choices": [
        {
          "id": "press_origin",
          "text": "\"O que você sabe sobre mim?\"",
          "condition": "NOT knows_true_origin",
          "npc_response": "\"Pergunte à rainha Tahamine, se a encontrar. Não é minha história para contar.\" Ele levanta a espada. \"Lute como filho de Pars. É o mínimo que lhe peço.\"",
          "set_flag": "kharlan_hinted_origin",
          "leads_to_combat": true
        },
        {
          "id": "press_origin_knows",
          "text": "\"Você sabia sobre minha origem.\"",
          "condition": "knows_true_origin",
          "npc_response": "\"Eu sabia.\" Sem negação. \"E mesmo assim você é mais Arslan de Pars do que qualquer sangue poderia fazer de você.\" Ele olha para o horizonte. \"Lute bem, príncipe. Mereça o que vem a seguir.\"",
          "character_score": +5,
          "leads_to_combat": true,
          "combat_mood": "resigned",
          "note": "No mood resignado, Kharlan não usa sua habilidade de sangramento. Luta limpo, como se estivesse pronto para perder."
        }
      ]
    },
    {
      "id": "offer_mercy",
      "text": "[CAR 15] \"Venha conosco, Kharlan. Ajude a reconstruir o que ajudou a quebrar.\"",
      "condition": "CAR >= 15",
      "character_score": +10,
      "roll": { "attribute": "CAR", "dc": 15 },
      "success": {
        "npc_response": "O silêncio dura muito. \"Eu matei homens que confiavam em mim. Essa dívida não se paga com uma segunda chance.\" Ele abaixa a espada. \"Vá. Não vou lutar hoje. Mas não posso seguir você.\"",
        "character_score_bonus": +8,
        "set_flag": "kharlan_spared_no_fight",
        "skip_combat": true
      },
      "failure": {
        "npc_response": "\"Você acredita nisso. Eu consigo ver.\" Ele ergue a espada. \"Mas há coisas que não têm conserto. Vamos terminar com honra.\"",
        "leads_to_combat": true
      }
    }
  ]
}
```

### 7.2 — Tahamine — A Conversa Que o Jogo Inteiro Construiu

> Uma das cenas mais pesadas. Só aparece se o jogador foi atrás das pistas. Precisa ser conquistada.

```json
{
  "id": "tahamine_encounter",
  "title": "A Rainha no Exílio Interno",
  "unlock_condition": "kharlan_hinted_origin OR knows_true_origin AND act4_started",
  "location": "salao_privado_palacio",
  "note": "Tahamine está esperando. Como se soubesse que Arslan viria.",
  "text": [
    "Tahamine está sentada junto à janela, olhando o incêndio lá fora com a expressão de quem esperou por isso há muito tempo.",
    "\"Arslan.\" Não é saudação. É reconhecimento. Como se estivesse checando um cálculo feito anos atrás."
  ],
  "choices": [
    {
      "id": "ask_truth",
      "text": "\"Mãe. Preciso saber a verdade sobre minha origem.\"",
      "npc_response": "\"Eu me perguntei se você chegaria até esta pergunta.\" Uma pausa longa. \"Andragoras achava que você nunca descobriria. Ou que não sobreviveria para descobrir.\"",
      "choices": [
        {
          "id": "let_her_speak",
          "text": "Ficar em silêncio. Deixá-la falar.",
          "character_score": +5,
          "npc_response_sequence": [
            "\"Andragoras e eu não tivemos filhos. Os anos passaram. A pressão da corte aumentou.\"",
            "\"Havia um prisioneiro político no calabouço. Um homem de sangue nobre, inimigo de Andragoras.\" Ela olha para você. \"Você tem os olhos dele.\"",
            "\"Andragoras nunca soube. Ou nunca quis saber. As duas opções eram convenientes.\"",
            "\"O que você é, Arslan — o que você escolheu ser — não tem nada a ver com esse sangue. Mas você merecia saber.\""
          ],
          "set_flag": "tahamine_truth_revealed"
        },
        {
          "id": "angry",
          "text": "\"Toda minha vida foi construída sobre uma mentira.\"",
          "character_score": -3,
          "npc_response": "Tahamine não se defende. \"Sim.\" Só isso. \"E você cresceu e se tornou alguém que nenhuma das mentiras conseguiu conter. Isso é seu. Não foi planejado.\"",
          "set_flag": "tahamine_truth_revealed"
        }
      ]
    },
    {
      "id": "ask_about_andragoras",
      "text": "\"Onde está Andragoras?\"",
      "npc_response": "\"Vivo.\" Sem emoção. \"Os lusitanos o mantêm como símbolo. Ele não vai agradecer o resgate.\"",
      "choices": [
        {
          "id": "will_rescue",
          "text": "\"Ainda assim. Ele é o rei de Pars.\"",
          "character_score": +8,
          "npc_response": "\"Você é mais generoso do que ele merece.\" Uma pausa. \"Do que nós merecemos.\"",
          "set_flag": "will_rescue_andragoras"
        },
        {
          "id": "leave_him",
          "text": "\"Pars já tem um príncipe.\"",
          "character_score": -5,
          "npc_response": "\"Cuidado com isso, Arslan.\" A voz muda — não julgamento, aviso. \"Reis que começam pragmáticos costumam terminar como Andragoras.\"",
          "set_flag": "abandoned_andragoras"
        }
      ]
    },
    {
      "id": "ask_if_loves",
      "text": "\"Você me amou? Como filho, quero dizer.\"",
      "condition": "tahamine_truth_revealed",
      "npc_response": "Ela fica completamente imóvel. Depois: \"Quando você era pequeno, você chorava e eu ficava acordada. Não por obrigação. Por não conseguir dormir enquanto você chorava.\" Ela vai para a janela. \"Faça o que tem que fazer, Arslan.\"",
      "character_score": +5
    }
  ],
  "exit_scene": {
    "text": "Você está saindo quando ela fala de novo, de costas.",
    "final_line": "\"Arslan. Cuide-se. Não porque Pars precisa de você.\" Uma pausa. \"Porque eu prefiro.\"",
    "note": "Sem fanfarra. Ela volta a olhar pela janela."
  }
}
```

### 7.3 — Etoile — A Conversa Que Pode Mudar a Guerra

```json
{
  "id": "etoile_full_dialogue",
  "unlock_condition": "act4_started AND character_score >= -20",
  "note": "Se character_score < -20, Etoile ouviu sobre as ações de Arslan e não aparece. A aliança moderada está permanentemente bloqueada.",

  "opening": [
    "Ela aparece sozinha, sem capacete — gesto deliberado.",
    "\"Príncipe Arslan. Eu me chamo Etoile. Sou soldada de Yaldabaoth — e não vim lutar.\"",
    "\"Vim perguntar se você quer evitar que mais gente morra.\""
  ],

  "choices": [
    {
      "id": "open",
      "text": "\"Estou ouvindo.\"",
      "character_score": +3,
      "npc_response": "\"Há soldados em Ecbatana que estão lá porque foram ordenados. Que não escolheram esta guerra.\" Ela te olha. \"Não são todos Silvermask.\"",
      "choices": [
        {
          "id": "distinguish",
          "text": "\"Há diferença entre quem obedeceu e quem queimou aldeias. Estou ouvindo essa diferença.\"",
          "character_score": +8,
          "npc_response": "Algo relaxa nela. \"Então há esperança.\" Ela tira um mapa. \"Posso dizer quais unidades vão pousar as armas se você garantir que não serão executadas.\"",
          "unlock_flag": "etoile_intel",
          "gameplay_effect": "Revela posições em act4. Uma unidade rende sem combate.",
          "leads_to": "etoile_alliance_offer"
        },
        {
          "id": "skeptical",
          "text": "\"Como sei que isso não é armadilha?\"",
          "npc_response": "\"Não sabe.\" Direto. \"Vim sozinha, sem armadura completa, até um exército inimigo. Isso é tudo que tenho.\" Uma pausa. \"Se for armadilha, é a pior da história.\"",
          "leads_to": "etoile_alliance_offer"
        }
      ]
    },
    {
      "id": "hostile",
      "text": "\"Lusitanos mataram meu povo. Não tenho nada para conversar.\"",
      "character_score": -5,
      "npc_response": "\"Eu entendo.\" Ela coloca o capacete. \"Sinto pelo que meu povo fez. E sinto por esta conversa não ter acontecido.\"",
      "outcome": "Etoile sai. Aliança moderada fechada para sempre. Combate final +3 inimigos.",
      "leads_to_exit": true
    },
    {
      "id": "ask_faith",
      "text": "\"Você acredita em Yaldabaoth. Como concilia com o que vê?\"",
      "character_score": +5,
      "npc_response": "Longa pausa. \"Yaldabaoth proíbe escravatura. Foi o que me fez acreditar.\" Ela olha para o horizonte. \"Tem homens usando meu deus para justificar coisas que ele jamais ordenaria.\"",
      "npc_response_2": "\"E eu demorei para enxergar isso.\"",
      "leads_to": "etoile_alliance_offer"
    }
  ],

  "etoile_alliance_offer": {
    "text": "\"Se você garantir que soldados que pousarem armas serão prisioneiros de guerra — não executados — eu consigo que um terço da guarnição não lute.\"",
    "choices": [
      {
        "id": "accept",
        "text": "\"Tenho minha palavra. Prisioneiros serão tratados com dignidade.\"",
        "character_score": +10,
        "set_flag": "lusitano_pows_protected",
        "faction_effects": { "lusitanos_moderados": 30 },
        "gameplay_effect": "Batalha de Ecbatana: -4 inimigos totais. 1 cena de rendição sem combate.",
        "warning": "Esta promessa precisa ser honrada. Se o jogador matar prisioneiros depois: character_score -20 e Etoile nunca mais aparece."
      },
      {
        "id": "cant_promise",
        "text": "\"Não consigo controlar o calor da batalha.\"",
        "character_score": -3,
        "npc_response": "\"Então você não é o tipo de líder que eu esperava.\" A oferta é menor — apenas 1 unidade rende.",
        "set_flag": "etoile_partial_alliance"
      }
    ]
  }
}
```

### 7.4 — Narsus × Arslan — A Conversa Sobre Escravatura

> Acontece no acampamento, Ato 2. Narsus inicia automaticamente. Não tem combate. É só peso moral real.

```json
{
  "id": "narsus_slavery_talk",
  "trigger": "camp_established AND NOT narsus_slavery_talk_seen",
  "note": "Narsus inicia esta conversa. Acontece na primeira visita à tenda dele após o acampamento ser estabelecido.",
  "opening": [
    "Narsus não está trabalhando quando você entra. Está sentado, olhando uma folha em branco.",
    "\"Arslan. Sente-se. Você vai precisar do apoio da nobreza para retomar o trono.\" Ele finalmente olha para você. \"E a nobreza vai querer que a escravatura continue.\""
  ],
  "choices": [
    {
      "id": "abolish",
      "text": "\"Pars vai abolir a escravatura. Mesmo que custe apoio da nobreza.\"",
      "character_score": +15,
      "npc_response": "Narsus te olha por um longo momento. \"Eu fui exilado por dizer exatamente isso.\" Ele dobra a folha. \"Saiba o que significa: alguns nobres vão te abandonar. Outros vão financiar seu oponente.\" Uma pausa. \"Ainda assim?\"",
      "choices": [
        {
          "id": "still_yes",
          "text": "\"Ainda assim.\"",
          "character_score": +10,
          "npc_response": "Narsus abre um sorriso raro. \"Então vou precisar de mapas melhores. Porque este plano vai precisar de estratégia excepcional.\"",
          "set_flag": "arslan_committed_to_abolition",
          "faction_effects": { "escravos_libertos": 20, "nobreza_pars": -15 }
        }
      ]
    },
    {
      "id": "gradual",
      "text": "\"A escravatura precisa acabar. Mas gradualmente.\"",
      "character_score": +3,
      "npc_response": "\"Gradualmente.\" Ele examina a palavra. \"É o que todo rei progressista diz. Depois vira 'eventualmente'. Depois vira nunca.\"",
      "npc_response_2": "\"Mas entendo a posição. Só quero que você ouça o que está dizendo quando usa essa palavra.\"",
      "set_flag": "arslan_gradualist"
    },
    {
      "id": "maintain",
      "text": "\"Precisamos da nobreza. A escravatura continua por agora.\"",
      "character_score": -15,
      "npc_response": "Silêncio longo.",
      "npc_response_2": "\"Certo.\" Narsus dobra a folha. \"Vou continuar trabalhando nos mapas.\"",
      "npc_response_3": "Nada mais. A conversa acabou.",
      "note": "Narsus não discute. Não explode. Simplesmente fecha. Isso é mais devastador do que qualquer confronto.",
      "set_flag": "arslan_kept_slavery",
      "faction_effects": { "escravos_libertos": -25, "nobreza_pars": 15 }
    }
  ],
  "set_flag": "narsus_slavery_talk_seen"
}
```

---

## PARTE 8 — COMBATES ÉPICOS COM DRAMA

### 8.1 — Sistema de Diálogo em Combate (mid_combat_events)

```javascript
// Novo campo em todos os combates boss: "mid_combat_events"
// Array de eventos disparados por condições durante o combate

// Estrutura:
{
  "mid_combat_events": [
    {
      "id": "event_unique_id",
      "trigger": "boss_hp_reaches_50",   // ou "player_ally_falls", "turn_3", etc.
      "triggered": false,                 // setar true após disparar
      "text": "Texto narrado no log de combate com formatação especial.",
      "choices": []                       // Opcional. Se presente, pausa o combate.
    }
  ]
}

// Implementar em CombatScreen:
// Após cada turno, iterar sobre mid_combat_events.
// Se trigger satisfeito e triggered !== true:
//   - Pausar combate
//   - Mostrar texto no log com borda dourada e fundo escuro
//   - Processar choices se existirem (botões substituem ActionBar temporariamente)
//   - Marcar triggered: true
//   - Retomar combate
```

### 8.2 — Boss Kharlan — Combate Completo Remodelado

```json
{
  "id": "boss_kharlan",
  "name": "Kharlan, O General Traidor",
  "hp": 80, "ca": 18, "pa": 4,
  "attributes": { "FOR": 18, "DES": 15, "CON": 17, "INT": 14, "SAB": 13, "CAR": 14 },
  "weapon": { "name": "Lança de Pars", "damage": "1d10+4", "bonus_atk": 3 },
  "on_hit_effect": { "name": "bleed", "chance": 0.3, "duration": 2 },
  "passive": "Veterano: ignora o primeiro crítico recebido por combate.",
  "ai": "tactical_boss",
  "xp": 500, "gold": 0,

  "mid_combat_events": [
    {
      "id": "kharlan_60",
      "trigger": "boss_hp_reaches_60",
      "text": "Kharlan ri — não de escárnio, de reconhecimento. \"Você aprendeu a lutar. Bem.\" Ele ajusta a lança. \"Mas aprendi mais cedo.\""
    },
    {
      "id": "kharlan_40",
      "trigger": "boss_hp_reaches_40",
      "text": "Pela primeira vez, Kharlan recua meio passo. Para avaliar.",
      "text_2": "\"Você poderia ter sido rei de um Pars diferente.\" A voz é séria agora. \"Talvez ainda possa.\"",
      "choices": [
        { "id": "advance", "text": "Avançar sem responder.", "effect": "combat_continues" },
        {
          "id": "last_offer",
          "text": "\"Ainda não é tarde, Kharlan.\"",
          "condition": "CAR >= 13",
          "effect": "kharlan_hesitates",
          "mechanical_effect": "Kharlan perde 1 PA no próximo turno.",
          "character_score": +5
        }
      ]
    },
    {
      "id": "kharlan_20",
      "trigger": "boss_hp_reaches_20",
      "text": "Kharlan está exausto. Mas não vai cair sem decisão consciente.",
      "text_2": "\"Termine isso, Arslan. Não preciso de misericórdia.\""
    }
  ],

  "defeat_scene": {
    "text": "Kharlan cai de joelhos. A lança no chão. Ainda respira.",
    "choices": [
      {
        "id": "execute",
        "text": "Executar Kharlan. Justiça por Atropatene.",
        "character_score": -5,
        "world_flag": "kharlan_executed",
        "scene_text": "A lâmina cai. Silêncio. Daryun não diz nada. Narsus não diz nada.",
        "scene_text_2": "Você percebe que Elam está de costas. Recusando assistir.",
        "faction_effects": { "nobreza_pars": 5, "escravos_libertos": -5 }
      },
      {
        "id": "spare",
        "text": "Deixá-lo viver. Que carregue o peso.",
        "character_score": +8,
        "condition": "character_score >= -10",
        "world_flag": "kharlan_spared",
        "scene_text": "Você abaixa a espada. Kharlan olha com expressão que não consegue esconder — surpresa. Depois algo que pode ser vergonha.",
        "scene_text_2": "\"Por que?\"",
        "scene_text_3": "\"Porque eu prefiro não me tornar o que combato.\"",
        "character_score_bonus": +5,
        "unlock": "kharlan_in_epilogue"
      },
      {
        "id": "let_daryun",
        "text": "Olhar para Daryun. A decisão é dele.",
        "scene_text": "Daryun não hesita. Quando acabou, ele devolve a espada à bainha.",
        "scene_text_2": "\"Era necessário.\" Ele fala de costas para você. \"Não foi suficiente.\"",
        "world_flag": "kharlan_executed_by_daryun"
      }
    ]
  }
}
```

### 8.3 — Boss Silvermask Fase 1 — Com Revelação Durante Combate

```json
{
  "id": "boss_silvermask_phase1",
  "name": "Silvermask — O Pretendente",
  "hp": 90, "ca": 19, "pa": 4,
  "attributes": { "FOR": 18, "DES": 17, "CON": 16, "INT": 17, "SAB": 14, "CAR": 18 },
  "weapon": { "name": "Lâmina de Prata", "damage": "2d8+4", "bonus_atk": 4 },
  "on_hit_effect": { "name": "bleed", "chance": 0.2, "duration": 2 },

  "pre_combat_scene": {
    "text": [
      "Silvermask está sozinho no salão do trono. Como se soubesse que você viria.",
      "Narsus fala baixo: \"Olhe como segura a espada. A posição dos pés.\" Uma pausa. \"Ele foi treinado em Pars.\"",
      "Silvermask remove o manto. A máscara reflete as chamas.",
      "\"Arslan.\" A voz é quieta. Quase íntima. \"Nos encontramos finalmente.\""
    ],
    "choices": [
      { "id": "ask", "text": "\"Quem é você?\"", "npc_response": "\"Sou aquele que deveria estar onde você está.\"" },
      {
        "id": "know",
        "text": "\"Hermes. Filho de Osroes. O príncipe que Andragoras apagou.\"",
        "condition": "knows_true_origin",
        "npc_response": "Pausa longa. A postura muda. \"Você descobriu.\" Não é negação. \"Então sabe que tenho mais direito a este trono.\"",
        "character_score": +5
      }
    ]
  },

  "mid_combat_events": [
    {
      "id": "mask_cracks",
      "trigger": "boss_hp_reaches_65",
      "text": "A máscara racha. Não cai — mas pela primeira vez você vê a pele embaixo. A cicatriz na têmpora.",
      "text_2": "Hermes não para. Mas ele sabe que você viu."
    },
    {
      "id": "hermes_voice_breaks",
      "trigger": "boss_hp_reaches_45",
      "text": "\"Você luta diferente do que esperava.\" A voz de Hermes, pela primeira vez, não é fria.",
      "text_2": "\"Andragoras nunca me ensinou a lutar. Tive que aprender sozinho.\" Ele ataca. \"Com o que sobrou.\""
    },
    {
      "id": "daryun_falls_note",
      "trigger": "player_ally_falls AND ally_id == daryun",
      "text": "Hermes vê Daryun cair. Para por um segundo. \"O Cavaleiro Negro.\" Algo na voz. \"Ele era leal ao meu pai também, antes de Andragoras.\"",
      "note": "Revelação de lore plantada no meio do caos."
    },
    {
      "id": "mask_falls",
      "trigger": "boss_hp_reaches_20",
      "text": "A máscara finalmente cai.",
      "text_2": "O rosto embaixo é jovem. Mais jovem do que a voz deixava entender. Cheio de cicatrizes — não de batalha. Antigas. Anteriores.",
      "note": "O jogador vê Hermes como pessoa pela primeira vez. Um rapaz que cresceu com ódio como único combustível.",
      "leads_to_phase2": true
    }
  ]
}
```

### 8.4 — Boss Silvermask Fase 2 — A Decisão Final

```json
{
  "id": "boss_silvermask_phase2",
  "name": "Hermes — O Príncipe Sem Reino",
  "hp": 60, "ca": 18, "pa": 5,
  "weapon": { "name": "Lâmina de Prata (Frenesi)", "damage": "2d10+5", "bonus_atk": 4 },
  "on_hit_effect": { "name": "stunned", "chance": 0.15, "duration": 1 },
  "ai": "desperate_aggressive",
  "phase_transition_text": "Hermes vai para a frente mais rápido, mais desesperado — como se a máscara tivesse contido algo que agora está solto.",

  "mid_combat_events": [
    {
      "id": "hermes_incredulous",
      "trigger": "boss_hp_reaches_30",
      "text": "Hermes tropeça. Se mantém de pé pela força da vontade.",
      "text_2": "\"Passei a vida inteira...\" Ele arqueja. \"...para chegar até aqui.\" Ele olha para você com incredulidade. \"E você mal parece satisfeito com a vitória.\""
    }
  ],

  "defeat_scene": {
    "text": "Hermes cai. Desta vez não se levanta.",
    "text_2": "A sala está em silêncio. Fora, o ruído da batalha diminuindo.",
    "text_3": "Hermes ainda está consciente. Olha para o teto. \"Então é assim.\""
  },

  "final_choices": [
    {
      "id": "execute",
      "text": "Executar Hermes.",
      "character_score": -8,
      "world_flag": "hermes_executed",
      "ending": "ending_just",
      "scene_text": "Você levanta a espada.",
      "scene_text_2": "Narsus, atrás de você: \"Arslan.\" Só o nome. O tom diz: pense bem.",
      "faction_effects": { "nobreza_pars": 10, "escravos_libertos": -5 }
    },
    {
      "id": "spare",
      "text": "Deixar Hermes viver.",
      "character_score": +10,
      "condition": "character_score >= 0",
      "world_flag": "hermes_spared",
      "ending": "ending_merciful",
      "scene_text": "\"Por quê?\" A voz dele é diferente. Sem veneno. Genuína.",
      "scene_text_2": "\"Porque destruir tudo que te fizeram não vai criar um reino melhor.\" Você abaixa a espada. \"E porque Pars vai precisar de alguém que entenda o preço de um erro.\"",
      "scene_text_3": "Hermes não agradece. Não promete nada. Fecha os olhos — e é o movimento mais humano que você viu dele."
    },
    {
      "id": "redeem",
      "text": "[CAR 16 + knows_true_origin] \"Você não tem reino, Hermes. Mas pode ajudar a construir um.\"",
      "condition": "CAR >= 16 AND knows_true_origin AND character_score >= 20",
      "character_score": +15,
      "world_flag": "hermes_redemption_path",
      "ending": "ending_wise",
      "scene_text": "\"Você sabe quem eu sou. O que eu fiz. E ainda...\"",
      "scene_text_2": "\"Pars foi destruída por homens que preferiram ter razão a fazer o certo.\" Você oferece a mão. \"Não vou ser mais um.\"",
      "scene_text_3": "Longo silêncio. Hermes olha para a mão. Para o rosto de Arslan.",
      "scene_text_4": "\"Eu vou odiar cada segundo disso.\"",
      "scene_text_5": "\"Eu sei.\""
    }
  ]
}
```

---

## PARTE 9 — CENAS DE IMPACTO MUNDIAL

### 9.1 — A Decisão dos Escravos

```json
{
  "id": "slavery_proclamation_scene",
  "trigger_condition": "arslan_committed_to_abolition AND camp_established",
  "title": "A Proclamação",
  "text": [
    "Narsus traz o pergaminho. Uma única linha: todo escravo nos territórios sob controle de Arslan está livre.",
    "\"Uma vez assinado, isso vaza.\" Narsus é direto. \"Em 48 horas, cada nobre de Pars vai saber.\"",
    "\"E os lusitanos?\"",
    "\"Yaldabaoth proíbe escravatura.\" Uma pausa. \"Sua declaração vai ser mais fiel ao deus deles do que a guerra deles foi.\""
  ],
  "choices": [
    {
      "id": "sign",
      "text": "Assinar.",
      "character_score": +20,
      "world_flag": "slavery_abolished",
      "world_changes": [
        "NPCs escravos libertos ganham diálogos novos",
        "Dois nobres de Pars abandonam a aliança abertamente",
        "Lord Hodir manda mensageiro: reconsiderando apoio",
        "Elam fica em silêncio por um momento. Depois: 'Obrigado, Alteza.' Só isso."
      ],
      "faction_effects": { "escravos_libertos": 30, "nobreza_pars": -25, "lusitanos_moderados": 15 },
      "troop_changes": { "gained": 300, "lost": 150 },
      "scene_after": "Do lado de fora, você ouve vozes. Não gritos de guerra. Pessoas conversando, rindo, chorando."
    },
    {
      "id": "delay",
      "text": "\"Depois da reconquista.\"",
      "character_score": -5,
      "world_flag": "slavery_postponed",
      "scene_after": "Narsus dobra o pergaminho em silêncio. \"Como quiser.\" Completamente neutro. Você nota que Elam saiu da tenda sem dizer nada."
    }
  ]
}
```

### 9.2 — O Conselho de Guerra Final

> Antes de Ecbatana. Cada general presente tem uma fala diferente dependendo do estado do jogo.

```json
{
  "id": "final_war_council",
  "title": "A Véspera",
  "trigger": "act4_started AND battle_plan_chosen",
  "scene_text": "A noite antes de Ecbatana. O fogo central reuniu todo mundo — sem que ninguém convocasse. Apenas aconteceu.",

  "general_lines": {
    "daryun": {
      "default": "\"Amanhã lutamos pela última vez neste exílio. Depois de amanhã —\" ele para. \"Depois de amanhã é outra coisa.\"",
      "if_high_loyalty_or_character": "\"Servi muitos homens, Arslan. Poucos mereceram.\" Uma pausa longa. \"Você merece.\""
    },
    "narsus": {
      "default": "\"Os números estão razoavelmente a nosso favor. 'Razoavelmente' tem que ser suficiente.\"",
      "if_slavery_abolished": "\"Quando Ecbatana cair e você anunciar a proclamação, vai haver caos.\" Ele quase sorri. \"O tipo bom de caos.\"",
      "if_slavery_postponed": "Narsus não fala. Está a distância, olhando os mapas.",
      "note": "O silêncio de Narsus é mais pesado do que qualquer discurso."
    },
    "elam": {
      "default": "\"Mestre Narsus me ensinou que planejar é bom, mas às vezes a flecha vai onde precisa ir.\" Ele verifica o arco pela décima vez. \"Acho que entendo agora.\"",
      "if_quest_completed": "\"Eu nunca pensei que ia estar aqui.\" Uma pausa. \"Obrigado, Alteza. Por tudo.\""
    },
    "gieve": {
      "default": "\"Já escrevi a canção sobre isso. Antes mesmo de acontecer.\" Ele afina a flauta. \"Confiança artística.\"",
      "if_quest_completed": "\"Vim atrás de Falangies. Fiquei por algo diferente.\" Ele não especifica o quê."
    },
    "falangies": {
      "default": "Falangies rezou desde o pôr do sol. Quando termina: \"Mithra vê o que fazemos com o que nos foi dado.\" Ela te olha. \"Mostre a ele.\"",
      "if_clero_80_plus": "\"O Templo de Mithra vai tocar os sinos amanhã.\" Ela diz com certeza absoluta. \"Ele está esperando.\""
    }
  },

  "arslan_final_line": {
    "prompt": "Todos olham para Arslan.",
    "options": [
      {
        "id": "duty",
        "text": "\"Lutamos pelo dever. Por Pars. Pelo que este reino ainda pode ser.\"",
        "character_score": +3
      },
      {
        "id": "people",
        "text": "\"Não luto pelo trono. Luto pelas pessoas que merecem um país melhor.\"",
        "character_score": +8,
        "condition": "character_score >= 10",
        "note": "Esta opção só existe se Arslan tiver agido consistentemente. Não se pode dizer o que não se viveu."
      },
      {
        "id": "silence",
        "text": "Não dizer nada. Apenas acenar e se levantar.",
        "character_score": +2,
        "scene_note": "Daryun levanta junto. Depois Narsus. Depois todos. Sem palavras."
      }
    ]
  }
}
```

---

## PARTE 10 — ROTA DE SINDHURA (COMPLETA)

> Esta rota estava completamente em branco. É a única forma de obter elefantes de guerra, que mudam o combate final mecanicamente.

```json
// ADICIONAR em act3_alliance.json após a cena war_council

[
  {
    "id": "sindhura_decision",
    "title": "A Proposta de Narsus",
    "text": [
      "Narsus aponta para o sul no mapa.",
      "\"Sindhura. Rajendra e seu irmão Gadhevi disputam o trono. Se apoiarmos o lado certo — e ele vencer — ganhamos aliança e elefantes de guerra.\"",
      "Daryun: \"Envolvimento em política estrangeira enquanto Pars está ocupada.\"",
      "Narsus: \"A batalha de Ecbatana tem muros altos. Elefantes ignoram muros.\""
    ],
    "choices": [
      { "id": "pursue", "text": "\"Vale o desvio.\"", "next_scene": "sindhura_border", "unlock_region": "sindhura" },
      { "id": "skip", "text": "\"Não temos tempo. Kashan é suficiente.\"", "next_scene": "act3_post_council", "note": "Combate final sem elefantes — mais difícil." }
    ]
  },
  {
    "id": "sindhura_border",
    "title": "A Fronteira",
    "text": [
      "Guardas com turbantes dourados bloqueiam a estrada.",
      "\"Parsenses não entram sem convite do Rei.\"",
      "Narsus, baixo: \"Dois modos de entrar: autoridade ou conexão.\""
    ],
    "choices": [
      { "id": "authority", "text": "\"Sou Arslan, Príncipe de Pars. Solicito audiência.\"", "next_scene": "sindhura_palace_entry" },
      { "id": "connection", "text": "[Carta de Shapur] Apresentar a carta do mercador.", "condition": "has_item_shapur_letter", "next_scene": "sindhura_palace_entry_easy" },
      { "id": "diplomacy", "text": "[Diplomata CAR 14] Encontrar terreno comum com o oficial.", "condition": "class == diplomat AND CAR >= 14", "next_scene": "sindhura_palace_entry_easy" }
    ]
  },
  {
    "id": "sindhura_palace_entry",
    "title": "O Palácio de Rajendra",
    "text": [
      "O palácio de Sindhura é mais úmido, mais colorido, mais barulhento do que tudo em Pars.",
      "Rajendra recebe vocês num salão aberto. É mais jovem do que Arslan esperava.",
      "\"O príncipe de Pars.\" Ele te examina. \"Meu pai dizia que Pars era invencível.\" Uma pausa. \"E então caiu. Interessante.\"",
      "Narsus murmura: \"Honesto. Cuidado.\""
    ],
    "choices": [
      { "id": "direct", "text": "\"Vim pedir aliança. Ofereço comércio favorável e reconhecimento de sua legitimidade.\"", "next_scene": "sindhura_negotiation" },
      { "id": "appeal", "text": "\"Proponho que Sindhura e Pars não repitam o erro dos reinos que caíram isolados.\"", "character_score": +2, "next_scene": "sindhura_negotiation" },
      { "id": "curious", "text": "\"Seu pai via Pars como invencível. O que você vê?\"", "character_score": +3, "npc_response": "Rajendra ri. Genuíno. \"Depende do que vai me oferecer.\"", "next_scene": "sindhura_negotiation" }
    ]
  },
  {
    "id": "sindhura_negotiation",
    "title": "O Preço da Aliança",
    "text": [
      "Rajendra propõe: apoio de Arslan nas províncias do norte — disputadas com Gadhevi — em troca de elefantes de guerra.",
      "Narsus: \"Viável. Mas atrasa Ecbatana em duas semanas.\"",
      "Daryun: \"Duas semanas que os lusitanos usam para reforçar as defesas.\"",
      "Narsus: \"Duas semanas que valem um terço a mais de força de ataque.\""
    ],
    "choices": [
      {
        "id": "accept_full",
        "text": "\"Aceito. Ajudamos no norte.\"",
        "world_flag": "sindhura_full_alliance",
        "faction_effects": { "sindhura": 40 },
        "troop_bonus": 400,
        "gameplay_note": "Elefantes de guerra: -3 CA nos inimigos de muralha. +15 dano em combate de cerco.",
        "next_scene": "sindhura_northern_campaign"
      },
      {
        "id": "negotiate",
        "text": "[Estrategista / Diplomata] Propor ajuda diplomática ao invés de militar.",
        "condition": "class == strategist OR class == diplomat",
        "world_flag": "sindhura_partial_alliance",
        "faction_effects": { "sindhura": 25 },
        "troop_bonus": 200,
        "next_scene": "sindhura_departure"
      },
      {
        "id": "decline",
        "text": "\"Não podemos atrasar. Obrigado pela audiência.\"",
        "world_flag": "sindhura_no_alliance"
      }
    ]
  },
  {
    "id": "sindhura_northern_campaign",
    "title": "As Províncias do Norte",
    "text": [
      "O general de Gadhevi espera com 200 homens. Não está aqui para negociar.",
      "Narsus examina o terreno. \"A colina ali. Se chegarmos antes deles, o combate termina em dez minutos.\""
    ],
    "combat": {
      "name": "Campanha do Norte de Sindhura",
      "enemies": [
        { "name": "General de Gadhevi", "hp": 38, "ca": 16, "pa": 3, "weapon": { "name": "Cimitarra Cerimonial", "damage": "1d10+3", "bonus_atk": 2 } },
        { "name": "Cavaleiro de Gadhevi", "hp": 22, "ca": 14, "pa": 3, "weapon": { "name": "Lança de Cavalaria", "damage": "1d8+2" } },
        { "name": "Cavaleiro de Gadhevi", "hp": 22, "ca": 14, "pa": 3, "weapon": { "name": "Lança de Cavalaria", "damage": "1d8+2" } }
      ],
      "xp_reward": 350,
      "mid_combat_event": {
        "trigger": "boss_hp_reaches_50",
        "text": "O general para — olha seus homens em desvantagem.",
        "choices": [
          { "id": "offer_terms", "text": "Oferecer rendição honrada.", "condition": "CAR >= 12", "outcome": "General rende. +Rajendra reputation +5.", "skip_remaining": true },
          { "id": "continue", "text": "Continuar lutando." }
        ]
      }
    },
    "next_scene": "sindhura_departure"
  },
  {
    "id": "sindhura_departure",
    "text": [
      "Rajendra os escolta até a fronteira pessoalmente.",
      "\"Seu pai era temido em Sindhura, Arslan. Você é algo diferente.\" Um sorriso. \"Provavelmente melhor.\"",
      "Elam olha para trás ao cruzar a fronteira. \"Posso voltar aqui um dia?\"",
      "Narsus: \"Se Pars sobreviver amanhã, você pode ir a qualquer lugar.\""
    ],
    "next_scene": "act3_post_sindhura"
  }
]
```

---

## PARTE 11 — ATO 5: OS PRIMEIROS DIAS

> O jogo atual termina na coroação. Um Ato 5 curto de 6 cenas mostra os primeiros dias do reinado — onde o peso de tudo cai de uma vez. Zero combate. 100% consequência.

```json
// src/data/narrative/act5_aftermath.json

[
  {
    "id": "act5_morning_after",
    "title": "A Manhã Depois",
    "text": [
      "Ecbatana está quieta. O tipo de silêncio depois de muito barulho.",
      "Você está no salão do trono às quatro da manhã. Sozinho, pela primeira vez em semanas.",
      "O trono parece menor do que você lembrava da infância. Ou você ficou maior.",
      "Narsus entra sem bater. Coloca um pergaminho na mesa.",
      "\"Lista de pendências. Reconstrução, tributação, os nobres que precisam de resposta, a questão dos prisioneiros lusitanos —\"",
      "\"Narsus.\"",
      "\"Hm?\"",
      "\"Amanhã.\"",
      "Uma pausa. Rara nele.",
      "\"Certo.\" Ele recolhe o pergaminho. \"Mas eu fico aqui.\""
    ],
    "choices": [
      { "id": "silence", "text": "Ficar em silêncio com Narsus.", "xp": 20, "character_score": +2 },
      { "id": "ask", "text": "\"Narsus. Você acha que vai dar certo?\"", "next_node": "act5_narsus_answer" }
    ]
  },
  {
    "id": "act5_narsus_answer",
    "text": [
      "\"Define 'dar certo'.\"",
      "\"Pars. O reino. Tudo isso.\"",
      "Silêncio. Ele olha para a janela.",
      "\"Não sei. Provavelmente não da forma que você imagina agora.\" Uma pausa. \"Mas vai dar de alguma forma. Isso é diferente.\"",
      "\"Você acredita nisso?\"",
      "\"Acredito que você acredita.\" Ele te olha. \"Por enquanto, isso é suficiente para mim.\""
    ],
    "character_score": +3,
    "next_scene": "act5_first_decisions"
  },
  {
    "id": "act5_first_decisions",
    "title": "Três Mensageiros",
    "text": [
      "Três mensageiros chegam ao mesmo tempo na manhã seguinte.",
      "Lord Hodir quer confirmação dos privilégios prometidos.",
      "O representante dos libertos quer saber quando a proclamação se estende a todo Pars.",
      "Um grupo de sacerdotes de Yaldabaoth capturados pede audiência.",
      "Narsus observa de longe. \"Bem-vindo ao governo, Arslan.\""
    ],
    "choices": [
      { "id": "hodir_first", "text": "Receber Hodir primeiro.", "character_score": -3, "faction_effects": { "nobreza_pars": 10, "escravos_libertos": -5 } },
      { "id": "libertos_first", "text": "Receber os representantes dos libertos.", "character_score": +5, "faction_effects": { "escravos_libertos": 10, "nobreza_pars": -5 } },
      { "id": "yaldabaoth_first", "text": "Receber os sacerdotes de Yaldabaoth.", "character_score": +3, "faction_effects": { "lusitanos_moderados": 15 }, "note": "Gesto de que Pars não vai perseguir religião. Etoile ouve sobre isso." },
      { "id": "all_together", "text": "[Diplomata] Chamar todos ao mesmo tempo.", "condition": "class == diplomat", "character_score": +8, "note": "Caótico. Demonstra que Arslan não tem favoritos." }
    ]
  },
  {
    "id": "act5_daryun_farewell",
    "title": "O Cavaleiro e Seu Propósito",
    "text": [
      "Daryun pede audiência privada.",
      "\"Eu jurei proteger você até o trono.\" Formal. \"Você está no trono.\"",
      "Você entende onde vai antes de ele terminar.",
      "\"Não preciso que você vá, Daryun.\"",
      "\"Não é sobre precisar.\" Ele olha para você. \"Há uma fronteira ao norte instável. Há pessoas sem voz aqui.\"",
      "\"O que você está dizendo é que eu não preciso mais de proteção.\"",
      "Uma pausa longa. \"Estou dizendo que você me ensinou que proteção tem formas diferentes.\""
    ],
    "choices": [
      {
        "id": "let_him_go",
        "text": "\"Vá. E volte quando a fronteira estiver segura.\"",
        "character_score": +5,
        "world_flag": "daryun_on_mission",
        "note": "Daryun aparece em cena nos créditos finais."
      },
      {
        "id": "ask_stay",
        "text": "\"Ainda preciso de você aqui. Mais um tempo.\"",
        "character_score": +2,
        "note": "Daryun fica. Mas você lhe deu a escolha. Isso importa para ele."
      }
    ]
  },
  {
    "id": "act5_final_moment",
    "title": "O Jardim do Palácio",
    "text": [
      "Tarde da noite. Você encontra Elam no jardim, sentado na beira da fonte.",
      "Ele está desenhando. Mal — irmão espiritual das pinturas de Narsus.",
      "\"O que é isso?\"",
      "\"O acampamento.\" Ele mostra sem vergonha. \"Quero lembrar como era.\"",
      "Você olha o desenho por um momento.",
      "\"Era melhor do que parecia na época.\"",
      "\"Era.\" Elam dobra o papel. \"Mas daqui também vai ficar bom na memória. Você vai ver.\""
    ],
    "final_narration": [
      "Você fica no jardim depois que Elam vai dormir.",
      "Ecbatana respira ao redor de você — mercadores fechando lojas, famílias jantando, um sino de Mithra soando lá longe.",
      "Não é o fim. É o começo do que vem depois do fim.",
      "Que tipo de começo — isso você já decidiu."
    ],
    "game_end_flag": true,
    "ui_note": "Sem tela de FIM. A narrativa termina na última linha. Botão discreto 'Voltar ao Menu' no canto inferior. Deixar o momento respirar."
  }
]
```

---

## PARTE 12 — TRÊS EPÍLOGOS DISTINTOS

```json
// src/data/narrative/epilogues.json

[
  {
    "id": "epilogue_just",
    "trigger": "hermes_executed AND character_score >= -20 AND character_score < 30",
    "title": "O Rei Justo",
    "text": [
      "Ecbatana é retomada. A coroação acontece três semanas depois.",
      "Arslan governa com firmeza. A lei é igual para todos — novidade assustadora para quem nunca precisou temê-la.",
      "Hermes foi executado. Alguns nobres apoiaram. Os que não apoiaram ficaram quietos.",
      "A escravatura é questão em aberto. Há promessas. Há comissões. Há 'gradualmente'.",
      "Uma noite, você encontra Narsus olhando pela janela.",
      "\"O que pensa?\" você pergunta.",
      "\"Que reis justos são raros.\" Ele responde sem virar. \"E que raridade não é o mesmo que suficiente.\"",
      "Pars sobreviveu. Pars mudou. Quanto? O tempo vai dizer."
    ]
  },
  {
    "id": "epilogue_merciful",
    "trigger": "hermes_spared AND character_score >= 20 AND NOT slavery_abolished",
    "title": "O Rei Misericordioso",
    "text": [
      "Hermes foi confinado num mosteiro a três dias de Ecbatana. Ninguém sabe quem ele é. Narsus garante que assim continue.",
      "A coroação é simples — a pedido de Arslan.",
      "Etoile aparece na cerimônia. Não de armadura. Ela mesma não sabe bem por que apareceu.",
      "A escravatura continua — por enquanto.",
      "Daria saiu mais cedo da cerimônia do que os outros.",
      "No ano seguinte, há uma revolta de escravos em duas províncias. Pequena. Sufocada.",
      "Arslan lê o relatório. Dobra o papel. Fica em silêncio por um longo tempo.",
      "'Gradualmente' está vencendo.",
      "Apenas."
    ]
  },
  {
    "id": "epilogue_wise",
    "trigger": "hermes_redemption_path AND slavery_abolished AND character_score >= 50",
    "title": "O Rei que Pars Não Merecia Ainda",
    "text": [
      "Ecbatana é retomada. A coroação é adiada por seis meses — tempo para reconstruir antes de comemorar.",
      "A proclamação de abolição é lida na praça central. Aplausos de um lado. Silêncio tenso do outro.",
      "Dois nobres partem para exílio voluntário. Três ficam e reclamam em todo jantar que frequentam.",
      "Hermes trabalha no ministério de reconstrução. Ninguém sabe seu nome verdadeiro. Ele prefere assim.",
      "Um dia, um funcionário novo — ex-escravo — pede conselho a Hermes sobre burocracia hostil.",
      "Hermes responde com mais paciência do que qualquer um esperaria.",
      "Você ouve sobre isso semanas depois, por Narsus.",
      "\"Como está ele?\"",
      "\"Não está em paz.\" Narsus pensa. \"Mas está trabalhando.\" Uma pausa. \"Para alguém como ele, isso é quase a mesma coisa.\"",
      "Pars muda devagar. Mais devagar do que Arslan gostaria. Mais rápido do que qualquer rei anterior permitiu.",
      "Na biblioteca restaurada de Ecbatana — que os lusitanos tentaram queimar, mas Ishtar escondeu os manuscritos — há uma sala nova.",
      "Sem nome na porta.",
      "Narsus pintou o quadro na parede.",
      "É terrível.",
      "Todo mundo que entra sorri."
    ]
  }
]
```

---

## ADENDO FINAL — INSTRUÇÕES PARA CLAUDE CODE (v3)

11. **Ato 5** é separado. Criar `act5_aftermath.json` em `src/data/narrative/`. A narrativeEngine já consegue processar — só adicionar as cenas.

12. **Rota de Sindhura** se encaixa em `act3_alliance.json` após a cena `war_council`. A flag `pursuing_sindhura` controla se o jogador passou por ela.

13. **Confronto com Kharlan** substitui a transição direta para o boss. A cena `kharlan_confrontation` dispara primeiro, e o combate acontece ao final dela — com `combat_mood` passado como parâmetro para o combatEngine.

14. **Tahamine** — localização `salao_privado_palacio` precisa existir no MapScreen como área desbloqueável no Ato 4, durante o cerco. Não aparece automaticamente: jogador precisa ir até lá.

15. **character_score não tem UI.** Zero. Nenhum número, nenhuma barra. Checar `character_reactions.json` após toda decisão com `character_score != 0` e aplicar os efeitos correspondentes.

16. **mid_combat_events** — Implementar no CombatScreen: após cada turno, checar `combat.mid_combat_events`. Se `trigger` satisfeito e `triggered !== true`: pausar, mostrar texto com formatação especial (itálico, borda dourada), processar choices, marcar `triggered = true`, retomar.

17. **Epílogos** — Determinar qual ativar ao fim do boss_silvermask_phase2 baseado em `world_flags` + `character_score`. Se nenhuma condição específica, usar `epilogue_just` como fallback.

18. **A última linha de Elam encerra o jogo.** Sem tela de FIM. A narrativa termina. Botão discreto `Voltar ao Menu` no canto inferior. O momento precisa respirar.

19. **Narsus no silêncio** — Se `arslan_kept_slavery`, Narsus não faz discurso no final war council. O log mostra apenas: *"Narsus está a distância, olhando os mapas."* Implementar via condicional no ensemble scene.

20. **Elefantes de guerra** — Se `sindhura_full_alliance`: no combate `battle_ecbatana_walls`, adicionar modificador `elephant_support: true`. Efeito: inimigos em posição de muralha têm CA reduzida em 3 e o boss de fase inicial tem HP reduzido em 15.

---
*Documento atualizado em: Fevereiro 2026*
*Versão: 3.0.0 — Arslan RPG Next*
*v3 adicionou: Sistema de Caráter invisível com reações do mundo, 4 árvores de diálogo dramáticas completas (Kharlan, Tahamine, Etoile, Narsus × escravatura), 2 boss fights remodelados com mid-combat drama e decisões morais, 3 epílogos distintos com lore profundo, Rota de Sindhura completa com combate e diplomacia, Ato 5 aftermath com 5 cenas de consequência, Conselho de Guerra Final com falas condicionais de cada general*
---

## PARTE 13 — COMBATES COM MECÂNICAS SITUACIONAIS

> A regra fundamental: **o tipo de combate emerge da cena anterior, não é atribuído arbitrariamente.** Cada mecânica especial precisa ter sido estabelecida narrativamente antes do combate começar.
> 
> Esta parte tem duas seções: **correções nos combates existentes** (onde o setup já existe mas a mecânica não reflete) e **novas cenas + combates** que precisam ser inseridos nos atos.

---

### 13.1 — COMBATES EXISTENTES QUE JÁ TÊM O SETUP — SÓ FALTA A MECÂNICA

#### Combate 1 — Patrulha na Floresta (Ato 1)

**Setup já existe:** A cena `escape_path` oferece escolha explícita: "Vamos emboscá-los" vs "Esconder" vs "Enfrentar de frente."

**Problema:** A escolha existe mas não muda nada no combate. O combate é idêntico independente da escolha.

**Correção:** Adicionar `combat_flags` baseados na escolha feita:

```json
// Se chose_ambush == true → adicionar ao combate:
"combat_modifiers": {
  "ambush_first_turn": true
}
// Efeito mecânico: inimigos não agem no turno 1, lado do jogador tem vantagem em todos os ataques do turno 1.
// Implementar em combatEngine: se combat.combat_modifiers.ambush_first_turn, pular turno de todos os inimigos na rodada 1.

// Se stood_ground == true → nenhum bônus, mas:
"mid_combat_event": {
  "trigger": "turn_1",
  "text": "Os lusitanos se surpreendem com sua postura. Daryun aproveita a hesitação deles."
}
// Purely narrative. Acknowledges the choice without breaking balance.
```

---

#### Combate 2 — Emboscada Lusitana (Ato 2)

**Setup já existe:** Narsus diz explicitamente "Elam, esquerda. Daryun, centro. Arslan, siga minha liderança." É um plano tático.

**Problema:** O combate ignora completamente o plano. São 3 inimigos padrão, AI aggressive_simple, nenhum reflexo do plano de Narsus.

**Correção:** Adicionar `wave_system` — os inimigos vieram de emboscada, mas o plano de Narsus funciona em ondas:

```json
// Substituir o combate road_ambush por:
{
  "id": "road_ambush",
  "name": "Emboscada Lusitana",
  "wave_system": true,
  "waves": [
    {
      "wave": 1,
      "label": "Ataque inicial",
      "enemies": [
        { "name": "Soldado Lusitano", "hp": 16, "ca": 14, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "aggressive_simple" },
        { "name": "Arqueiro Lusitano", "hp": 12, "ca": 12, "pa": 2, "weapon": { "damage": "1d6+2" }, "ai": "skirmisher" }
      ]
    },
    {
      "wave": 2,
      "trigger": "wave_1_cleared",
      "label": "Reforço pelo flanco",
      "intro_text": "Mais soldados emergem das árvores pelo lado direito. Elam já estava esperando.",
      "enemies": [
        { "name": "Sargento Lusitano", "hp": 24, "ca": 15, "pa": 3, "weapon": { "damage": "1d10+3" }, "ai": "aggressive_simple" },
        { "name": "Soldado Lusitano", "hp": 16, "ca": 14, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "aggressive_simple" }
      ],
      "elam_bonus": "Elam já posicionado: +2 em ataques desta onda"
    }
  ],
  "xp_reward": 150,
  "note": "Waves refletem o que a cena descreve — uma emboscada vinda de múltiplas direções com um plano pré-estabelecido."
}
```

---

#### Combate 3 — Treino com Daryun (Ato 2)

**Setup já existe:** Daryun diz "Considere isto um combate real. Não vou segurar." A cena é claramente um spar de treino.

**Problema:** O combate tem win condition de "reduzir a 0 HP" — o que narrativamente não faz sentido. Não se mata Daryun num treino.

**Correção:** Alterar `win_condition` para refletir o que o spar é:

```json
{
  "id": "training_spar",
  "name": "Treino com Daryun",
  "win_condition": "land_3_hits",
  "win_condition_text": "Acerte Daryun 3 vezes antes que ele te acerte 5.",
  "lose_condition": "take_5_hits",
  "lose_condition_text": "Daryun para o treino. \"De novo.\"",
  "lose_outcome": "non_lethal",
  "lose_scene": "training_failed",
  "lose_scene_text": "Daryun abaixa a lança. \"Você está vivo. Isso já é algo. Vamos de novo.\"",
  "lose_xp": 40,
  "win_xp": 80,
  "enemies": [
    {
      "name": "Daryun (Treino)",
      "hp": 999,
      "ca": 16,
      "pa": 3,
      "weapon": { "name": "Lança (Cabo)", "damage": "1d4" },
      "ai": "defensive",
      "note": "HP alto porque Daryun não vai a 0. A condição de vitória é hits recebidos, não HP zerado."
    }
  ],
  "note": "training_failed não encerra o jogo. Arslan ganha xp menor e vai para post_training igual. Narrativamente: todo resultado do treino leva à próxima cena."
}
```

---

#### Combate 4 — Batedores na Estrada (Ato 3)

**Setup já existe:** A cena diz "Eliminar os batedores antes que alertem o exército!" — o objetivo é implicitamente temporal.

**Problema:** O combate não tem esse senso de urgência. Se o jogador demorar 10 turnos, nada acontece.

**Correção:** Adicionar `escape_timer` no batedor mais rápido:

```json
{
  "id": "kashan_road_scouts",
  "name": "Batedores na Estrada",
  "enemies": [
    {
      "name": "Batedor Lusitano",
      "hp": 14, "ca": 13, "pa": 2,
      "weapon": { "damage": "1d6+2" },
      "ai": "skirmisher"
    },
    {
      "name": "Batedor Lusitano",
      "hp": 14, "ca": 13, "pa": 2,
      "weapon": { "damage": "1d6+2" },
      "ai": "skirmisher"
    },
    {
      "name": "Cavaleiro Batedor",
      "hp": 20, "ca": 15, "pa": 2,
      "weapon": { "damage": "1d10+2" },
      "ai": "escape_if_allies_fall",
      "escape_trigger": "both_scouts_dead",
      "escape_turn_delay": 2,
      "note": "Se os dois batedores morrem, o cavaleiro tenta fugir 2 turnos depois. Se escapar, reforços chegam."
    }
  ],
  "escape_consequence": {
    "trigger": "cavaleiro_escaped",
    "scene_text": "O cavaleiro sumiu entre as árvores. Narsus franze o cenho. \"Ele vai alertar o exército. Precisamos nos mover mais rápido.\"",
    "penalty": "Batalha de Kashan recebe +2 inimigos adicionais. Sem bônus de surpresa."
  },
  "no_escape_reward": {
    "trigger": "all_enemies_eliminated",
    "scene_text": "Nenhum escapou. Narsus examina os documentos encontrados. \"Perfeito. Kashan ainda não sabe que estamos chegando.\"",
    "bonus": "Batalha de Kashan: todos os aliados têm vantagem no turno 1."
  }
}
```

---

#### Combate 5 — Cerco de Kashan (Ato 3)

**Setup já existe:** Se o jogador foi de `kashan_scout` → flag `surprise_attack: true`. Narsus planejou o ataque ao amanhecer.

**Problema:** `surprise_attack: true` está setado mas não afeta o combate de forma alguma.

**Correção:** A flag já existe — só precisar ser lida pelo combatEngine:

```json
// Se surprise_attack == true:
"combat_modifiers": {
  "ambush_first_turn": true,
  "note": "Planejado por Narsus: ataque ao amanhecer com posicionamento de Elam. Inimigos não agem no turno 1."
}

// Se approach_directly (veio direto, sem scout):
// Sem modificador. Capitão tem +2 CA por estar alertado.
// mid_combat_event turn_1: "Os lusitanos viram vocês chegando. Estão em formação."
```

---

### 13.2 — NOVAS CENAS COM COMBATES SITUACIONAIS

> Cada cena aqui é completamente nova. Encaixam nos atos existentes nos pontos indicados. O tipo de combate é consequência direta do que a cena estabelece.

---

#### Nova Cena A — A Travessia do Rio (inserir no Ato 1, após morning_rest)

**Por que funciona:** É o caminho para Dahman. A cena apresenta o terreno antes do combate — o rio com a ponte estreita — então a limitação de "passagem estreita" faz sentido completo.

```json
{
  "id": "river_crossing",
  "title": "A Ponte Velha",
  "type": "narrative",
  "text": [
    "O caminho para Dahman cruza o Rio Akhur por uma ponte de pedra — velha, estreita, não mais que dois homens de largura.",
    "Daryun para. \"Há soldados do outro lado. Cinco, talvez seis. Estão guardando a travessia.\"",
    "\"Se tentarmos forçar a passagem, eles lutarão com vantagem — nós chegamos um de cada vez.\" Daryun olha para você. \"Mas não há outro caminho por milhas.\""
  ],
  "choices": [
    {
      "id": "force_bridge",
      "text": "Daryun vai na frente. Nós o cobrimos.",
      "next_scene": "bridge_combat",
      "note": "Combate com passagem estreita."
    },
    {
      "id": "find_ford",
      "text": "[DES 13] Procurar um vau rio acima para atravessar sem ser visto.",
      "condition": "DES >= 13",
      "next_scene": "river_ford",
      "set_flags": { "avoided_bridge_fight": true }
    },
    {
      "id": "wait_nightfall",
      "text": "Esperar até a noite para atravessar com menos guardas.",
      "next_scene": "bridge_night_combat",
      "note": "Combate noturno: menos inimigos, mas todos têm penalidade de visão."
    }
  ]
},
{
  "id": "bridge_combat",
  "title": "A Ponte",
  "type": "narrative",
  "text": [
    "Daryun avança pela ponte. Os guardas gritam. O combate começa num espaço impossível."
  ],
  "choices": [
    {
      "id": "fight_bridge",
      "text": "Avançar!",
      "next_scene": "post_river_crossing",
      "start_combat": {
        "id": "bridge_fight",
        "name": "Guardas da Ponte",
        "combat_modifiers": {
          "narrow_passage": true,
          "narrow_passage_note": "Passagem estreita: apenas 1 aliado pode atacar por turno. Todos os outros ficam atrás, esperando. Inimigos têm a mesma limitação."
        },
        "enemies": [
          { "name": "Guarda Lusitano", "hp": 16, "ca": 14, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "defensive" },
          { "name": "Guarda Lusitano", "hp": 16, "ca": 14, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "defensive" },
          { "name": "Guarda Lusitano", "hp": 16, "ca": 14, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "defensive" },
          { "name": "Sargento da Ponte", "hp": 28, "ca": 16, "pa": 3, "weapon": { "damage": "1d10+3" }, "ai": "defensive", "passive": "Posição Defensiva: +2 CA enquanto na passagem estreita" }
        ],
        "xp_reward": 100,
        "note": "Daryun sempre vai na frente neste combate — é automaticamente o aliado ativo do turno 1."
      }
    }
  ]
},
{
  "id": "bridge_night_combat",
  "title": "A Ponte à Meia-Noite",
  "type": "narrative",
  "text": [
    "Na troca de turno, apenas dois guardas permanecem na ponte. Os outros foram dormir.",
    "Daryun sussurra: \"É agora. Devagar.\""
  ],
  "choices": [
    {
      "id": "fight_bridge_night",
      "text": "Avançar em silêncio.",
      "next_scene": "post_river_crossing",
      "start_combat": {
        "id": "bridge_night",
        "name": "Guardas da Ponte (Noite)",
        "combat_modifiers": {
          "narrow_passage": true,
          "night_combat": true,
          "night_combat_note": "Noite: DES -1 para todos os lados. Arcos têm -2 em ataques. Inimigos iniciam surpresos (-1 PA no turno 1)."
        },
        "enemies": [
          { "name": "Guarda Sonolento", "hp": 16, "ca": 12, "pa": 2, "weapon": { "damage": "1d8+1" }, "ai": "defensive" },
          { "name": "Guarda Sonolento", "hp": 16, "ca": 12, "pa": 2, "weapon": { "damage": "1d8+1" }, "ai": "defensive" }
        ],
        "xp_reward": 70,
        "note": "Menos inimigos, mas a penalidade noturna afeta Elam (arqueiro). Escolha com tradeoffs reais."
      }
    }
  ]
},
{
  "id": "post_river_crossing",
  "type": "narrative",
  "text": [
    "A ponte está livre. O caminho para Dahman está aberto."
  ],
  "choices": [
    { "id": "continue", "text": "Continuar para Dahman.", "next_scene": "act2_arrival_dahman", "xp_reward": 20 }
  ]
}
```

---

#### Nova Cena B — O Mensageiro (inserir no Ato 2, após camp_established)

**Por que funciona:** Após o acampamento ser estabelecido, Narsus precisa de informações sobre os movimentos lusitanos. Manda Elam reconhecer. Elam volta com um mensageiro lusitano preso — mas o mensageiro precisa chegar vivo para interrogatório. Esse objetivo é estabelecido **antes** do combate.

```json
{
  "id": "messenger_capture",
  "title": "O Mensageiro",
  "type": "narrative",
  "text": [
    "Elam retorna ao acampamento arrastando um homem pela gola.",
    "\"Encontrei ele na estrada. Carregava documentos lusitanos.\" Elam joga o mensageiro no chão. O homem está assustado, não armado.",
    "Narsus examina os documentos. \"Ele foi só o portador. Mas se souber de onde veio e para onde ia, conseguimos mapear a cadeia de comando.\"",
    "\"Problema,\" Daryun aponta. \"Ele não veio sozinho.\""
  ],
  "choices": [
    {
      "id": "protect_messenger",
      "text": "Precisamos dele vivo. Defender o prisioneiro!",
      "next_scene": "post_messenger_fight",
      "start_combat": {
        "id": "messenger_defense",
        "name": "Resgate do Mensageiro",
        "win_condition": "eliminate_all",
        "protect_target": {
          "name": "Mensageiro Lusitano",
          "hp": 8,
          "note": "NPC não combate. Se chegar a 0 HP, combat_result = 'partial_failure'. O mensageiro morre, mas o combate ainda pode ser ganho."
        },
        "protect_target_death_scene": "messenger_dead",
        "protect_target_death_text": "O mensageiro caiu. Narsus examina os documentos que sobraram. \"Conseguimos parte da informação. Não tudo.\" Penalidade: mapa de posições lusitanas incompleto.",
        "enemies": [
          { "name": "Escolta Lusitana", "hp": 18, "ca": 14, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "aggressive_simple" },
          { "name": "Escolta Lusitana", "hp": 18, "ca": 14, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "aggressive_simple" },
          { "name": "Escolta Lusitana", "hp": 18, "ca": 14, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "aggressive_simple" }
        ],
        "xp_reward": 130,
        "full_success_bonus": "Mapa de posições lusitanas completo. Revela localização de patrulha em Kashan. +20 XP bonus."
      }
    }
  ]
},
{
  "id": "post_messenger_fight",
  "type": "narrative",
  "text": [
    "A escolta foi eliminada. Narsus interroga o mensageiro com a frieza de quem faz isso há anos.",
    "O mensageiro fala. As informações são valiosas — posições, rotas, e algo mais: um nome. Um contato em Kashan que vende informações para os lusitanos.",
    "\"Interessante,\" Narsus fecha o caderno. \"Há um espião na corte de Hodir.\""
  ],
  "choices": [
    {
      "id": "note_spy",
      "text": "Vamos usar isso quando chegar em Kashan.",
      "next_scene": "narsus_plan",
      "set_flags": { "knows_about_kashan_spy": true },
      "xp_reward": 30
    }
  ]
}
```

---

#### Nova Cena C — A Fuga de Kashan (inserir no Ato 3, alternativa a kashan_battle)

**Por que funciona:** Se o jogador falhou na negociação com Hodir (ou Hodir foi traído pelo espião), o grupo precisa sair de Kashan antes de ser preso. O objetivo não é lutar — é alcançar os cavalos. Estabelecido pela cena antes do combate.

```json
{
  "id": "kashan_betrayal",
  "title": "A Traição em Kashan",
  "trigger_condition": "hodir_negotiation_failed OR kashan_spy_revealed_arslan",
  "type": "narrative",
  "text": [
    "Os portões de Kashan se fecham atrás de vocês.",
    "\"Guardas!\" A voz de Hodir ressoa no pátio. \"O príncipe e seus homens não deixarão a fortaleza.\"",
    "Narsus já está se movendo. \"Os cavalos estão nos estábulos, noroeste. Três minutos de corrida.\"",
    "Daryun desembainha. \"Eu abro caminho. Vocês correm.\""
  ],
  "choices": [
    {
      "id": "run_for_horses",
      "text": "Correr. Agora.",
      "next_scene": "post_kashan_escape",
      "start_combat": {
        "id": "kashan_escape",
        "name": "Fuga de Kashan",
        "win_condition": "survive_turns",
        "survive_turns": 4,
        "win_condition_text": "Aguente 4 turnos enquanto Narsus e Elam alcançam os cavalos.",
        "win_scene_text": "\"Cavalos prontos!\" A voz de Elam vem de longe. Daryun derruba o último guarda à sua frente. \"AGORA!\"",
        "progress_display": "Narsus e Elam: chegando aos cavalos... (Turno X/4)",
        "enemies": [
          { "name": "Guarda de Kashan", "hp": 20, "ca": 15, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "aggressive_simple" },
          { "name": "Guarda de Kashan", "hp": 20, "ca": 15, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "aggressive_simple" },
          { "name": "Guarda de Kashan", "hp": 20, "ca": 15, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "aggressive_simple" }
        ],
        "wave_on_turn": {
          "turn": 3,
          "text": "Mais guardas chegam pelo corredor leste.",
          "enemies": [
            { "name": "Guarda de Kashan", "hp": 20, "ca": 15, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "aggressive_simple" },
            { "name": "Guarda de Kashan", "hp": 20, "ca": 15, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "aggressive_simple" }
          ]
        },
        "xp_reward": 180,
        "note": "O jogador não precisa matar todos. Só sobreviver. Inimigos continuam chegando — matar é a forma mais eficiente de ganhar tempo, mas não obrigatório."
      }
    }
  ]
},
{
  "id": "post_kashan_escape",
  "type": "narrative",
  "text": [
    "Os quatro cavalos atravessam os portões antes que possam ser fechados.",
    "Quando vocês param para respirar a uma milha de Kashan, Narsus já está ajustando o mapa.",
    "\"Isso foi inconveniente.\" Ele vira o mapa. \"Mas aprendemos o suficiente. E ainda temos outras opções de aliados.\""
  ],
  "choices": [
    { "id": "regroup", "text": "O que agora, Narsus?", "next_scene": "act3_post_council", "xp_reward": 40 }
  ]
}
```

---

#### Nova Cena D — O Duelo Singular (quest sq_turan_duel — já documentada)

**Por que funciona:** Bahram de Turan desafia Arslan para um duelo honorário. A cena estabelece explicitamente as regras: "apenas Arslan. Ninguém mais intervém." Se Daryun intervir, a aliança com Turan acaba.

```json
{
  "id": "turan_duel_scene",
  "title": "O Duelo Singular",
  "type": "narrative",
  "text": [
    "Bahram planta sua lança no chão — gesto universal de duelo.",
    "\"Eu não luto com exércitos. Luto com homens.\" Ele te olha. \"Você, príncipe. Só você. Se vencer, terá nossa aliança. Se perder, vá embora.\"",
    "Daryun dá um passo à frente. Bahram nem vira a cabeça. \"Se aquele homem der mais um passo, a conversa acabou e levamos suas cabeças.\"",
    "Daryun para. Olha para você. A decisão é sua."
  ],
  "choices": [
    {
      "id": "accept_duel",
      "text": "Aceito. Recuem, todos.",
      "next_scene": "post_turan_duel",
      "start_combat": {
        "id": "turan_duel",
        "name": "Duelo Singular com Bahram",
        "win_condition": "eliminate_all",
        "party_locked": true,
        "party_locked_note": "Apenas Arslan participa. Daryun, Narsus, Elam, Gieve e Falangies ficam de fora. Se qualquer aliado agir (por habilidade automática ou passiva), o combate termina como derrota honrada.",
        "enemies": [
          {
            "name": "Bahram de Turan",
            "hp": 42, "ca": 15, "pa": 3,
            "attributes": { "FOR": 17, "DES": 16, "CON": 15, "INT": 12, "SAB": 13, "CAR": 14 },
            "weapon": { "name": "Sabre das Estepes", "damage": "1d10+3", "bonus_atk": 2 },
            "passive": "Cavaleiro das Estepes: a cada turno que Arslan não tiver atacado no turno anterior, Bahram tem vantagem no próximo ataque.",
            "ai": "tactical_boss",
            "mid_combat_events": [
              { "trigger": "boss_hp_reaches_60", "text": "Bahram para por um segundo. Não recua — avalia. \"Você luta diferente dos outros principes que conheci.\"" },
              { "trigger": "arslan_hp_below_40pct", "text": "Bahram poderia findar isso agora. Mas não ataca durante um turno. \"Levante-se, príncipe. Não termina assim.\"" }
            ]
          }
        ],
        "xp_reward": 300,
        "loss_scene": "turan_duel_loss",
        "loss_text": "Bahram abaixa a lança antes do golpe final. \"Você lutou bem para um homem das pedras.\" Ele faz sinal para seus homens. \"Vão embora. Ainda com vida.\"",
        "loss_outcome": "Grupo vai embora. Aliança com Turan não disponível neste playthrough.",
        "win_scene": "turan_duel_win",
        "win_text": "Bahram no chão, apontando a ponta da espada para o próprio peito. \"Finalize.\"",
        "win_choices": [
          {
            "id": "spare_bahram",
            "text": "Abaixar a espada.",
            "character_score": +8,
            "outcome_text": "Bahram olha para você por um longo tempo. Depois ri — genuíno, pela primeira vez. \"Você não é o que eu esperava.\" Ele se levanta. \"Turan lutará ao seu lado.\"",
            "faction_effects": { "turan": 40 },
            "recruit_optional": "bahram_ally"
          },
          {
            "id": "execute_bahram",
            "text": "Finalizar.",
            "character_score": -12,
            "outcome_text": "O acampamento de Turan fica em silêncio absoluto. Depois um dos guerreiros cospe no chão. \"Leve seus homens e vá, príncipe. Turan não tem negócios com assassinos de duelos.\"",
            "faction_effects": { "turan": -30 },
            "note": "Executar num duelo honrado é a pior coisa que Arslan pode fazer na cultura de Turan. A aliança está permanentemente fechada."
          }
        ]
      }
    },
    {
      "id": "decline_duel",
      "text": "\"Meus homens combatem juntos. Não aceito duelos isolados.\"",
      "npc_response": "Bahram te olha por um momento. \"Uma resposta honesta. Respeito isso.\" Ele pega a lança. \"Mas nossa conversa acabou.\"",
      "outcome": "Aliança com Turan não disponível nesta jogada. Bahram não é inimigo — simplesmente sai."
    }
  ]
}
```

---

#### Nova Cena E — A Caravana de Escravos (quest sq_free_slaves_caravan — já documentada)

**Por que funciona:** A cena estabelece que os escravos estão acorrentados no meio do combate. Qualquer ataque em área pode atingi-los. O limite tático é uma consequência direta da situação, não uma tag arbitrária.

```json
{
  "id": "slave_caravan_scene",
  "title": "A Caravana",
  "type": "narrative",
  "text": [
    "A caravana para na estrada diante de vocês. Dezesseis escravos acorrentados uns aos outros, guardados por oito soldados.",
    "\"Alguém bloqueou a estrada,\" o líder dos guardas olha para vocês. \"Saiam do caminho.\"",
    "Narsus fala baixo: \"Os escravos estão no meio. Qualquer ataque descuidado...\"",
    "Ele não precisa terminar a frase."
  ],
  "choices": [
    {
      "id": "attack_careful",
      "text": "Atacar com cuidado. Ninguém acorrentado se machuca.",
      "next_scene": "post_caravan_fight",
      "start_combat": {
        "id": "slave_caravan",
        "name": "Libertação da Caravana",
        "civilians_present": true,
        "civilians": {
          "count": 16,
          "name": "Escravos Acorrentados",
          "note": "Não combatem. Estão no campo de batalha. Qualquer habilidade com 'target: all_enemies' ou AoE precisa passar por uma checagem de DES DC 12 ou atinge 1 civil aleatório."
        },
        "civilian_casualty_consequence": "Se qualquer civil morrer: character_score -8 e Daria nunca confia em Arslan completamente.",
        "enemies": [
          { "name": "Guarda da Caravana", "hp": 18, "ca": 14, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "defensive" },
          { "name": "Guarda da Caravana", "hp": 18, "ca": 14, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "defensive" },
          { "name": "Guarda da Caravana", "hp": 18, "ca": 14, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "defensive" },
          { "name": "Guarda da Caravana", "hp": 18, "ca": 14, "pa": 2, "weapon": { "damage": "1d8+2" }, "ai": "defensive" },
          { "name": "Líder da Caravana", "hp": 32, "ca": 16, "pa": 3, "weapon": { "damage": "1d10+3" }, "ai": "cowardly", "passive": "Covarde: se HP < 30%, tenta fugir. Se escapar, o grupo não recebe a recompensa de ouro." }
        ],
        "xp_reward": 220
      }
    },
    {
      "id": "negotiate_caravan",
      "text": "[Diplomata CAR 15] Convencer os guardas de que não vale a pena.",
      "condition": "class == diplomat AND CAR >= 15",
      "roll": { "attribute": "CAR", "dc": 15 },
      "success_scene": "caravan_no_fight",
      "success_text": "Os guardas trocam olhares. O líder avalia a força do grupo diante dele. \"Não pagamos suficiente para isso.\" Eles largam as correntes e vão embora.",
      "success_reward": { "xp": 180, "character_score": +5 },
      "failure_scene": "caravan_failed_negotiation",
      "failure_text": "\"Você acha que somos idiotas?\" O líder desembainha. \"Matem-nos.\"",
      "failure_leads_to": "attack_careful"
    }
  ]
}
```

---

### 13.3 — TABELA DE MODIFICADORES DE COMBATE (para implementação)

> Implementar em `combatEngine.js`. Cada modificador é lido do campo `combat.combat_modifiers` ou `combat.win_condition`.

```javascript
// src/engine/combatEngine.js — adicionar suporte a:

const COMBAT_MODIFIERS = {
  // MODIFICADORES DE CAMPO
  ambush_first_turn: {
    effect: "enemies skip their entire first round",
    note: "Apenas quando o jogador emboscou. Nunca quando o jogador foi emboscado."
  },
  narrow_passage: {
    effect: "only 1 ally can attack per turn. Queue system: next ally attacks when current finishes.",
    note: "Implementar fila de combatentes. O jogador escolhe a ordem."
  },
  night_combat: {
    effect: "all: DES -1. Ranged attacks: additional -2. Enemies start with -1 PA on turn 1 if surprised."
  },

  // CONDIÇÕES DE VITÓRIA ALTERNATIVAS
  survive_turns: {
    effect: "Combat ends as WIN after N turns regardless of enemies alive.",
    requires: "combat.survive_turns: N",
    display: "Mostrar contador de turnos na UI: 'Turno X / N'"
  },
  land_N_hits: {
    effect: "Combat ends as WIN when player lands N successful hits.",
    requires: "combat.win_condition_hits: N",
    display: "Mostrar contador: 'Acertos: X / N'"
  },
  protect_target: {
    effect: "If protected NPC reaches 0 HP: combat continues but result becomes partial_failure.",
    requires: "combat.protect_target object",
    display: "Barra de HP do alvo protegido visível na UI de combate."
  },
  party_locked: {
    effect: "Only Arslan participates. Party members cannot act. Any automatic party ability is suppressed.",
    requires: "combat.party_locked: true"
  },

  // SISTEMA DE ONDAS
  wave_system: {
    effect: "Enemies enter in waves. Next wave triggers when previous wave is cleared.",
    requires: "combat.waves array",
    display: "Mostrar 'Onda X de Y' na UI."
  },
  wave_on_turn: {
    effect: "Additional enemies enter on specific turn regardless of state.",
    requires: "combat.wave_on_turn: { turn: N, enemies: [] }"
  },

  // FUGA DE INIMIGOS
  escape_trigger: {
    effect: "Enemy attempts to flee when trigger condition is met. If escape successful: activates consequence scene.",
    requires: "enemy.escape_trigger and enemy.escape_turn_delay"
  }
};
```

---

### 13.4 — NOTAS DE IMPLEMENTAÇÃO PARA ESTA PARTE

21. **Não criar modificadores sem setup narrativo.** Toda vez que `combat_modifiers` for usado, a cena anterior deve ter estabelecido o porquê. O combate da ponte é estreito porque a cena descreveu a ponte. O duelo é individual porque Bahram estabeleceu as regras.

22. **`survive_turns` precisa de display claro.** O jogador precisa saber que a condição de vitória é tempo — não "matar tudo." Mostrar contador visual. Texto na tela de combate: "Aguente enquanto Narsus e Elam chegam aos cavalos."

23. **`protect_target` não é game over automático.** Se o mensageiro morre, o combate continua mas o resultado é `partial_failure` — menos recompensa, flag diferente, mas Arslan sobrevive.

24. **`party_locked` no duelo de Turan.** Se Falangies tem uma passiva de "cura aliados automaticamente," ela precisa ser suprimida aqui. O sistema de party_locked deve desativar todas as passivas automáticas dos aliados, não apenas impedir ações manuais.

25. **`narrow_passage` e a fila de combatentes.** Implementar uma fila visual simples: os aliados ficam "em espera" na UI. O jogador pode reordenar a fila antes de cada turno para escolher quem ataca em seguida.

26. **Os combates A, B, C, D, E acima são todos opcionais ou alternativos** — nenhum substitui um caminho principal obrigatório. A, B e E são cenas novas que se inserem organicamente. C só aparece se o jogador falhou em Kashan. D só aparece se o jogador for atrás de Turan.

27. **`night_combat` e `ambush_first_turn` podem coexistir.** Se o jogador escolheu esperar a noite E emboscar (opção `wait_nightfall` na ponte), aplica os dois modificadores.
