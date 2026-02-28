# ARSLAN NEXT — ÍNDICE GERAL

> **LEIA ESTE ARQUIVO PRIMEIRO.** O documento original `ARSLAN_NEXT.md` foi dividido em arquivos menores por tema.
> Leia os arquivos relevantes para a tarefa que vai implementar. Não precisa ler todos de uma vez.
>
> **Status de implementação:** ver `ARSLAN_STATUS.md`

---

## Arquivos deste conjunto

| Arquivo | Conteúdo | Quando ler |
|---|---|---|
| `NEXT_01_bugs_sistemas.md` | Bugs críticos, sistemas a implementar (UI, loja, saves, etc.), melhorias visuais | **Sempre. Leia primeiro.** |
| `NEXT_02a_npcs.md` | 16 NPCs completos com diálogos condicionais | Ao implementar NPCs ou DialogueScreen |
| `NEXT_02b_quests.md` | 23 quests secundárias completas | Ao implementar o sistema de quests |
| `NEXT_02c_items_skills_ordem.md` | 60+ itens, 15+ inimigos, 25+ habilidades, eventos, lore, glossário, **ordem de implementação por fases** | Ao implementar loja, combate, ou para saber o que fazer a seguir |
| `NEXT_03_narrativa_drama.md` | Sistema de caráter invisível, diálogos Kharlan/Tahamine/Etoile/Narsus, boss fights com drama, Sindhura, Ato 5, 3 epílogos | Ao implementar cenas narrativas ou conteúdo de Ato 4/5 |
| `NEXT_04_combates.md` | Correções em combates existentes + 5 novas cenas com mecânicas situacionais (passagem estreita, sobreviver turnos, duelo singular, etc.) | Ao implementar ou modificar combates |

---

## Ordem de implementação recomendada (resumo)

```
Fase A — Bugs críticos           → NEXT_01 (seção Bugs)
Fase B — Sistemas de UI          → NEXT_01 (seção Implementações)
Fase C — Conteúdo base           → NEXT_02a + NEXT_02b + NEXT_02c
Fase D — Narrativa e drama       → NEXT_03
Fase E — Combates situacionais   → NEXT_04
```

Para a ordem detalhada com estimativas de tempo, ver `NEXT_02c_items_skills_ordem.md` (seção "Ordem de Implementação").

---

## Notas globais importantes

- **character_score** nunca tem UI. Zero número, zero barra. O mundo reage silenciosamente.
- **mid_combat_events** interrompem o combate após cada turno para texto/choices quando o trigger é satisfeito.
- **ARSLAN_NEXT.md original** ainda existe mas não deve ser editado — é o arquivo-fonte que gerou estes.
- Todo conteúdo novo de cenas vai em `src/data/narrative/`. Ato 5 vai em `act5_aftermath.json` (novo arquivo).
- Sindhura se encaixa em `act3_alliance.json` após a cena `war_council`.
- Tahamine: desbloqueável em `salao_privado_palacio` no Ato 4. Não aparece automaticamente.
