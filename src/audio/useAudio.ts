// src/audio/useAudio.ts
// React hooks wiring audio to game state. Auto-swaps ambient music on
// location changes and combat, and syncs mute/volume from settings.
// Provides useSfx() for components to trigger sounds.

import { useEffect, useCallback } from 'react';
import { useGame } from '../state/gameStore';
import { audioManager } from './AudioManager';
import { ambientPlayer, paletteForLocation, type LocationTone } from './ambient';
import { sfx, type SfxName } from './sfx';

/* ------------------------------------------------------------------ */
/*  useAudio — main lifecycle hook                                     */
/* ------------------------------------------------------------------ */

/**
 * Mount once at the top of the game tree (e.g., in App or GameScreen).
 * Keeps audio in sync with:
 *   - Volume/mute settings
 *   - Current location ambient
 *   - Combat music
 *   - Browser gesture unlock
 */
export function useAudio(): void {
  const settings = useGame((s) => s.settings);
  const world = useGame((s) => s.world);
  const combat = useGame((s) => s.combat);
  const screen = useGame((s) => s.screen);

  /* --- Push settings into the audio manager ------------------------ */
  useEffect(() => {
    if (!settings) return;
    audioManager.setMuted(settings.muted);
    audioManager.setVolume(settings.volume);
  }, [settings?.muted, settings?.volume]);

  /* --- Initialize on first mount ----------------------------------- */
  useEffect(() => {
    audioManager.init();
    // Any user gesture should also kick off unlock.
    const unlockOnce = () => {
      audioManager.init();
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
    };
    window.addEventListener('pointerdown', unlockOnce);
    window.addEventListener('keydown', unlockOnce);
    return () => {
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
    };
  }, []);

  /* --- Stop music on menu / character creation --------------------- */
  useEffect(() => {
    if (screen === 'menu' || screen === 'create' || screen === 'settings') {
      ambientPlayer.stop();
    }
  }, [screen]);

  /* --- Ambient music follows the current location ------------------ */
  const currentLocationType = (() => {
    if (!world) return null;
    const loc = world.locations.find((l) => l.id === world.currentLocationId);
    return loc?.type ?? null;
  })();

  useEffect(() => {
    if (screen !== 'game') return;
    if (!currentLocationType) return;

    if (combat) {
      ambientPlayer.enterCombat();
    } else {
      const tone: LocationTone = paletteForLocation(currentLocationType);
      ambientPlayer.returnFromCombat(tone);
    }
  }, [screen, currentLocationType, combat]);

  /* --- Stop ambient when combat ends via menu, etc. ---------------- */
  useEffect(() => {
    return () => {
      ambientPlayer.stop();
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/*  useSfx — call a sound effect                                       */
/* ------------------------------------------------------------------ */

/**
 * Returns a stable callback for playing a sound effect.
 *
 * @example
 *   const playSfx = useSfx();
 *   <button onClick={() => { playSfx('ui-click'); doThing(); }}>Attack</button>
 */
export function useSfx(): (name: SfxName) => void {
  return useCallback((name: SfxName) => {
    sfx.play(name);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Convenience hooks for common sound groups                          */
/* ------------------------------------------------------------------ */

/** UI interaction sounds (click, hover, open, close). */
export function useUiSfx() {
  const play = useSfx();
  return {
    click: () => play('ui-click'),
    hover: () => play('ui-hover'),
    open: () => play('ui-open'),
    close: () => play('ui-close'),
    error: () => play('error-buzz'),
  };
}

/** Combat sounds (sword, magic, enemy hits). */
export function useCombatSfx() {
  const play = useSfx();
  return {
    swordHit: () => play('sword-hit'),
    swordCrit: () => play('sword-crit'),
    magicCast: () => play('magic-cast'),
    fire: () => play('fire-whoosh'),
    ice: () => play('ice-crack'),
    arrow: () => play('arrow-shot'),
    enemyHit: () => play('enemy-hit'),
    enemyDie: () => play('enemy-die'),
  };
}

/** Feedback sounds (level up, quest complete, achievement, gold). */
export function useFeedbackSfx() {
  const play = useSfx();
  return {
    levelUp: () => play('level-up'),
    questComplete: () => play('quest-complete'),
    achievement: () => play('achievement'),
    potionDrink: () => play('potion-drink'),
    goldPickup: () => play('gold-pickup'),
  };
}

/* ------------------------------------------------------------------ */
/*  Ambient control hook                                               */
/* ------------------------------------------------------------------ */

/**
 * Manually control ambient music. Usually unnecessary — useAudio handles
 * it automatically. Exposed for special cases (e.g., a scripted scene).
 */
export function useAmbientControl() {
  return {
    play: (tone: LocationTone) => ambientPlayer.play(tone),
    stop: () => ambientPlayer.stop(),
    enterCombat: () => ambientPlayer.enterCombat(),
    returnFromCombat: (tone: LocationTone) => ambientPlayer.returnFromCombat(tone),
  };
}