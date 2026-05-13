// Synchronous key-value store backed by the same SQLite database that
// powers the parking sessions. Used as a drop-in replacement for MMKV so
// we don't pull in extra native modules (which previously required
// react-native-nitro-modules and broke autolinking on existing dev clients).

import { rawDb } from '@/db/client';

interface PrefRow {
  value: string;
}

export function getPreference(key: string): string | null {
  const row = rawDb.getFirstSync<PrefRow>(
    'SELECT value FROM preferences WHERE key = ?',
    key,
  );
  return row?.value ?? null;
}

export function setPreference(key: string, value: string): void {
  rawDb.runSync(
    'INSERT INTO preferences (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}

export function deletePreference(key: string): void {
  rawDb.runSync('DELETE FROM preferences WHERE key = ?', key);
}

export function getJsonPreference<T>(key: string, fallback: T): T {
  const raw = getPreference(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJsonPreference<T>(key: string, value: T): void {
  setPreference(key, JSON.stringify(value));
}
