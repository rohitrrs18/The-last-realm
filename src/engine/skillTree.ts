// src/engine/skillTree.ts
// Skill tree engine: point spending, prerequisite checks, passive
// aggregation, and unlocked-ability resolution.

import type { ClassName, Ability } from '../types/game';
import {
  getSkillTree,
  getSkillNode,
  type SkillNode,
  type SkillTree,
} from '../data/skillTrees';
import { getAbility } from '../data/abilities';
import { SKILLS } from '../constants/game';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Player's allocated skill points: node id -> rank. */
export type SkillRanks = Record<string, number>;

/** Aggregated passive bonuses from all allocated nodes. */
export interface SkillBonuses {
  /** +% crit chance. */
  critBonus: number;
  /** +% damage. */
  damageBonus: number;
  /** +% defense. */
  defenseBonus: number;
  /** +% evasion. */
  evasionBonus: number;
  /** +% max mana regen per turn. */
  manaRegen: number;
  /** +% max hp regen per turn. */
  hpRegen: number;
  /** +% spell power. */
  spellPower: number;
  /** +% armor penetration. */
  armorPenetration: number;
  /** +% accuracy. */
  accuracyBonus: number;
  /** Flat max-HP bonus. */
  maxHp: number;
  /** Flat max-mana bonus. */
  maxMana: number;
  /** Flat stat bonuses. */
  strength: number;
  agility: number;
  intellect: number;
  vitality: number;
  luck: number;
}

export const EMPTY_BONUSES: SkillBonuses = {
  critBonus: 0,
  damageBonus: 0,
  defenseBonus: 0,
  evasionBonus: 0,
  manaRegen: 0,
  hpRegen: 0,
  spellPower: 0,
  armorPenetration: 0,
  accuracyBonus: 0,
  maxHp: 0,
  maxMana: 0,
  strength: 0,
  agility: 0,
  intellect: 0,
  vitality: 0,
  luck: 0,
};

/* ------------------------------------------------------------------ */
/*  Point spending                                                     */
/* ------------------------------------------------------------------ */

/** Total skill points spent. */
export function spentPoints(ranks: SkillRanks): number {
  return Object.values(ranks).reduce((s, v) => s + v, 0);
}

/** Whether a node is currently unlocked (rank >= 1). */
export function isNodeUnlocked(ranks: SkillRanks, nodeId: string): boolean {
  return (ranks[nodeId] ?? 0) >= 1;
}

/** Current rank of a node. */
export function rankOf(ranks: SkillRanks, nodeId: string): number {
  return ranks[nodeId] ?? 0;
}

/** Can the player spend a point on this node right now? */
export function canUnlockNode(
  className: ClassName,
  nodeId: string,
  ranks: SkillRanks,
  playerLevel: number,
  skillPoints: number
): { ok: boolean; reason?: string } {
  const node = getSkillNode(className, nodeId);
  if (!node) return { ok: false, reason: 'Node not found' };

  const currentRank = rankOf(ranks, nodeId);
  if (currentRank >= node.maxRank) return { ok: false, reason: 'Already maxed' };

  if (playerLevel < node.levelRequires) {
    return { ok: false, reason: `Requires level ${node.levelRequires}` };
  }

  if (skillPoints < node.cost) {
    return { ok: false, reason: `Requires ${node.cost} skill points` };
  }

  // Check prerequisites
  for (const reqId of node.requires) {
    if (rankOf(ranks, reqId) < 1) {
      const reqNode = getSkillNode(className, reqId);
      return { ok: false, reason: `Requires ${reqNode?.name ?? reqId}` };
    }
  }

  return { ok: true };
}

/** Spend one rank on a node. Returns updated ranks (pure). */
export function spendPoint(
  className: ClassName,
  nodeId: string,
  ranks: SkillRanks,
  playerLevel: number,
  skillPoints: number
): { ranks: SkillRanks; skillPointsSpent: number; ok: boolean; reason?: string } {
  const check = canUnlockNode(className, nodeId, ranks, playerLevel, skillPoints);
  if (!check.ok) {
    return { ranks, skillPointsSpent: 0, ok: false, reason: check.reason };
  }
  const node = getSkillNode(className, nodeId)!;
  const current = rankOf(ranks, nodeId);
  return {
    ranks: { ...ranks, [nodeId]: current + 1 },
    skillPointsSpent: node.cost,
    ok: true,
  };
}

/* ------------------------------------------------------------------ */
/*  Passive aggregation                                                */
/* ------------------------------------------------------------------ */

