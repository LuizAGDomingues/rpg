# FASE G — QA / Teste de Fluxo Completo

> Objetivo: percorrer todos os caminhos do jogo e garantir que nenhuma cena, flag ou condicao esta quebrada.
> Marcar cada item conforme testado.

---

## 1. Fluxo principal por ato

### Ato 1 — Prologo
- [ ] Cena inicial carrega corretamente
- [ ] `bridge_battle` com `narrow_passage` funciona
- [ ] Opcao noturna (`night_combat`) funciona
- [ ] Transicao para Ato 2 ocorre apos a ultima cena

### Ato 2 — Exilio
- [ ] `road_ambush` com `wave_system` (2 ondas) completa
- [ ] `training_spar` com `land_N_hits: 3` completa e registra vitoria
- [ ] `messenger_capture` → `post_messenger_fight` encadeados
- [ ] `dahman_region_arrival` dispara na primeira visita ao local
- [ ] Transicao para Ato 3 ocorre apos a ultima cena

### Ato 3 — Alianca
- [ ] `kashan_region_arrival` dispara na primeira visita
- [ ] `kashan_spy_confrontation` → `kashan_betrayal` (survive_turns) → `post_kashan_escape`
- [ ] `turan_envoy_encounter` → `turan_duel_scene` (party_locked) → outcomes corretos (win/execute/loss)
- [ ] `loss_scene` no duelo leva para cena de derrota sem crash
- [ ] `slave_road_encounter` → `slave_caravan_scene` (civilians_present) → outcomes
- [ ] Rota Sindhura opcional: cenas `sindhura_*` acessiveis pela flag correta
- [ ] `sindhura_region_arrival` dispara na primeira visita
- [ ] Transicao para Ato 4

### Ato 4 — Retorno
- [ ] `ecbatana_region_arrival` dispara na primeira visita
- [ ] `kharlan_confrontation` → drama pre-combate → `kharlan_fight_scene` com `mid_combat_events`
- [ ] Kharlan fase 2 ativa apos HP threshold
- [ ] `silvermask_confrontation` com `mid_combat_events` completa
- [ ] `final_war_council_scene` acessivel apos os bosses
- [ ] Tahamine desbloqueavel em `salao_privado_palacio` (flag correta)
- [ ] Transicao para Ato 5

### Ato 5 — Aftermath
- [ ] Todas as 5 cenas de `act5_aftermath.json` carregam
- [ ] `character_score` influencia os dialogos corretamente
- [ ] Os 3 epilogos disparam baseados nos flags/score corretos

---

## 2. Sistemas transversais

### Mapa e viagem
- [ ] `travel_events.json` — 30% de chance dispara modal de evento
- [ ] Skill checks nos travel events funcionam
- [ ] Combate via travel event redireciona e retorna ao mapa

### Camp events
- [ ] 25% de chance dispara modal de evento de acampamento
- [ ] `trigger_flag` e `not_flag` respeitados corretamente

### Dialogos e NPCs
- [ ] Todos os 11 NPCs com JSON de dialogo carregam sem erro
- [ ] Condicoes condicionais (flags, faccoes, humor) avaliam corretamente
- [ ] Shop em NPC mostra itens corretos e finaliza compra

### Quests
- [ ] JournalScreen mostra as 29 quests com progresso correto
- [ ] Quests com `world_flag` como requisito desbloqueiam apos a flag ser setada
- [ ] Recompensas de quests (gold, items, faction_effects) aplicadas

### Skills
- [ ] 4 habilidades lendarias usaveis em combate com cooldown
- [ ] `olhos_nas_sombras`, `flecha_do_destino`, `chuva_de_fogo`, `emboscada_perfeita`
- [ ] Habilidade indisponivel mostra cooldown restante

### Saves
- [ ] Autosave funciona entre cenas
- [ ] Slots 1/2/3 salvam e carregam corretamente
- [ ] GameOverScreen carrega o ultimo save sem crash

### Audio
- [ ] Tema `exploration` toca no mapa/narrativa
- [ ] Tema `combat` toca em combate
- [ ] Tema `dialogue` toca em DialogueScreen
- [ ] Tema `victory` toca apos vitoria em combate
- [ ] Toggle e slider de volume em SettingsScreen funcionam

### Glossario
- [ ] Termos do glossario aparecem sublinhados/destacados em NarrativeBox
- [ ] Tooltip aparece ao hover sem sobrepor outros elementos
- [ ] Nenhum termo causa erro de regex

---

## 3. Verificacoes de integridade de dados

### Scenes ausentes
Checar se todos os `next_scene`, `loss_scene`, `victory_scene` e `start_combat.victory_scene` referenciam IDs que existem:
- [ ] act1_prologue.json
- [ ] act2_exile.json
- [ ] act3_alliance.json
- [ ] act4_return.json
- [ ] act5_aftermath.json
- [ ] epilogues.json

### Flags consistentes
- [ ] Flags setadas em `set_flag` / `set_world_flag` correspondem as flags checadas em `conditions`
- [ ] `narsus_recruited`, `daryun_recruited`, `gieve_recruited` etc. consistentes
- [ ] `region_X_visited` flags setadas no MapScreen para todos os locais com `arrival_scene`

### Inimigos no catalogo
- [ ] Todos os `enemy_id` usados em combates existem em `enemies_catalog.json`
- [ ] Todos os arquivos JSON individuais em `enemies/` tem `id`, `name`, `hp`, `attack`, `defense`

### Itens referenciados
- [ ] IDs de itens usados em quest rewards existem em `consumables.json` ou `weapons.json`
- [ ] IDs de itens usados em lojas de NPC existem

---

## 4. Bugs conhecidos a investigar

| # | Descricao | Arquivo suspeito |
|---|-----------|-----------------|
| - | (adicionar aqui conforme encontrado) | - |
