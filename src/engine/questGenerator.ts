// src/engine/questGenerator.ts
export function generateTemplateQuest() {
  return null;
}

export function generateQuestBatch() {
  return [];
}

export function selectChain() {
  return null;
}

export function buildChainQuest() {
  return {};
}

export function startChain(c: any = {}) {
  return { progress: {}, quest: {} };
}

export function advanceChain(c: any = {}, p: any = {}) {
  return { progress: p, nextQuest: null };
}

export function updateQuestProgress() {
  return [];
}

export function chainById() {
  return undefined;
}

export function allChainIds() {
  return [];
}

export type ChainProgress = any;
