import type { GameState } from '../types/game';

const SAVE_KEY = 'tlr_saves_v1';
export const SAVE_VERSION = 1;

export interface SaveSlot {
  version: number;
  id: string;
  characterName: string;
  className: string;
  level: number;
  timestamp: number;
  state: Partial<GameState>;
}

export function listSaves(): SaveSlot[] {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s: any) => s && s.version === SAVE_VERSION);
  } catch { return []; }
}

export function saveGame(slotId: string | undefined, state: GameState): SaveSlot {
  const saves = listSaves();
  const char = state.character;
  if (!char) throw new Error('No character to save');
  
  const slot: SaveSlot = {
    version: SAVE_VERSION,
    id: slotId ?? `slot_${Date.now()}`,
    characterName: char.name,
    className: char.class,
    level: char.level,
    timestamp: Date.now(),
    state: {
      character: state.character,
      world: state.world,
      quests: state.quests,
      chainProgress: state.chainProgress,
      npcs: state.npcs,
      factionReputation: state.factionReputation,
      flags: state.flags,
      codex: state.codex,
      log: state.log,
      decisionHistory: state.decisionHistory,
      unlockedAchievements: state.unlockedAchievements,
      achievementProgress: state.achievementProgress,
      discoveredRecipes: state.discoveredRecipes,
      ending: state.ending,
      currentEvent: state.currentEvent,
      nextEventCounter: state.nextEventCounter,
    },
  };
  
  const others = saves.filter(s => s.id !== slot.id);
  localStorage.setItem(SAVE_KEY, JSON.stringify([slot, ...others].slice(0, 6)));
  return slot;
}

export function loadSave(id: string): SaveSlot | null {
  return listSaves().find(s => s.id === id) ?? null;
}

export function deleteSave(id: string) {
  const saves = listSaves().filter(s => s.id !== id);
  localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
}