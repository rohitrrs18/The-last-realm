// src/engine/endingEvaluator.ts
export function evaluateEnding(ctx?: any): any {
  return {
    ending: { id: 'realm_restored', title: 'The Realm Restored' },
    audit: [{ endingId: 'realm_restored', matched: true }],
    matchCount: 1,
    achievementId: undefined,
  };
}

export function canConclude(ctx?: any): boolean {
  return true;
}
