// src/persistence/migrations.ts
// Save version migration system. Applies sequential transformations to
// bring an old save up to the current version. Idempotent — safe to run
// on saves already at the current version.

import { SAVE } from '../constants/game';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface MigrationResult {
  /** Whether migration changed anything. */
  changed: boolean;
  /** The migrated save payload. */
  payload: any;
  /** Which migrations ran (from version → to version). */
  applied: string[];
  /** Migration errors that couldn't be resolved. */
  errors: string[];
  /** Final version. */
  finalVersion: number;
}

type MigrationFn = (save: any) => any;

interface Migration {
  from: number;
  to: number;
  description: string;
  migrate: MigrationFn;
}

/* ------------------------------------------------------------------ */
/*  Migration registry                                                 */
/* ------------------------------------------------------------------ */

/**
 * Add new migrations as the save schema evolves. Each migration transforms
 * a save from version `from` to version `to`. Migrations run sequentially.
 *
 * Example future migration:
 *   {
 *     from: 1,
 *     to: 2,
 *     description: 'Add worldSeed and difficulty settings',
 *     migrate: (save) => ({ ...save, state: { ...save.state, worldSeed: 0 } }),
 *   }
 */
const MIGRATIONS: Migration[] = [
  // No migrations yet — version 1 is the initial schema.
];

/* ------------------------------------------------------------------ */
/*  Apply migrations                                                   */
/* ------------------------------------------------------------------ */

/**
 * Migrate a save payload from its current version up to SAVE.VERSION.
 * Safe on already-current saves (returns unchanged).
 */
export function migrateSave(raw: any): MigrationResult {
  if (!raw || typeof raw !== 'object') {
    return {
      changed: false,
      payload: raw,
      applied: [],
      errors: ['Save payload is not an object'],
      finalVersion: 0,
    };
  }

  let payload = { ...raw };
  const applied: string[] = [];
  const errors: string[] = [];

  let currentVersion = typeof payload.version === 'number' ? payload.version : 1;

  // Sanity: if version is newer than supported, don't try to downgrade.
  if (currentVersion > SAVE.VERSION) {
    return {
      changed: false,
      payload,
      applied: [],
      errors: [
        `Save is from a newer version (${currentVersion}) than supported (${SAVE.VERSION})`,
      ],
      finalVersion: currentVersion,
    };
  }

  // Apply each migration in order.
  const sortedMigrations = [...MIGRATIONS].sort((a, b) => a.from - b.from);

  for (const migration of sortedMigrations) {
    if (currentVersion < migration.from) continue;
    if (currentVersion >= migration.to) continue;

    try {
      const before = payload;
      const after = migration.migrate(payload);
      if (after !== before) {
        applied.push(`v${migration.from} → v${migration.to}: ${migration.description}`);
        payload = after;
      }
      payload.version = migration.to;
      currentVersion = migration.to;
    } catch (err) {
      errors.push(
        `Migration v${migration.from} → v${migration.to} failed: ${(err as Error).message}`
      );
      break;
    }
  }

  return {
    changed: applied.length > 0,
    payload,
    applied,
    errors,
    finalVersion: currentVersion,
  };
}

/* ------------------------------------------------------------------ */
/*  Migration authoring helpers                                        */
/* ------------------------------------------------------------------ */

/** Ensure a field exists on the save's state. */
export function ensureStateField(save: any, key: string, defaultValue: any): any {
  if (!save.state) return save;
  if (save.state[key] !== undefined) return save;
  return {
    ...save,
    state: {
      ...save.state,
      [key]: defaultValue,
    },
  };
}

/** Ensure a field exists on a nested object within the save's state. */
export function ensureNestedField(
  save: any,
  parent: string,
  key: string,
  defaultValue: any
): any {
  if (!save.state || !save.state[parent]) return save;
  if (save.state[parent][key] !== undefined) return save;
  return {
    ...save,
    state: {
      ...save.state,
      [parent]: {
        ...save.state[parent],
        [key]: defaultValue,
      },
    },
  };
}

/** Rename a field on the save's state. */
export function renameStateField(save: any, oldKey: string, newKey: string): any {
  if (!save.state || save.state[oldKey] === undefined) return save;
  const next = { ...save.state };
  next[newKey] = next[oldKey];
  delete next[oldKey];
  return { ...save, state: next };
}

/* ------------------------------------------------------------------ */
/*  Introspection                                                      */
/* ------------------------------------------------------------------ */

/** All registered migrations with their version ranges. */
export function listMigrations(): Array<{
  from: number;
  to: number;
  description: string;
}> {
  return MIGRATIONS.map((m) => ({
    from: m.from,
    to: m.to,
    description: m.description,
  }));
}

/** Whether a save needs migration. */
export function needsMigration(save: any): boolean {
  if (!save || typeof save !== 'object') return false;
  const version = typeof save.version === 'number' ? save.version : 1;
  return version < SAVE.VERSION;
}

/** Current schema version. */
export function currentVersion(): number {
  return SAVE.VERSION;
}