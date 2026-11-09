// src/engine/reputationSystem.ts
import type { FactionId, StandingTier } from '../types/game';

export type ReputationMap = Record<FactionId, number>;

export function getStandingTier(rep: number): StandingTier {
  if (rep <= -50) return 'Hostile';
  if (rep <= -10) return 'Unfriendly';
  if (rep < 30) return 'Neutral';
  if (rep < 70) return 'Friendly';
  return 'Allied';
}

export function applyReputationBatch(
  current: ReputationMap,
  deltas: Partial<Record<FactionId, number>>
): { reputation: ReputationMap; messages: string[] } {
  const next: ReputationMap = { ...current };
  const messages: string[] = [];

  for (const [id, delta] of Object.entries(deltas)) {
    const fId = id as FactionId;
    const prev = next[fId] || 0;
    const updated = Math.max(-100, Math.min(100, prev + (delta || 0)));
    next[fId] = updated;

    if (delta && delta > 0) {
      messages.push(`Reputation with ${fId} increased (+${delta}).`);
    } else if (delta && delta < 0) {
      messages.push(`Reputation with ${fId} decreased (${delta}).`);
    }
  }

  return { reputation: next, messages };
}
