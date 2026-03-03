# FASE F — Balanceamento de Dificuldade

> Objetivo: garantir curva de dificuldade progressiva e coerente do Ato 1 ao Ato 5.
> Arquivo de referência para editar stats em `src/data/characters/enemies/`.

---

## Curva de stats por ato

| Ato | HP inimigo comum | Dano por turno | CA (defesa) | Observacao |
|-----|-----------------|----------------|-------------|------------|
| 1   | 30–60           | 5–12           | 8–12        | Tutorial — erros devem ser perdoaveis |
| 2   | 50–90           | 8–18           | 10–14       | Introduz wave_system e ambush |
| 3   | 70–130          | 12–25          | 12–16       | Inimigos variados, bosses de ato |
| 4   | 100–180         | 18–35          | 14–18       | Kharlan, Silvermask — pressao maxima |
| 5   | 120–200         | 20–40          | 15–19       | Aftermath — inimigos remanescentes |

### Bosses (referencia separada)

| Boss | HP alvo | Dano | CA | Fase |
|------|---------|------|----|------|
| Kharlan (fase 1) | 150 | 20 | 14 | Ato 4 |
| Kharlan (fase 2) | 200 | 28 | 16 | Ato 4 |
| Silvermask | 250 | 32 | 18 | Ato 4 |
| Lusitanian Champion | 180 | 25 | 16 | Ato 3 |

---

## Inimigos a revisar (verificar contra a curva acima)

Todos os arquivos em `src/data/characters/enemies/`:

- [ ] `lusitanian_soldier.json` — Ato 1/2
- [ ] `lusitanian_scout.json` — Ato 1/2
- [ ] `lusitanian_champion.json` — Ato 3 boss
- [ ] `lusitanian_inquisitor.json` — Ato 3
- [ ] `desert_bandit.json` — Ato 2
- [ ] `bandit_leader.json` — Ato 2 mini-boss
- [ ] `wolf_giant.json` — Ato 2 evento
- [ ] `turan_horseman.json` — Ato 3
- [ ] `turan_warrior.json` — Ato 3
- [ ] `sindhura_guard.json` — Ato 3 rota opcional
- [ ] `assassin_sindhura.json` — Ato 3/4
- [ ] `corrupt_merchant.json` — quest
- [ ] `corrupt_noble_guard.json` — quest
- [ ] `cave_guard.json` — quest
- [ ] `slave_trader.json` — Ato 3 cena E
- [ ] `imperial_guard.json` — Ato 4
- [ ] `kharlan.json` — Ato 4 boss (fase 1 e 2)

---

## Ouro e recompensas

| Tipo de encontro | Gold reward |
|-----------------|-------------|
| Inimigo comum   | 5–15        |
| Mini-boss       | 25–50       |
| Boss de ato     | 80–150      |
| Quest reward    | 30–100      |

---

## Economia da loja

- Consumiveis baratos (pocoes basicas): 10–30 gold
- Consumiveis medios (cura completa, antidotos): 40–80 gold
- Armas comuns: 50–120 gold
- Armas unicas de quest: **nao vendaveis** (is_unique: true)
- O jogador deve conseguir 2–3 pocoes basicas apos cada combate padrao

---

## Como implementar

1. Abrir o arquivo JSON do inimigo
2. Comparar `hp`, `attack`, `defense` com a tabela do ato correspondente
3. Ajustar os valores se estiverem fora da faixa
4. Testar o combate no fluxo normal (nao apenas na tela de debug)
