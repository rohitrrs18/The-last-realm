// src/engine/dialogueEngine.ts
import type { Npc } from '../types/game';

export function startDialogue(npc: Npc) {
  return { npc, currentNodeId: 'root', history: [] };
}

export function chooseDialogueOption(state: any, optionId: string) {
  return { ...state, currentNodeId: optionId };
}

export function currentDialogueNode(state: any) {
  return { id: 'root', text: state?.npc?.greeting || 'Hello traveler.', options: [] };
}

export function availableOptions(state: any) {
  return [];
}

export function isDialogueFinished(state: any) {
  return false;
}
