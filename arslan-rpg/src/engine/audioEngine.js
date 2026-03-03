/**
 * audioEngine.js — Música procedural via Web Audio API
 * Sem assets externos. Gera música generativa baseada no estado do jogo.
 *
 * Temas:
 *   exploration — arpejo suave, modo dórico, 60bpm
 *   combat      — percussão rítmica + drone tenso, 120bpm
 *   dialogue    — melodia de flauta simples, 55bpm
 *   victory     — fanfarra curta de 3 notas
 */

let ctx = null;
let masterGain = null;
let currentTheme = null;
let themeNodes = []; // refs para parar o tema atual
let schedulerTimeout = null;
let isEnabled = true;

// ─── Inicialização ─────────────────────────────────────────────────────────

function getContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

function resume() {
  const c = getContext();
  if (c.state === 'suspended') c.resume();
}

// ─── Utilitários de frequência ──────────────────────────────────────────────

// Modo dórico em Ré: D E F G A B C D
const DORIAN_D = [293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];
// Modo frígio em Mi (para combate, mais tenso)
const PHRYGIAN_E = [329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];

function noteHz(scale, degree, octave = 0) {
  const base = scale[degree % scale.length];
  return base * Math.pow(2, octave + Math.floor(degree / scale.length));
}

// ─── Osciladores e envelopes ─────────────────────────────────────────────────

function createOsc(frequency, type = 'sine', gainValue = 0.15, detune = 0) {
  const c = getContext();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, c.currentTime);
  if (detune) osc.detune.setValueAtTime(detune, c.currentTime);
  g.gain.setValueAtTime(gainValue, c.currentTime);
  osc.connect(g);
  g.connect(masterGain);
  osc.start();
  return { osc, gain: g };
}

function pluck(frequency, time, duration = 0.8, gainValue = 0.2) {
  const c = getContext();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, time);
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(gainValue, time + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(time);
  osc.stop(time + duration + 0.05);
  return osc;
}

