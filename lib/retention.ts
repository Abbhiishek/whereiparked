import * as FileSystem from 'expo-file-system/legacy';

import { deleteSessionsBefore, listRecentSessions } from '@/db/queries/sessions';
import { createLogger } from '@/lib/logger';

const log = createLogger('retention');

export async function sweepRetention(retentionDays: number): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const recent = await listRecentSessions(1000);
  for (const row of recent) {
    if (row.parkedAt < cutoff) {
      await purgeSessionLocalFiles(row.id);
    }
  }

  const removed = await deleteSessionsBefore(cutoff);
  if (removed > 0) {
    log.info(`Removed ${removed} sessions older than ${retentionDays}d`);
  }
  return removed;
}

async function purgeSessionLocalFiles(sessionId: string): Promise<void> {
  const dir = `${FileSystem.documentDirectory}sessions/${sessionId}/`;
  try {
    const info = await FileSystem.getInfoAsync(dir);
    if (info.exists) {
      await FileSystem.deleteAsync(dir, { idempotent: true });
    }
  } catch (err) {
    log.warn('Failed to purge session files', err);
  }
}
