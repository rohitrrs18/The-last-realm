// src/audio/sfx.ts
// Procedural sound effects. All sounds are synthesized live via the Web
// Audio API — no files loaded. Provides a single `sfx.play(name)` API.

import { audioManager } from './AudioManager';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SfxName =
  // UI
  | 'ui-click'
  | 'ui-hover'
  | 'ui-open'
  | 'ui-close'
  // Combat
  | 'sword-hit'
  | 'sword-crit'
  | 'magic-cast'
  | 'fire-whoosh'
  | 'ice-crack'
  | 'arrow-shot'
  | 'enemy-hit'
  | 'enemy-die'
  // Feedback
  | 'level-up'
  | 'quest-complete'
  | 'achievement'
  | 'potion-drink'
  | 'gold-pickup'
  | 'error-buzz';

/* ------------------------------------------------------------------ */
/*  Play dispatcher                                                    */
/* ------------------------------------------------------------------ */

/**
 * Play a sound effect by name. Fail-safe: if audio isn't unlocked,
 * silently no-ops.
 */
function play(name: SfxName): void {
  audioManager.init();
  if (!audioManager.isUnlocked) {
    // Try to defer once — the manager's gesture unlock will fire later,
    // but we don't want to queue dozens of sounds. Just skip.
    return;
  }
  const ctx = audioManager.context;
  const bus = audioManager.buses.sfx;
  if (!ctx || !bus) return;

  switch (name) {
    case 'ui-click':       return playClick(ctx, bus);
    case 'ui-hover':       return playHover(ctx, bus);
    case 'ui-open':        return playWhoosh(ctx, bus, 220, 520, 0.14, 'up');
    case 'ui-close':       return playWhoosh(ctx, bus, 520, 220, 0.14, 'down');
    case 'sword-hit':      return playSwordHit(ctx, bus, false);
    case 'sword-crit':     return playSwordHit(ctx, bus, true);
    case 'magic-cast':     return playMagicCast(ctx, bus);
    case 'fire-whoosh':    return playFire(ctx, bus);
    case 'ice-crack':      return playIce(ctx, bus);
    case 'arrow-shot':     return playArrow(ctx, bus);
    case 'enemy-hit':      return playEnemyHit(ctx, bus);
    case 'enemy-die':      return playEnemyDie(ctx, bus);
    case 'level-up':       return playLevelUp(ctx, bus);
    case 'quest-complete': return playQuestComplete(ctx, bus);
    case 'achievement':    return playAchievement(ctx, bus);
    case 'potion-drink':   return playPotion(ctx, bus);
    case 'gold-pickup':    return playGold(ctx, bus);
    case 'error-buzz':     return playError(ctx, bus);
  }
}

/* ------------------------------------------------------------------ */
/*  UI sounds                                                          */
/* ------------------------------------------------------------------ */

function playClick(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(720, now + 0.04);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + 0.08);
}

function playHover(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 1240;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.02, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + 0.06);
}

function playWhoosh(
  ctx: AudioContext,
  dest: AudioNode,
  startHz: number,
  endHz: number,
  duration: number,
  direction: 'up' | 'down'
): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(startHz, now);
  osc.frequency.exponentialRampToValueAtTime(endHz, now + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, now);
  filter.frequency.exponentialRampToValueAtTime(
    direction === 'up' ? 4000 : 600,
    now + duration
  );

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function playError(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  for (let i = 0; i < 2; i++) {
    const t = now + i * 0.09;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 220;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.04, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.08);
  }
}

/* ------------------------------------------------------------------ */
/*  Combat sounds                                                      */
/* ------------------------------------------------------------------ */

function playSwordHit(ctx: AudioContext, dest: AudioNode, isCrit: boolean): void {
  const now = ctx.currentTime;

  // Metallic tone.
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(isCrit ? 620 : 520, now);
  osc.frequency.exponentialRampToValueAtTime(isCrit ? 240 : 300, now + 0.08);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 400;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(isCrit ? 0.12 : 0.08, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + 0.18);

  // Short noise burst for impact.
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx, 0.06);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(isCrit ? 0.09 : 0.05, now);
  nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'bandpass';
  nFilter.frequency.value = 1400;
  nFilter.Q.value = 1.5;

  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(dest);
  noise.start(now);
  noise.stop(now + 0.08);
}

function playMagicCast(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const base = 440 + i * 220;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.8, now + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now + i * 0.03);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02 + i * 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4 + i * 0.05);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now + i * 0.03);
    osc.stop(now + 0.5);
  }
}

function playFire(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  // Noise + lowpass → "whoosh".
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx, 0.4);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3000, now);
  filter.frequency.exponentialRampToValueAtTime(400, now + 0.4);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  noise.start(now);
  noise.stop(now + 0.42);
}

function playIce(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  // Two high, thin tones.
  for (let i = 0; i < 2; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200 + i * 400, now);
    osc.frequency.exponentialRampToValueAtTime(1200 + i * 200, now + 0.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now + i * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02 + i * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22 + i * 0.04);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now + i * 0.04);
    osc.stop(now + 0.28 + i * 0.04);
  }
}

function playArrow(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx, 0.12);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2200;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  noise.start(now);
  noise.stop(now + 0.12);
}

function playEnemyHit(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + 0.2);
}

function playEnemyDie(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.07, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + 0.6);
}

/* ------------------------------------------------------------------ */
/*  Feedback sounds                                                    */
/* ------------------------------------------------------------------ */

function playLevelUp(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  // Ascending arpeggio.
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const t = now + i * 0.08;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.45);
  });
}

function playQuestComplete(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  // Single warm bell-like tone (fundamental + fifth).
  const fundamentals = [587.33, 880]; // D5 + A5
  for (const freq of fundamentals) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 1.1);
  }
}

function playAchievement(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  // Triumphant three-note fanfare.
  const notes = [523.25, 659.25, 1046.5];
  notes.forEach((freq, i) => {
    const t = now + i * 0.12;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.6);
  });
}

function playPotion(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  // Two downward bubbles.
  for (let i = 0; i < 2; i++) {
    const t = now + i * 0.08;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 - i * 100, t);
    osc.frequency.exponentialRampToValueAtTime(300 - i * 80, t + 0.15);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.18);
  }
}

function playGold(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  // Two bright chimes.
  [1046.5, 1568].forEach((freq, i) => {
    const t = now + i * 0.05;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.04, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.18);
  });
}

/* ------------------------------------------------------------------ */
/*  Noise helper                                                       */
/* ------------------------------------------------------------------ */

function makeNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export const sfx = { play };
