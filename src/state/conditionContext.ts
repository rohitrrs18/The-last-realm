// src/state/conditionContext.ts
import type { GameState, FactionId, OutcomeKind } from '../types/game';
import type { GameConditionContext } from '../engine/conditionEvaluator';

export function buildConditionContext(state: GameState): GameConditionContext {
  return {
    character: state.character!,
    flags: new Set(Object.keys(state.flags).filter((k) => state.flags[k])),
    factionReputation: state.factionReputation as Record<FactionId, number>,
    npcRelationships: Object.fromEntries((state.npcs || []).map((n) => [n.id, n.relationship])),
    activeQuestIds: new Set((state.quests || []).filter((q) => q.status === 'active').map((q) => q.id)),
    completedQuestIds: new Set((state.quests || []).filter((q) => q.status === 'completed').map((q) => q.id)),
    completedChainIds: new Set((state.chainProgress || []).filter((cp) => cp.finished).map((cp) => cp.chainId)),
    decisionCount: state.decisionHistory?.length || 0,
    outcomesRecorded: new Set((state.decisionHistory || []).map((d) => d.outcome).filter((o): o is OutcomeKind => !!o)),
    counters: Object.fromEntries(Object.entries(state.achievementProgress || {}).map(([k, v]: any) => [k, v.current])),
  };
}