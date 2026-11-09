// src/data/questChains.ts
// Multi-stage storyline quest chains with branching player choices and rewards.

export interface QuestStageChoice {
  id: string;
  label: string;
  outcomeText: string;
  nextStageId?: string;
  flags?: string[];
  reward?: { xp?: number; gold?: number };
}

export interface QuestStage {
  id: string;
  title: string;
  narrative: string;
  choices: QuestStageChoice[];
}

export interface QuestChain {
  id: string;
  title: string;
  tagline: string;
  description: string;
  faction: string;
  stages: QuestStage[];
  reward: { xp: number; gold: number; title: string };
}

export const QUEST_CHAINS: QuestChain[] = [
  {
    id: 'chain_crown',
    title: "The King's Shadow",
    tagline: 'Investigate the resurgence of the royal guard in the sunken ruins.',
    description: 'Ancient royal scouts have been sighted wandering the perimeter of the Sunken Citadel. The High Chancellor seeks an emissary to unveil their orders.',
    faction: 'Crown',
    stages: [
      {
        id: 'stage_1',
        title: 'Stage I: The Royal Beacon',
        narrative: 'You arrive at the edge of the Sunken Citadel. An ancient royal brazier smolders with cold purple flame. A lone armored scout blocks the bridge, sword drawn.',
        choices: [
          {
            id: 'c_parley',
            label: 'Present royal credentials and request audience',
            outcomeText: 'The scout lowers his blade slightly, recognizing the royal insignia.',
            nextStageId: 'stage_2',
            reward: { xp: 50 },
          },
          {
            id: 'c_strike',
            label: 'Draw weapon and breach the gate by force',
            outcomeText: 'You parry the scout aside and force your way through the arched gate.',
            nextStageId: 'stage_2',
            reward: { xp: 75, gold: 20 },
          },
        ],
      },
      {
        id: 'stage_2',
        title: 'Stage II: The Sunken Vault',
        narrative: 'Deep within the vault, the Tomb of the Undying Warden glows with runic light. The warden awakens, whispering questions of loyalty to the true realm.',
        choices: [
          {
            id: 'c_swear',
            label: 'Swear allegiance to restore the crown',
            outcomeText: 'The warden blesses your sword with ancient royal authority.',
            reward: { xp: 150, gold: 80 },
          },
          {
            id: 'c_cleanse',
            label: 'Cleanse the tomb to free the trapped souls',
            outcomeText: 'The ghostly knight dissolves into pure light, leaving behind a relic.',
            reward: { xp: 180, gold: 60 },
          },
        ],
      },
    ],
    reward: { xp: 250, gold: 120, title: 'Champion of the Crown' },
  },
  {
    id: 'chain_faith',
    title: 'Whispers of the Old Woods',
    tagline: 'Cleanse the corrupted heart of the Great Redwood.',
    description: 'The ancient druids speak of a foul rot consuming the roots of the ancestral redwood tree. Dark beasts now drink from its blighted sap.',
    faction: 'Old Faith',
    stages: [
      {
        id: 'stage_1',
        title: 'Stage I: The Blighted Grove',
        narrative: 'Twisted brambles and thorny vines choke the forest path. A wounded forest dryad begs you to collect pure spring water from the high ridge.',
        choices: [
          {
            id: 'c_spring',
            label: 'Scale the ridge to fetch pure spring water',
            outcomeText: 'You return with pure crystal spring water, easing the dryad’s wounds.',
            nextStageId: 'stage_2',
            reward: { xp: 60 },
          },
          {
            id: 'c_burn',
            label: 'Burn the blighted brambles with torch fire',
            outcomeText: 'Fire consumes the rot, revealing the subterranean root cavern.',
            nextStageId: 'stage_2',
            reward: { xp: 60 },
          },
        ],
      },
      {
        id: 'stage_2',
        title: 'Stage II: The Root Heart',
        narrative: 'At the core of the ancient redwood sits a corrupted demon parasite pulsating with shadow energy.',
        choices: [
          {
            id: 'c_sever',
            label: 'Sever the parasite with blessed steel',
            outcomeText: 'The corruption withers away, restoring green luminescence to the woods.',
            reward: { xp: 160, gold: 75 },
          },
        ],
      },
    ],
    reward: { xp: 220, gold: 100, title: 'Guardian of the Grove' },
  },
];

export const CHAIN_REGISTRY: Record<string, QuestChain> = {};
for (const c of QUEST_CHAINS) {
  CHAIN_REGISTRY[c.id] = c;
}

export function getChain(id: string) {
  return CHAIN_REGISTRY[id];
}

export function availableChains(level: number, type: string) {
  return QUEST_CHAINS;
}

export function chainStageCount(chain: QuestChain) {
  return chain.stages.length;
}
