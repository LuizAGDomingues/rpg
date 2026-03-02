# ARSLAN RPG — Status de Implementação

> Documento de acompanhamento das fases do ARSLAN_NEXT.md.
> Atualizado após a sessão de implementação das Fases D e E.

---

## Fase A — Bugs Críticos (`NEXT_01` Parte 1)

| # | Bug | Status | Obs |
|---|-----|--------|-----|
| 1 | `gold_reward` nunca parseado em combate | ✅ Feito | `calculateGoldReward` atualizado em `combatEngine.js` e `CombatScreen` |
| 2 | `factionEngine` / `questEngine` eram código morto | ✅ Feito | `FactionCard` usa `getFactionStatus`; `JournalScreen` usa `getActiveQuestProgress` |
| 3 | Viagem no mapa não dispara eventos narrativos | ✅ Feito | `handleTravel` dispara `arrival_scene` na primeira visita; cenas adicionadas em act2/3/4; `navigate_to_map` em GameScreen |
| 4 | Side quests sem caminho de início | ⚠ Parcial | `DialogueScreen` existe; falta NPCs em locais do mapa oferecerem quests |
| 5 | Habilidades Lendárias sem sistema de uso | ✅ Feito | `skillEngine.js` + menu de skills no `CombatScreen` |
| 6 | Condição `narsus_recruited` avaliava flag errada | ✅ Feito | `conditions.js` tem pattern `_recruited` checando `recruited_generals` |

---

## Fase B — Sistemas de UI (`NEXT_01` Parte 2)

| # | Sistema | Status | Obs |
|---|---------|--------|-----|
| 2.1 | DialogueScreen | ✅ Feito | Completo com skill check, humor do NPC, flags, fações |
| 2.2 | Locais do mapa clicáveis com NPCs | ✅ Feito | `LocationPanel` com NPCs, loja, descanso |
| 2.3 | Habilidades em combate | ✅ Feito | Submenu de skills, cooldowns, habilidades lendárias |
| 2.4 | Sistema de Descanso | ✅ Feito | `LocationPanel` com botão Descansar |
| 2.5 | Sistema de Loja | ✅ Feito | `LocationPanel` com loja, buyItem, sellItem |
| 2.6 | Saves múltiplos + autosave | ✅ Feito | `saveToSlot`/`loadFromSlot` com slots auto/1/2/3 |
| 2.7 | Tela de Game Over | ✅ Feito | `GameOverScreen` com carregamento de save |
| 2.8 | Notificações de milestone de facções | ✅ Feito | `factionMilestone` banner em `GameScreen` |

---

## Fase B — Melhorias Visuais (`NEXT_01` Parte 3)

| # | Melhoria | Status | Obs |
|---|----------|--------|-----|
| 3.1 | Flash de dano / animações CSS | ✅ Feito | `damageFlash` animation no `CombatScreen.module.css` |
| 3.2 | Música procedural (Web Audio API) | ❌ Faltando | — |
| 3.3 | Indicador de progresso do ato | ✅ Feito | `actProgressBar` em `GameScreen` |
| 3.4 | Glossário (tooltips em palavras-chave) | ❌ Faltando | — |
| 3.5 | Labels de reputação visível por facção | ✅ Feito | `FactionCard` usa `getFactionStatus` com labels |
| 3.6 | Contador de tropas dinâmico | ✅ Feito | `troopCount` calculado em `GameScreen` |

---

## Fase C — Conteúdo Base (`NEXT_02a` + `NEXT_02b` + `NEXT_02c`)

| Área | Status | Obs |
|------|--------|-----|
| NPCs (`NEXT_02a`) — 16 NPCs planejados | ⚠ Parcial | Sistema de diálogo funciona; nem todos os 16 NPCs têm JSON completo |
| Quests (`NEXT_02b`) — 23 quests planejadas | ⚠ Parcial | `questEngine` + `side_quests.json` existem; entrada via mapa não conectada |
| Itens / 60+ itens planejados | ⚠ Parcial | Sistema de inventário existe; catálogo incompleto |
| Inimigos / 15+ planejados | ⚠ Parcial | Inimigos base nos combates existentes; catálogo incompleto |
| Skills / 25+ planejadas | ⚠ Parcial | `skillEngine` completo; nem todas as skills dos arquivos de classe têm efeito mecânico |

---

## Fase D — Narrativa e Drama (`NEXT_03`) ✅ Completa

