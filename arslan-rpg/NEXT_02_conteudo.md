# ARSLAN NEXT — 02: Conteúdo (NPCs, Quests, Itens, Inimigos, Skills, Eventos)

> Leia cada arquivo deste conjunto antes de implementar. Siga a ordem das fases.

---

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
