// src/audio/ambient.ts
// Procedural ambient music. Synthesizes drones with oscillators + noise
// per location type. No audio files — everything is generated live.

import { audioManager } from './AudioManager';

/* ------------------------------------------------------------------ */
/*  Location palettes                                                  */
/* ------------------------------------------------------------------ */

type LocationTone =
  | 'forest'
  | 'ruins'
  | 'cave'
  | 'mountain'
  | 'dungeon'
  | 'castle'
  | 'village'
  | 'lake'
  | 'combat';

interface Palette {
  /** Base drone frequencies (Hz). */
  droneHz: number[];
  /** Filter cutoff for the drone. */
  droneCutoff: number;
  /** Noise type and volume. */
  noiseType: BiquadFilterType;
  noiseCutoff: number;
  noiseGain: number;
  /** Overall bus gain for this palette. */
  masterLevel: number;
  /** Slow LFO rate (Hz) for movement. */
  lfoRate: number;
  /** Optional bell/pulse rate (Hz), 0 = off. */
  pulseRate?: number;
}

const PALETTES: Record<LocationTone, Palette> = {
  forest: {
    droneHz: [110, 165, 220],   // A minor-ish open fifth
    droneCutoff: 800,
    noiseType: 'bandpass',
    noiseCutoff: 2200,
    noiseGain: 0.04,
    masterLevel: 0.35,
    lfoRate: 0.06,
    pulseRate: 0.3,
  },
  ruins: {
    droneHz: [98, 147, 196],     // D minor
    droneCutoff: 600,
    noiseType: 'lowpass',
    noiseCutoff: 900,
    noiseGain: 0.05,
    masterLevel: 0.32,
    lfoRate: 0.04,
  },
  cave: {
    droneHz: [65, 98, 130],      // low C2-ish
    droneCutoff: 500,
    noiseType: 'lowpass',
    noiseCutoff: 400,
    noiseGain: 0.06,
    masterLevel: 0.34,
    lfoRate: 0.03,
  },
  mountain: {
    droneHz: [82, 123, 164],     // E minor
    droneCutoff: 900,
    noiseType: 'highpass',
    noiseCutoff: 600,
    noiseGain: 0.07,
    masterLevel: 0.36,
    lfoRate: 0.05,
  },
  dungeon: {
    droneHz: [55, 82, 110],      // deep A
    droneCutoff: 450,
    noiseType: 'lowpass',
    noiseCutoff: 300,
    noiseGain: 0.08,
    masterLevel: 0.30,
    lfoRate: 0.02,
  },
  castle: {
    droneHz: [98, 147, 220],     // D minor with added A
    droneCutoff: 700,
    noiseType: 'bandpass',
    noiseCutoff: 1200,
    noiseGain: 0.04,
    masterLevel: 0.32,
    lfoRate: 0.045,
    pulseRate: 0.5,
  },
  village: {
    droneHz: [130, 196, 262],    // C major warmth
    droneCutoff: 1100,
    noiseType: 'bandpass',
    noiseCutoff: 1800,
    noiseGain: 0.03,
    masterLevel: 0.34,
    lfoRate: 0.07,
    pulseRate: 0.4,
  },
  lake: {
    droneHz: [116, 174, 233],    // B-flat major-ish
    droneCutoff: 1000,
    noiseType: 'highpass',
    noiseCutoff: 800,
    noiseGain: 0.05,
    masterLevel: 0.33,
    lfoRate: 0.05,
  },
  combat: {
    droneHz: [73, 110, 146],     // D minor, tense
    droneCutoff: 1200,
    noiseType: 'lowpass',
    noiseCutoff: 700,
    noiseGain: 0.05,
    masterLevel: 0.38,
    lfoRate: 0.15,
    pulseRate: 1.0,
  },
};

/* ------------------------------------------------------------------ */
/*  Active ambient state                                               */
/* ------------------------------------------------------------------ */

interface ActiveAmbient {
  oscs: OscillatorNode[];
  droneGains: GainNode[];
  noiseSource: AudioBufferSourceNode | null;
  noiseFilter: BiquadFilterNode | null;
  noiseGainNode: GainNode | null;
  lfo: OscillatorNode | null;
  lfoGain: GainNode | null;
  pulseTimer: number | null;
  palette: Palette;
  tone: LocationTone;
}

class AmbientPlayerImpl {
  private active: ActiveAmbient | null = null;
  private currentTone: LocationTone | null = null;
  private fadeMs = 1500;

  /* ---------------------------------------------------------------- */
  /*  Public API                                                      */
  /* ---------------------------------------------------------------- */

