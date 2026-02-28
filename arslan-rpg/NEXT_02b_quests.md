# ARSLAN NEXT — 02b: Quests Secundárias
> 23 quests secundárias completas.

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
