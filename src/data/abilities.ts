export const ALL_ABILITIES: Record<string, any> = {};

export function getAbility(id: string) {
  return ALL_ABILITIES[id];
}

export function getAbilities(ids: string[]) {
  return ids.map((id) => ALL_ABILITIES[id]).filter(Boolean);
}

export function abilitiesForClass(className: string) {
  return [];
}

export function elementColor(element?: string): string {
  return 'text-ink2';
}