import type { StoryEvent } from '../types/game';
import { EVENT_TEMPLATES } from '../data/content';
import { mulberry32 } from './rng';

export function generateEvent(seed: number): StoryEvent {
  const r = mulberry32(seed);
  const tpl = EVENT_TEMPLATES[Math.floor(r() * EVENT_TEMPLATES.length)];
  return { ...tpl, id: `${tpl.id}_${Math.floor(r() * 1e6)}` };
}