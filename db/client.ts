import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

const sqlite = openDatabaseSync('parkspot.db', { enableChangeListener: true });

sqlite.execSync('PRAGMA journal_mode = WAL;');
sqlite.execSync('PRAGMA foreign_keys = ON;');

// A simple key/value table for app preferences. Created outside of the
// Drizzle migration system so it's available from module-load time, before
// `useMigrations()` has had a chance to run. This lets our zustand stores
// hydrate synchronously without an MMKV-style native dependency.
sqlite.execSync(
  'CREATE TABLE IF NOT EXISTS preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);',
);

export const db = drizzle(sqlite, { schema });
export const rawDb = sqlite;
export { schema };
