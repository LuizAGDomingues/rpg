# FASE H — Polish Final

> Objetivo: transformar o jogo funcional em algo visualmente acabado e com sensacao de completude.
> Implementar apenas apos Fase G (QA) concluida.

---

## H.1 — Tela de Creditos

**Componente novo:** `src/screens/CreditsScreen.jsx`

### Conteudo
- Titulo: "ARSLAN — O Principe do Deserto"
- Secoes: Historia, Arte, Programacao, Baseado na obra de Yoshiki Tanaka
- Animacao: scroll vertical lento (CSS `@keyframes scrollUp`)
- Botao "Voltar ao menu" ao final ou por ESC

### Como acionar
- Botao "Creditos" na TitleScreen (já existe o componente)
- Tambem acessivel no menu de pause / SettingsScreen

### Estilo
- Fundo escuro com estrelas (reutilizar `title_bg.jpg` ou fundo novo)
- Texto centralizado, fonte serifada para nomes proprios
- Cor dourada para titulos de secao

---

## H.2 — Tela de Titulo melhorada

**Arquivo:** `src/screens/TitleScreen.jsx`

- [ ] Adicionar botao "Creditos" ao menu principal
- [ ] Animacao de entrada no titulo (fade-in com duracao 1.5s)
- [ ] Versao do jogo no canto inferior direito (ex: "v1.0")
- [ ] Musica da tela de titulo (reutilizar tema `exploration` ou criar novo no `audioEngine.js`)

---

## H.3 — Efeitos Sonoros (SFX)

**Arquivo:** `src/engine/audioEngine.js`

Adicionar funcao `playSFX(type)` ao lado de `playTheme`:

| SFX | Quando tocar |
|-----|-------------|
| `attack` | Ao acertar um golpe em combate |
| `item_use` | Ao usar consumivel |
| `skill_use` | Ao ativar habilidade especial |
| `level_up` | Ao ganhar nivel (se implementado) |
| `quest_complete` | Ao completar uma quest |
| `gold_pickup` | Ao receber ouro |
| `menu_open` | Ao abrir JournalScreen/MapScreen |

Todos os SFX devem:
- Ser gerados via Web Audio API (sem arquivos externos)
- Respeitar o toggle de audio de `SettingsScreen`
- Ser curtos (< 0.5s)

---

## H.4 — Tela de Game Over melhorada

**Arquivo:** `src/screens/GameOverScreen.jsx`

- [ ] Adicionar mensagem de contexto baseada na cena onde o jogador morreu
- [ ] Animacao de fade-in no texto "Fim de Jornada"
- [ ] Mostrar o nome da ultima batalha perdida
- [ ] Botao "Tentar novamente" carrega o save mais recente (autosave)
- [ ] Botao "Menu principal" volta para TitleScreen

---

## H.5 — Indicadores visuais menores

| Item | Onde | Descricao |
|------|------|-----------|
| Indicador de novo dialogo | NPC no mapa | Icone `!` sobre NPCs com dialogo novo disponivel |
| Badge de quest nova | JournalScreen tab | Numero de quests nao lidas |
| Animacao de item recebido | GameScreen | Toast breve "Item obtido: X" com icone |
| Cursor personalizado | Global CSS | Cursor estilizado (espada ou pergaminho) |

---

## H.6 — Revisao de imagens

**Verificar** se todas as imagens referenciadas existem em `public/images/`:

- [ ] Imagens de personagens em `characters/`
- [ ] Imagens de classes em `classes/`
- [ ] Imagens de NPCs em `npcs/`
- [ ] Backgrounds de UI: `title_bg.jpg`, `gameover_bg.jpg`, `map_bg.jpg`, `class_select_bg.jpg`
- [ ] Substituir imagens placeholder por arte final quando disponivel

---

## Ordem de implementacao

```
H.3 (SFX)       — menor escopo, alto impacto de experiencia
H.2 (Titulo)    — visibilidade imediata
H.1 (Creditos)  — componente novo simples
H.4 (GameOver)  — polish de estado negativo
H.5 (Indicadores) — qualidade de vida
H.6 (Imagens)   — depende de assets externos
```