function percussion(time, gainValue = 0.25) {
  const c = getContext();
  const buffer = c.createBuffer(1, c.sampleRate * 0.1, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
  const source = c.createBufferSource();
  const g = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(200, time);
  source.buffer = buffer;
  g.gain.setValueAtTime(gainValue, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  source.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  source.start(time);
  source.stop(time + 0.15);
}

// ─── Temas ──────────────────────────────────────────────────────────────────

// EXPLORATION: arpejo lento em modo dórico, 60bpm (1 beat = 1s)
function startExploration() {
  if (!isEnabled) return;
  resume();
  const c = getContext();

  // Drone de fundo
  const { osc: drone1, gain: dg1 } = createOsc(DORIAN_D[0] / 2, 'sine', 0.06);
  const { osc: drone2, gain: dg2 } = createOsc(DORIAN_D[4] / 2, 'sine', 0.04);
  themeNodes.push(drone1, drone2, dg1, dg2);

  // Padrão de arpejo: [0,2,4,6,4,2,0,2] em graus da escala
  const PATTERN = [0, 2, 4, 6, 4, 2, 0, 2];
  const BEAT = 1.0; // 60bpm

  let nextBeat = c.currentTime + 0.1;
  let step = 0;

  function schedule() {
    while (nextBeat < c.currentTime + 0.4) {
      const degree = PATTERN[step % PATTERN.length];
      const freq = noteHz(DORIAN_D, degree);
      pluck(freq, nextBeat, 0.9, 0.18);
      // Ocasionalmente adiciona oitava acima
      if (step % 4 === 0) pluck(freq * 2, nextBeat + BEAT * 0.5, 0.6, 0.1);
      nextBeat += BEAT;
      step++;
    }
    schedulerTimeout = setTimeout(schedule, 200);
  }
  schedule();
}

// COMBAT: percussão rítmica + drone tenso, 120bpm
function startCombat() {
  if (!isEnabled) return;
  resume();
  const c = getContext();

  // Drone tenso
  const { osc: d1, gain: dg1 } = createOsc(PHRYGIAN_E[0] / 2, 'sawtooth', 0.04);
  const { osc: d2, gain: dg2 } = createOsc(PHRYGIAN_E[1] / 2, 'sawtooth', 0.03, 5);
  themeNodes.push(d1, d2, dg1, dg2);

  // Melodia rítmica em modo frígio
  const MELODY = [0, 0, 2, 1, 3, 2, 1, 0];
  const BEAT = 0.5; // 120bpm

  let nextBeat = c.currentTime + 0.05;
  let step = 0;

  function schedule() {
    while (nextBeat < c.currentTime + 0.4) {
      // Percussão em cada beat
      percussion(nextBeat, 0.2);
      // Percussão mais forte no downbeat
      if (step % 4 === 0) percussion(nextBeat, 0.35);

      // Melodia a cada 2 beats
      if (step % 2 === 0) {
        const degree = MELODY[(step / 2) % MELODY.length];
        pluck(noteHz(PHRYGIAN_E, degree), nextBeat, 0.4, 0.15);
      }

      nextBeat += BEAT;
      step++;
    }
    schedulerTimeout = setTimeout(schedule, 200);
  }
  schedule();
}

// DIALOGUE: melodia de flauta simples, 55bpm
function startDialogue() {
  if (!isEnabled) return;
  resume();
  const c = getContext();

  // Notas de "flauta" (sine + harmônico)
  const MELODY = [0, 2, 4, 2, 1, 3, 2, 0, 4, 3, 2, 1];
  const BEAT = 60 / 55; // ~1.09s por beat

  let nextBeat = c.currentTime + 0.1;
  let step = 0;

  function schedule() {
    while (nextBeat < c.currentTime + 0.5) {
      const degree = MELODY[step % MELODY.length];
      const freq = noteHz(DORIAN_D, degree + 1); // oitava acima
      // Fundamental
      pluck(freq, nextBeat, BEAT * 0.85, 0.12);
      // Harmônico leve
      pluck(freq * 1.5, nextBeat + 0.05, BEAT * 0.6, 0.04);

      nextBeat += BEAT;
      step++;
    }
    schedulerTimeout = setTimeout(schedule, 250);
  }
  schedule();
}

// VICTORY: fanfarra curta ascendente (3 notas + tônica no topo)
function playVictory() {
  if (!isEnabled) return;
  resume();
  const c = getContext();
  const t = c.currentTime;
  const fanfare = [DORIAN_D[0], DORIAN_D[2], DORIAN_D[4], DORIAN_D[7]];
  fanfare.forEach((freq, i) => {
    pluck(freq * 2, t + i * 0.25, 0.8, 0.25);
    pluck(freq, t + i * 0.25, 0.6, 0.12);
  });
}

// ─── API pública ─────────────────────────────────────────────────────────────

function stopCurrent() {
  if (schedulerTimeout) {
    clearTimeout(schedulerTimeout);
    schedulerTimeout = null;
  }
  themeNodes.forEach((node) => {
    try {
      if (node instanceof OscillatorNode) node.stop();
      else if (node instanceof GainNode) node.disconnect();
    } catch (_) { /* ignore double-stop */ }
  });
  themeNodes = [];
}

export function playTheme(theme) {
  if (theme === currentTheme) return;
  stopCurrent();
  currentTheme = theme;

  switch (theme) {
    case 'exploration': startExploration(); break;
    case 'combat':      startCombat();      break;
    case 'dialogue':    startDialogue();    break;
    case 'victory':     playVictory();      break;
    default: break;
  }
}

export function stopTheme() {
  stopCurrent();
  currentTheme = null;
}

export function setVolume(value) {
  // value: 0.0 – 1.0
  if (masterGain) {
    masterGain.gain.linearRampToValueAtTime(
      Math.max(0, Math.min(1, value)) * 0.4,
      getContext().currentTime + 0.1
    );
  }
}

export function setEnabled(enabled) {
  isEnabled = enabled;
  if (!enabled) stopCurrent();
}

export function getCurrentTheme() {
  return currentTheme;
}

// ─── SFX ─────────────────────────────────────────────────────────────────────

export function playSFX(type) {
  if (!isEnabled) return;
  resume();
  const c = getContext();
  const t = c.currentTime;

  switch (type) {
    case 'attack': {
      // Metal clash — sawtooth sweep down
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.12);
      g.gain.setValueAtTime(0.28, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(g); g.connect(masterGain);
      osc.start(t); osc.stop(t + 0.2);
      break;
    }
    case 'hit': {
      // Impact thud — filtered noise burst
      const buf = c.createBuffer(1, c.sampleRate * 0.08, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.025));
      const src = c.createBufferSource();
      const filter = c.createBiquadFilter();
      const g = c.createGain();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, t);
      src.buffer = buf;
      g.gain.setValueAtTime(0.45, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      src.connect(filter); filter.connect(g); g.connect(masterGain);
      src.start(t); src.stop(t + 0.12);
      break;
    }
    case 'death': {
      // Descending tone — enemy defeated
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(55, t + 0.55);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.connect(g); g.connect(masterGain);
      osc.start(t); osc.stop(t + 0.6);
      break;
    }
    case 'heal': {
      // Rising arpeggio — restore HP
      [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
        pluck(freq, t + i * 0.08, 0.5, 0.18);
      });
      break;
    }
    case 'xp': {
      // Bright ascending chime — XP / level up
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        pluck(freq, t + i * 0.07, 0.45, 0.16);
      });
      break;
    }
    case 'ui_click': {
      // Crisp short click — button press
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, t);
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      osc.connect(g); g.connect(masterGain);
      osc.start(t); osc.stop(t + 0.055);
      break;
    }
    case 'dialogue_blip': {
      // Soft blip — text character advance
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, t);
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      osc.connect(g); g.connect(masterGain);
      osc.start(t); osc.stop(t + 0.03);
      break;
    }
    case 'quest_complete': {
      // Ascending fanfare — quest done
      [392.00, 523.25, 659.25, 783.99].forEach((freq, i) => {
        pluck(freq, t + i * 0.11, 0.65, 0.22);
      });
      break;
    }
    default: break;
  }
}