  play(tone: LocationTone): void {
    if (this.currentTone === tone) return;
    audioManager.init();
    if (!audioManager.isUnlocked) {
      // Defer until unlocked.
      const unsubscribe = audioManager.subscribe(() => {
        if (audioManager.isUnlocked) {
          unsubscribe();
          this.play(tone);
        }
      });
      return;
    }

    const buses = audioManager.buses;
    const ctx = audioManager.context;
    if (!ctx || !buses.music) return;

    // Fade out the current ambient.
    if (this.active) this.fadeOutActive();

    this.currentTone = tone;
    const palette = PALETTES[tone];

    const oscs: OscillatorNode[] = [];
    const droneGains: GainNode[] = [];

    for (let i = 0; i < palette.droneHz.length; i++) {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : i === 1 ? 'triangle' : 'sine';
      osc.frequency.value = palette.droneHz[i];

      const gain = ctx.createGain();
      gain.gain.value = 0; // fade in
      const targetLevel = (i === 0 ? 0.45 : 0.22) / palette.droneHz.length;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = palette.droneCutoff;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(buses.music);

      // Slow fade-in.
      const now = ctx.currentTime;
      gain.gain.linearRampToValueAtTime(targetLevel, now + this.fadeMs / 1000);

      osc.start();
      oscs.push(osc);
      droneGains.push(gain);
    }

    // --- Noise bed ------------------------------------------------
    let noiseSource: AudioBufferSourceNode | null = null;
    let noiseFilter: BiquadFilterNode | null = null;
    let noiseGainNode: GainNode | null = null;

    if (palette.noiseGain > 0) {
      const buffer = createNoiseBuffer(ctx, 4); // 4 seconds, loops
      noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = palette.noiseType;
      noiseFilter.frequency.value = palette.noiseCutoff;
      noiseFilter.Q.value = 0.7;

      noiseGainNode = ctx.createGain();
      noiseGainNode.gain.value = 0;
      const now = ctx.currentTime;
      noiseGainNode.gain.linearRampToValueAtTime(
        palette.noiseGain,
        now + this.fadeMs / 1000
      );

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGainNode);
      noiseGainNode.connect(buses.music);
      noiseSource.start();
    }

    // --- LFO on the master music bus -------------------------------
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = palette.lfoRate;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(buses.music.gain);
    lfo.start();

    // --- Optional pulse (gentle ticks) -----------------------------
    let pulseTimer: number | null = null;
    if (palette.pulseRate && palette.pulseRate > 0) {
      const intervalMs = (1 / palette.pulseRate) * 1000;
      pulseTimer = window.setInterval(() => {
        this.playPulse(palette, buses.music!);
      }, intervalMs);
    }

    this.active = {
      oscs,
      droneGains,
      noiseSource,
      noiseFilter,
      noiseGainNode,
      lfo,
      lfoGain,
      pulseTimer,
      palette,
      tone,
    };
  }

  stop(): void {
    this.fadeOutActive();
    this.currentTone = null;
  }

  /** Called when combat begins — temporarily swaps in the combat palette. */
  enterCombat(): void {
    this.play('combat');
  }

  /** Called when combat ends — returns to the location palette. */
  returnFromCombat(locationTone: LocationTone): void {
    this.play(locationTone);
  }

  setFadeMs(ms: number): void {
    this.fadeMs = ms;
  }

  /* ---------------------------------------------------------------- */
  /*  Internal                                                        */
  /* ---------------------------------------------------------------- */

  private fadeOutActive(): void {
    const ctx = audioManager.context;
    if (!ctx || !this.active) return;
    const active = this.active;
    const now = ctx.currentTime;
    const fadeSec = this.fadeMs / 1000;

    for (const g of active.droneGains) {
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, now + fadeSec);
      } catch {}
    }
    if (active.noiseGainNode) {
      try {
        active.noiseGainNode.gain.cancelScheduledValues(now);
        active.noiseGainNode.gain.setValueAtTime(active.noiseGainNode.gain.value, now);
        active.noiseGainNode.gain.linearRampToValueAtTime(0, now + fadeSec);
      } catch {}
    }

    // Stop oscillators after fade.
    const stopAt = now + fadeSec + 0.05;
    for (const osc of active.oscs) {
      try { osc.stop(stopAt); } catch {}
    }
    if (active.noiseSource) {
      try { active.noiseSource.stop(stopAt); } catch {}
    }
    if (active.lfo) {
      try { active.lfo.stop(stopAt); } catch {}
    }
    if (active.pulseTimer !== null) {
      window.clearInterval(active.pulseTimer);
    }

    this.active = null;
  }

  private playPulse(palette: Palette, destination: AudioNode): void {
    const ctx = audioManager.context;
    if (!ctx) return;

    const now = ctx.currentTime;
    const freq = palette.droneHz[palette.droneHz.length - 1] * 2;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.04, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    osc.connect(gain);
    gain.connect(destination);
    osc.start();
    osc.stop(now + 1.0);
  }
}

/* ------------------------------------------------------------------ */
/*  Noise generator                                                    */
/* ------------------------------------------------------------------ */

function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // Pink-ish noise (filtered random) — warmer than pure white noise.
  let lastOut = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = 0.98 * lastOut + 0.02 * white;
    data[i] = lastOut * 3.5;
  }
  return buffer;
}

/* ------------------------------------------------------------------ */
/*  Location → palette adapter                                         */
/* ------------------------------------------------------------------ */

/**
 * Given a location type string, return the matching ambient palette tone.
 * Unknown types fall back to 'village'.
 */
export function paletteForLocation(locationType: string): LocationTone {
  switch (locationType) {
    case 'forest':
    case 'ruins':
    case 'cave':
    case 'mountain':
    case 'dungeon':
    case 'castle':
    case 'village':
    case 'lake':
      return locationType as LocationTone;
    default:
      return 'village';
  }
}

/* ------------------------------------------------------------------ */
/*  Singleton                                                          */
/* ------------------------------------------------------------------ */

export const ambientPlayer = new AmbientPlayerImpl();
export type { LocationTone };