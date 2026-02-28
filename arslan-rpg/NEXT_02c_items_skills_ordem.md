# ARSLAN NEXT — 02c: Itens, Inimigos, Skills, Eventos, Lore e Ordem
> Conteúdo de gameplay e ordem de implementação por fases.

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