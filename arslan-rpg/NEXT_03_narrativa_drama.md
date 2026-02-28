# ARSLAN NEXT — 03: Narrativa e Drama
> Sistema de caráter invisível, árvores de diálogo, cenas de boss, impacto mundial, Sindhura, Ato 5, Epílogos.

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
