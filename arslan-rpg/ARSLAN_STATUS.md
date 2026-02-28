# ARSLAN RPG — Status de Implementação

> Documento de acompanhamento das fases do ARSLAN_NEXT.md.
> Atualizado após a sessão de implementação da Fase D.

---

## Fase A — Bugs Críticos (`NEXT_01` Parte 1)

| # | Bug | Status | Obs |
|---|-----|--------|-----|
| 1 | `gold_reward` nunca parseado em combate | ✅ Feito | `calculateGoldReward` atualizado em `combatEngine.js` e `CombatScreen` |
| 2 | `factionEngine` / `questEngine` eram código morto | ✅ Feito | `FactionCard` usa `getFactionStatus`; `JournalScreen` usa `getActiveQuestProgress` |
| 3 | Viagem no mapa não dispara eventos narrativos | ❌ Faltando | `MapScreen` chama `setCurrentRegion` mas sem `arrival_scene` |
| 4 | Side quests sem caminho de início | ⚠ Parcial | `DialogueScreen` existe; falta NPCs em locais do mapa oferecerem quests |
| 5 | Habilidades Lendárias sem sistema de uso | ✅ Feito | `skillEngine.js` + menu de skills no `CombatScreen` |
| 6 | Condição `narsus_recruited` avaliava flag errada | ✅ Feito | `conditions.js` tem pattern `_recruited` checando `recruited_generals` |

---

## Fase B — Sistemas de UI (`NEXT_01` Parte 2)

| # | Sistema | Status | Obs |
|---|---------|--------|-----|
| 2.1 | DialogueScreen | ✅ Feito | Completo com skill check, humor do NPC, flags, fações |
| 2.2 | Locais do mapa clicáveis com NPCs | ❌ Faltando | Mapa mostra regiões, não locais individuais |
| 2.3 | Habilidades em combate | ✅ Feito | Submenu de skills, cooldowns, habilidades lendárias |
| 2.4 | Sistema de Descanso | ❌ Faltando | — |
| 2.5 | Sistema de Loja | ❌ Faltando | Placeholder no diálogo, lógica não implementada |
| 2.6 | Saves múltiplos + autosave | ❌ Faltando | Só localStorage simples sem slots |
| 2.7 | Tela de Game Over | ❌ Faltando | Derrota mostra painel estático, sem carregar save |
| 2.8 | Notificações de milestone de facções | ❌ Faltando | — |

---

## Fase B — Melhorias Visuais (`NEXT_01` Parte 3)

| # | Melhoria | Status | Obs |
|---|----------|--------|-----|
| 3.1 | Flash de dano / animações CSS | ⚠ Parcial | Transições básicas existem; flash de dano no card não implementado |
| 3.2 | Música procedural (Web Audio API) | ❌ Faltando | — |
| 3.3 | Indicador de progresso do ato | ❌ Faltando | — |
| 3.4 | Glossário (tooltips em palavras-chave) | ❌ Faltando | — |
| 3.5 | Labels de reputação visível por facção | ❌ Faltando | FactionCard mostra número, sem label Hostil/Aliado |
| 3.6 | Contador de tropas dinâmico | ❌ Faltando | — |

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

## Fase E — Combates Situacionais (`NEXT_04`)

| Combate | Status | Obs |
|---------|--------|-----|
| Patrulha na Floresta — bônus de emboscada (turno 1) | ❌ Faltando | Escolha existe na cena mas não afeta o combate |
| Emboscada Lusitana — sistema de ondas | ❌ Faltando | `wave_system` não implementado no `combatEngine` |
| Demais combates situacionais planejados | ❌ Faltando | Passagem estreita, sobreviver N turnos, duelo singular, etc. |

---

## Resumo

| Fase | Progresso |
|------|-----------|
| A — Bugs críticos | 4/6 ✅ |
| B — Sistemas de UI | 2/8 ✅ |
| B — Melhorias visuais | 0/6 ✅ |
| C — Conteúdo base | Parcial em todas as áreas |
| D — Narrativa e drama | **✅ Completa** |
| E — Combates situacionais | 0/5+ ✅ |

**Prioridades recomendadas para a próxima sessão:**
1. Bug 3 — `arrival_scene` no mapa (desbloquearia NPCs e quests)
2. Sistema 2.2 — locais clicáveis (desbloquearia loja, descanso, quests)
3. Fase E — `wave_system` em `combatEngine` (mecânica usada em vários combates)
