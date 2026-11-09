// src/audio/AudioManager.ts
// Web Audio API singleton. Manages master + music + sfx gain buses,
// autoplay policy unlocking, and mute/volume from game settings.
// No audio files — sounds are generated procedurally by ambient.ts / sfx.ts.

import { AUDIO } from '../constants/game';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AudioBusLevels {
  master: number;
  music: number;
  sfx: number;
}

type Listener = () => void;

/* ------------------------------------------------------------------ */
/*  Manager                                                            */
/* ------------------------------------------------------------------ */

class AudioManagerImpl {
  /** The AudioContext. Lazy-created on first user gesture. */
  private ctx: AudioContext | null = null;
  /** Master gain node. */
  private masterGain: GainNode | null = null;
  /** Music bus gain node. */
  private musicGain: GainNode | null = null;
  /** SFX bus gain node. */
  private sfxGain: GainNode | null = null;
  /** Whether the context has been unlocked by a gesture. */
  private unlocked = false;
  /** Whether the manager is muted. */
  private muted = false;
  /** Master volume, 0..1. */
  private volume: number = AUDIO.DEFAULT_VOLUME;
  /** Whether init has been attempted. */
  private initialised = false;
  /** Subscribers that want to know when context state changes. */
  private listeners: Set<Listener> = new Set();

  /* ---------------------------------------------------------------- */
  /*  Initialization                                                  */
  /* ---------------------------------------------------------------- */

  /**
   * Initialize the AudioContext. Must be called from a user gesture
   * (click, keypress) or the browser will suspend the context.
   * Idempotent — safe to call multiple times.
   */
  init(): void {
    if (this.initialised) return;
    if (typeof window === 'undefined') return;

    const Ctor: typeof AudioContext | undefined =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return; // No Web Audio support — silently degrade.

    try {
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Apply initial gains.
      this.masterGain.gain.value = this.muted ? 0 : this.volume * AUDIO.MASTER_GAIN;
      this.musicGain.gain.value = 0.6; // relative to master
      this.sfxGain.gain.value = AUDIO.SFX_VOLUME;

      this.initialised = true;
      this.attachGestureUnlock();

      if (this.ctx.state === 'running') {
        this.unlocked = true;
        this.emit();
      }
    } catch (err) {
      // Browsers can throw if audio is not allowed; degrade gracefully.
      // eslint-disable-next-line no-console
      console.warn('[audio] failed to initialise AudioContext', err);
    }
  }

  /** Attach listeners to unlock the context on first gesture. */
  private attachGestureUnlock(): void {
    if (typeof window === 'undefined') return;
    const tryUnlock = () => {
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          this.unlocked = this.ctx?.state === 'running';
          this.emit();
        }).catch(() => {});
      } else if (this.ctx.state === 'running') {
        this.unlocked = true;
        this.emit();
      }
    };

    // Use `{ once: false }` so it keeps trying until it succeeds.
    // Once unlocked, detach via a flag.
    const guardedUnlock = () => {
      if (this.unlocked) return;
      tryUnlock();
    };

    window.addEventListener('pointerdown', guardedUnlock, { passive: true });
    window.addEventListener('keydown', guardedUnlock);
    window.addEventListener('touchstart', guardedUnlock, { passive: true });
  }

  /* ---------------------------------------------------------------- */
  /*  State                                                           */
  /* ---------------------------------------------------------------- */

  get isUnlocked(): boolean {
    return this.unlocked;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  get currentVolume(): number {
    return this.volume;
  }

  get context(): AudioContext | null {
    return this.ctx;
  }

  get buses(): { master: GainNode | null; music: GainNode | null; sfx: GainNode | null } {
    return {
      master: this.masterGain,
      music: this.musicGain,
      sfx: this.sfxGain,
    };
  }

  /* ---------------------------------------------------------------- */
  /*  Control                                                         */
  /* ---------------------------------------------------------------- */

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.applyVolume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyVolume();
  }

  setMusicVolume(level: number): void {
    if (!this.musicGain || !this.ctx) return;
    const v = Math.max(0, Math.min(1, level));
    this.musicGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
  }

  setSfxVolume(level: number): void {
    if (!this.sfxGain || !this.ctx) return;
    const v = Math.max(0, Math.min(1, level));
    this.sfxGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  private applyVolume(): void {
    if (!this.masterGain || !this.ctx) return;
    const target = this.muted ? 0 : this.volume * AUDIO.MASTER_GAIN;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
  }

  /* ---------------------------------------------------------------- */
  /*  Subscription                                                    */
  /* ---------------------------------------------------------------- */

  /** Register a listener for state changes (unlock, mute, volume). */
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    for (const fn of this.listeners) {
      try {
        fn();
      } catch {
        // ignore listener errors
      }
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Lifecycle                                                       */
  /* ---------------------------------------------------------------- */

  /** Suspend the context (used when tab hidden). */
  suspend(): void {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  /** Resume the context. */
  resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /** Fully tear down the audio context. */
  dispose(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
    }
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.initialised = false;
    this.unlocked = false;
    this.emit();
  }
}

/* ------------------------------------------------------------------ */
/*  Singleton                                                          */
/* ------------------------------------------------------------------ */

export const audioManager = new AudioManagerImpl();

/* ------------------------------------------------------------------ */
/*  Pause on tab blur / resume on focus                                */
/* ------------------------------------------------------------------ */

if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      audioManager.suspend();
    } else {
      audioManager.resume();
    }
  });
}