import { useGame } from '../state/gameStore';
import { saveGame } from './saveManager';

let timer: number | null = null;
let lastSnapshot = '';

export function startAutoSave() {
  useGame.subscribe((state) => {
    if (!state.character || state.combat) return;
    
    const snapshot = `${state.character.level}|${state.character.gold}|${state.world?.currentLocationId}|${state.quests.length}|${state.npcs.length}`;
    if (snapshot === lastSnapshot) return;
    lastSnapshot = snapshot;

    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      saveGame(undefined, useGame.getState());
    }, 3000);
  });
}

export function stopAutoSave() { if (timer) window.clearTimeout(timer); }
export function forceAutoSave() { saveGame(undefined, useGame.getState()); }
export function hasAnySave() { return listSaves().length > 0; }

import { listSaves } from './saveManager';