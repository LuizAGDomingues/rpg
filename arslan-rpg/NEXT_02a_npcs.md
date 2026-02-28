# ARSLAN NEXT — 02a: NPCs e Diálogos
> 16 NPCs completos com diálogos condicionais.

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
