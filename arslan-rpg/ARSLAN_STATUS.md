# ARSLAN RPG — Status de Implementação

> Fases A–E concluídas. Acompanhamento das fases finais F, G e H.
> Detalhes de cada fase: ver `ROADMAP_F_balanceamento.md`, `ROADMAP_G_qa.md`, `ROADMAP_H_polish.md`

---

## Fases A–E (concluídas)

| Fase | Descricao | Status |
|------|-----------|--------|
| A | Bugs criticos (6/6) | ✅ Completa |
| B | Sistemas de UI (8/8) + Melhorias visuais (6/6) | ✅ Completa |
| C | Conteudo base — NPCs, quests, itens, inimigos, skills, eventos, lore | ✅ Completa |
| D | Narrativa e drama — character_score, cenas Kharlan/Etoile/Tahamine, Ato 5, epilogos | ✅ Completa |
| E | Combates situacionais — 8 mecanicas + 7 cenas de conteudo | ✅ Completa |

---

## Fase F — Balanceamento de Dificuldade

| Area | Status | Obs |
|------|--------|-----|
| Inimigos Ato 1 (lusitanian_soldier, lusitanian_scout) | ✅ Completo | JSON externos + stats inline act1 |
| Inimigos Ato 2 (desert_bandit, bandit_leader, wolf_giant) | ✅ Completo | JSON externos + stats inline act2 |
| Inimigos Ato 3 (turan_*, sindhura_*, lusitanian_champion/inquisitor) | ✅ Completo | JSON externos + stats inline act3 |
| Inimigos Ato 4 (imperial_guard, assassin_sindhura) | ✅ Completo | JSON externos + stats inline act4 |
| Bosses (kharlan fases 1/2, silvermask) | ✅ Completo | Kharlan 150hp, Silvermask 200+120hp |
| Inimigos de quest (corrupt_merchant, corrupt_noble_guard, cave_guard, slave_trader) | ✅ Completo | JSON externos atualizados |
| Economia (gold rewards + precos de loja) | ✅ Completo | Boss gold: kharlan 6d20+80, wall_breach 5d8+30, sindhura 5d8+20 |

---

## Fase G — QA / Teste de Fluxo

| Area | Status | Obs |
|------|--------|-----|
| Fluxo Ato 1 | ✅ Completo | Refs de cenas validadas; enemies_catalog expandido para 33 entradas |
| Fluxo Ato 2 | ✅ Completo | wave_system, land_N_hits, messenger_capture validados |
| Fluxo Ato 3 | ✅ Completo | kashan_betrayal, turan_duel, slave_caravan validados |
| Fluxo Ato 4 | ✅ Completo | silvermask_awakened, kharlan_guard adicionados ao catalog |
| Fluxo Ato 5 + Epilogos | ✅ Completo | epilogue_dynamic e-construido em runtime; sem broken refs |
| Sistemas transversais (mapa, camp, dialogos, quests, skills, saves, audio) | ✅ Completo | 6 bugs corrigidos: completeQuest rewards, location arrival guard, dismiss consequence, faction milestone useEffect, skill flags (remove_surprise_penalty, force_allies_first) |
| Integridade de dados (scenes, flags, inimigos, itens) | ✅ Completo | 0 cenas quebradas; 14 inimigos adicionados; sword_ceremonial adicionado; set_flags corrigidos |

---

## Fase H — Polish Final

| Item | Status | Obs |
|------|--------|-----|
| H.1 — Tela de Creditos | ✅ Completo | CreditsScreen.jsx com scroll, ESC, rota /credits |
| H.2 — TitleScreen melhorada | ✅ Completo | playTheme exploration, fade 1.5s, navega /credits |
| H.3 — SFX (Web Audio API) | ✅ Completo | playSFX: attack/hit/death/heal/xp/ui_click/dialogue_blip/quest_complete |
| H.4 — GameOverScreen melhorada | ✅ Completo | lastBattle label, subtitulo animado, "Tentar Novamente" |
| H.5 — Indicadores visuais menores | ✅ Completo | questBadge, slideInBadge, cursor SVG estrela dourada |
| H.6 — Revisao de imagens | ✅ Completo | Backgrounds: title, gameover, map, class_select; NPCPortrait com img+fallback SVG; LocationCard com img+fallback; 72 imagens wired |

---

## Resumo

| Fase | Progresso |
|------|-----------|
| F — Balanceamento | 7 / 7 ✅ |
| G — QA | 7 / 7 ✅ |
| H — Polish | 6 / 6 ✅ |

## 🏁 PROJETO CONCLUÍDO — Todas as fases A–H completas
