// src/engine/questSystem.ts
import type { Quest, Character, ChainProgress } from '../types/game';

export interface QuestSystemState {
  quests: Quest[];
  chainProgress: ChainProgress[];
  completedCount: number;
  chainsCompletedCount: number;
}

export function initQuestSystem(
  level = 1,
  locationType = 'village',
  seed = Date.now()
): QuestSystemState {
  const initialQuests: Quest[] = [
    {
      id: 'q_first_hunt',
      title: 'Scouting the Outskirts',
      description: 'The local elder requests that you patrol the nearby ridge and eliminate encroaching beasts.',
      category: 'main',
      status: 'active',
      objectives: [
        { id: 'obj_1', text: 'Venture into the wilds and defeat a predator', done: false },
        { id: 'obj_2', text: 'Report back to the village watchman', done: false },
      ],
      reward: { xp: 120, gold: 40 },
    },
    {
      id: 'q_forge_steel',
      title: 'The Blacksmith’s Favor',
      description: 'Visit the local smithy to inspect armor crafting recipes.',
      category: 'side',
      status: 'active',
      objectives: [{ id: 'obj_forge', text: 'Converse with the blacksmith or forge an item', done: false }],
      reward: { xp: 80, gold: 25 },
    },
  ];

  return {
    quests: initialQuests,
    chainProgress: [
      {
        chainId: 'chain_crown',
        stageId: 'stage_1',
        flags: [],
        stagesCompleted: 0,
        finished: false,
      },
    ],
    completedCount: 0,
    chainsCompletedCount: 0,
  };
}

export function applyQuestEvent(state: any, event: any): any {
  return { state, completed: [] };
}

export function grantQuestRewards(c: Character, q: Quest, seed?: number): any {
  return {
    character: { ...c, xp: c.xp + q.reward.xp, gold: c.gold + q.reward.gold },
    itemAwarded: null,
    levelSummary: null,
    messages: [`Completed: ${q.title}! (+${q.reward.xp} XP, +${q.reward.gold}g)`],
  };
}

export function addTemplateQuest(state: any, level?: number, locType?: string, seed?: number): any {
  return { state, quest: null };
}

export function tryAddChain(state: any, level?: number, locType?: string, seed?: number): any {
  return { state, chain: null };
}

export function advanceChainStage(chainId?: string, choiceId?: string, state?: any): any {
  return { state: { quests: [], chainProgress: [] }, nextQuest: null, chainCompleted: false };
}

export function journalSnapshot(state: any): any {
  return {};
}
