# ARSLAN NEXT — 04: Combates Situacionais
> Correções em combates existentes + novas cenas com mecânicas que emergem da narrativa. Implementar após NEXT_01.

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
