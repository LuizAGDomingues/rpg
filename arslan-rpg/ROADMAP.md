# ARSLAN RPG — Roadmap Pós-Lançamento

> Fases A–E concluídas. Este documento cobre o que resta para o jogo estar completo e polido.
> Status de cada fase: ver `ARSLAN_STATUS.md`

---

## Fases restantes

| Fase | Tema | Arquivo de detalhes |
|------|------|---------------------|
| F | Balanceamento de dificuldade | `ROADMAP_F_balanceamento.md` |
| G | QA — Teste de fluxo completo | `ROADMAP_G_qa.md` |
| H | Polish final (créditos, arte, SFX) | `ROADMAP_H_polish.md` |

---

## Ordem recomendada

```
Fase G primeiro — identificar cenas/flags quebradas antes de balancear
Fase F depois   — ajustar números com o fluxo funcionando
Fase H por último — polish só faz sentido com o conteúdo estável
```

---

## Notas globais

- Todo conteúdo narrativo novo vai em `src/data/narrative/`
- Novos componentes de UI vão em `src/components/ui/`
- Não criar telas novas sem antes checar se uma existente pode ser reutilizada
- `character_score` nunca tem UI visível — o mundo reage silenciosamente
