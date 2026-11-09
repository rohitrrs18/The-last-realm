// src/engine/explorationSystem.ts
import type { Location, MonsterType } from '../types/game';

export interface TravelOutcome {
  kind: 'quiet' | 'ambush' | 'discovery';
  narrative: string;
  title: string;
  monsterType?: MonsterType;
}

export function rollTravel(
  from: Location,
  to: Location,
  level = 1,
  seed = Date.now()
): TravelOutcome {
  if (to.dangerLevel === 'Deadly' || (to.dangerLevel === 'High' && Math.random() < 0.35)) {
    return {
      kind: 'ambush',
      narrative: 'A savage predator leaps from the shadows along the road!',
      title: 'Roadside Ambush',
      monsterType: 'Beast',
    };
  }
  return {
    kind: 'quiet',
    narrative: `You make the trek across ${to.region} to reach ${to.name}.`,
    title: 'Peaceful Journey',
  };
}

export function travelHours(): number {
  return 1;
}

export function travelHeader(): string {
  return 'Travel';
}

export function difficultyMultiplier(l: number): number {
  return 1;
}