/** Compute all aggregated passive bonuses from allocated ranks. */
export function computeBonuses(
  className: ClassName,
  ranks: SkillRanks
): SkillBonuses {
  const bonuses: SkillBonuses = { ...EMPTY_BONUSES };
  const tree = getSkillTree(className);

  for (const node of tree.nodes) {
    const rank = rankOf(ranks, node.id);
    if (rank === 0) continue;

    if (node.kind === 'passive' && node.passive) {
      const total = node.passive.perRank * rank;
      applyPassive(bonuses, node.passive.effect, total);
    } else if (node.kind === 'statBoost' && node.statPerRank) {
      const sp = node.statPerRank;
      if (sp.hp) bonuses.maxHp += sp.hp * rank;
      if (sp.mana) bonuses.maxMana += sp.mana * rank;
      if (sp.strength) bonuses.strength += sp.strength * rank;
      if (sp.agility) bonuses.agility += sp.agility * rank;
      if (sp.intellect) bonuses.intellect += sp.intellect * rank;
      if (sp.vitality) bonuses.vitality += sp.vitality * rank;
      if (sp.luck) bonuses.luck += sp.luck * rank;
    }
  }

  return bonuses;
}

function applyPassive(
  b: SkillBonuses,
  effect: NonNullable<SkillNode['passive']>['effect'],
  total: number
): void {
  switch (effect) {
    case 'critBonus': b.critBonus += total; break;
    case 'damageBonus': b.damageBonus += total; break;
    case 'defenseBonus': b.defenseBonus += total; break;
    case 'evasionBonus': b.evasionBonus += total; break;
    case 'manaRegen': b.manaRegen += total; break;
    case 'hpRegen': b.hpRegen += total; break;
    case 'spellPower': b.spellPower += total; break;
    case 'armorPenetration': b.armorPenetration += total; break;
    case 'accuracyBonus': b.accuracyBonus += total; break;
  }
}

/* ------------------------------------------------------------------ */
/*  Ability resolution                                                 */
/* ------------------------------------------------------------------ */

/** Get all abilities granted by the player's unlocked skill nodes. */
export function unlockedAbilities(
  className: ClassName,
  ranks: SkillRanks
): Ability[] {
  const out: Ability[] = [];
  const tree = getSkillTree(className);
  for (const node of tree.nodes) {
    if (node.kind !== 'ability' || !node.abilityId) continue;
    if (rankOf(ranks, node.id) < 1) continue;
    const ability = getAbility(node.abilityId);
    if (ability) out.push(ability);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Progress / display                                                 */
/* ------------------------------------------------------------------ */

/** How many nodes are unlocked. */
export function unlockedNodeCount(className: ClassName, ranks: SkillRanks): number {
  const tree = getSkillTree(className);
  return tree.nodes.filter((n) => rankOf(ranks, n.id) >= 1).length;
}

/** Total nodes in the class tree. */
export function totalNodeCount(className: ClassName): number {
  return getSkillTree(className).nodes.length;
}

/** Progress 0..1 of nodes unlocked. */
export function treeProgress(className: ClassName, ranks: SkillRanks): number {
  const total = totalNodeCount(className);
  if (total === 0) return 0;
  return unlockedNodeCount(className, ranks) / total;
}

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

/**
 * When loading a save, verify allocated ranks are valid for this class.
 * Any invalid ranks (unknown nodes, exceeded maxRank, broken prereqs) are
 * clamped down to safe values so the save remains playable.
 */
export function sanitizeRanks(
  className: ClassName,
  ranks: SkillRanks
): SkillRanks {
  const tree = getSkillTree(className);
  const nodeMap = new Map(tree.nodes.map((n) => [n.id, n]));
  const clean: SkillRanks = {};

  for (const [id, rank] of Object.entries(ranks)) {
    const node = nodeMap.get(id);
    if (!node) continue; // unknown node — drop
    if (rank <= 0) continue;
    clean[id] = Math.min(rank, node.maxRank);
  }

  // Drop nodes whose prerequisites are no longer satisfied.
  let changed = true;
  while (changed) {
    changed = false;
    for (const [id, _r] of Object.entries(clean)) {
      const node = nodeMap.get(id)!;
      for (const reqId of node.requires) {
        if ((clean[reqId] ?? 0) < 1) {
          delete clean[id];
          changed = true;
          break;
        }
      }
    }
  }

  return clean;
}

/* ------------------------------------------------------------------ */
/*  Skill points math                                                  */
/* ------------------------------------------------------------------ */

/** Skill points earned at a given level. */
export function skillPointsEarnedAtLevel(level: number): number {
  return Math.max(0, level - 1) * SKILLS_SKILL_POINTS_PER_LEVEL;
}

/** Skill points available after spending. */
export function skillPointsAvailable(
  level: number,
  ranks: SkillRanks,
  refunds = 0
): number {
  return skillPointsEarnedAtLevel(level) + refunds - spentPoints(ranks);
}

/* use a const to avoid the tree-shaking issue with dynamic import */
const SKILLS_SKILL_POINTS_PER_LEVEL = 1;

/* Re-export for convenience */
export type { SkillNode, SkillTree };
export { getSkillTree, getSkillNode };