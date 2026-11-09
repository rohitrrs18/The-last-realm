// src/engine/decisionResolver.ts
import type { Character } from '../types/game';

export interface Decision {
  id: string;
  label: string;
  outcome: string;
}

export function resolveDecision(decision: any, char: Character) {
  return { character: char, effects: [] };
}