| Item | Status | Arquivo(s) |
|------|--------|-----------|
| `character_score` invisível (-100 a +100) | ✅ | `useGameStore.js`, `narrativeEngine.js`, `conditions.js` |
| Reações do mundo ao caráter | ✅ | `character_reactions.json` |
| Diálogo Narsus × escravatura | ✅ | `narsus_slavery_dialogue.json` |
| Diálogo Etoile (aliança condicional) | ✅ | `etoile_dialogue.json` |
| Diálogo Tahamine (sala privada) | ✅ | `tahamine_dialogue.json` |
| Confronto Kharlan (pré-combate dramático) | ✅ | `act4_return.json` — cenas `kharlan_confrontation*` |
| Boss Kharlan com `mid_combat_events` | ✅ | `act4_return.json` — cena `kharlan_fight_scene` |
| Boss Silvermask com `mid_combat_events` | ✅ | `act4_return.json` — cena `silvermask_confrontation` |
| Rota de Sindhura (Ato 3 opcional) | ✅ | `act3_alliance.json` — cenas `sindhura_*` |
| Conselho de Guerra Final | ✅ | `act4_return.json` — cena `final_war_council_scene` |
| Ato 5 — aftermath (5 cenas) | ✅ | `act5_aftermath.json` |
| 3 epílogos dinâmicos | ✅ | `epilogues.json` + `GameScreen.jsx` |
| Suporte a OR em `conditions.js` | ✅ | `conditions.js` |
| `character_score` / `set_flag` nos diálogos | ✅ | `dialogueEngine.js` |

---

## Fase E — Combates Situacionais (`NEXT_04`) ✅ Mecânicas Completas

### Mecânicas implementadas em `CombatScreen.jsx`:

| Mecânica | Status | Obs |
|----------|--------|-----|
| `wave_system` | ✅ Feito | Multi-wave com `advanceWave`, `waveNumberRef`, banner visual |
| `ambush_first_turn` | ✅ Feito | Inimigos pulam turno 1; log de emboscada |
| `survive_turns` | ✅ Feito | Vitória após N rodadas; contador animado |
| `land_N_hits` | ✅ Feito | Vitória ao acertar N golpes; counter visual |
| `party_locked` | ✅ Feito | Apenas Arslan combate; aliados ignorados na inicialização |
| `wave_on_turn` | ✅ Feito | Reforços entram no turno N |
| `narrow_passage` | ✅ Feito | Flag no combate (usado no Ato 1 ponte) |
| `night_combat` | ✅ Feito | Flag no combate (escolha noturna no Ato 1) |

### CSS adicionado em `CombatScreen.module.css`:

| Classe | Propósito |
|--------|-----------|
| `.waveBanner` | Indica onda atual (gold, uppercase) |
| `.waveTransition` | Overlay entre ondas com texto de intro |
| `.surviveCounter` | Contador de rodadas com animação `survivePulse` |
| `.hitCounter` | Contador de acertos para `land_N_hits` |
| `.partyLocked` | Aviso de duelo singular (crimson) |

### Combates de conteúdo atualizados:

| Combate | Status | Arquivo |
|---------|--------|---------|
| Ponte Ato 1 — `bridge_battle` | ✅ Feito | `act1_prologue.json` — `narrow_passage`, 3 inimigos, opção noturna |
| Emboscada Ato 2 — `road_ambush` | ✅ Feito | `act2_exile.json` — `wave_system` 2 ondas |
| Treino com Daryun — `training_spar` | ✅ Feito | `act2_exile.json` — `land_N_hits: 3` |
| Cena A — Nova cena ponte (Ato 1) | ✅ Feito | `act1_prologue.json` |
| Cena B — Mensageiro Interceptado (Ato 2) | ✅ Feito | `act2_exile.json` — `messenger_capture` + `post_messenger_fight` |
| Cena C — Traição em Kashan | ✅ Feito | `act3_alliance.json` — `kashan_spy_confrontation`, `kashan_betrayal` (survive_turns), `post_kashan_escape`, `hodir_spy_exposed` |
| Cena D — Duelo com Cavaleiro Turan | ✅ Feito | `act3_alliance.json` — `turan_envoy_encounter`, `turan_duel_scene` (party_locked + mid_combat_events), `turan_duel_outcome/win/execute/loss`; `loss_scene` no CombatScreen |
| Cena E — Caravana de Escravos | ✅ Feito | `act3_alliance.json` — `slave_road_encounter`, `slave_caravan_scene` (civilians_present), `caravan_no_fight`, `post_caravan_fight`; `.civiliansWarning` CSS |

---

## Resumo

| Fase | Progresso |
|------|-----------|
| A — Bugs críticos | 5/6 ✅ |
| B — Sistemas de UI | 8/8 ✅ |
| B — Melhorias visuais | 4/6 ✅ |
| C — Conteúdo base | Parcial em todas as áreas |
| D — Narrativa e drama | **✅ Completa** |
| E — Mecânicas de combate | **✅ Completa** (8/8 mecânicas + `loss_scene` + `civilians_present`) |
| E — Cenas situacionais | **✅ 7/7 ✅** |

**Prioridades recomendadas para a próxima sessão:**
1. 3.2 — Música procedural Web Audio API
2. 3.4 — Glossário com tooltips em palavras-chave narrativas
3. Fase C — NPCs e side quests (conectar dialógos ao mapa)
