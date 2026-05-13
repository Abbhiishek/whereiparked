import { useMigrations as useDrizzleMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { db } from './client';
import migrations from './migrations/migrations';

export function useMigrations(): { success: boolean; error: Error | undefined } {
  const state = useDrizzleMigrations(db, migrations);
  return { success: state.success, error: state.error };
}
