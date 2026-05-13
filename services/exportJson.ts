import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { listRecentSessions } from '@/db/queries/sessions';
import { createLogger } from '@/lib/logger';

const log = createLogger('export');

export async function exportSessionsAsJson(): Promise<void> {
  const rows = await listRecentSessions(1000);
  const payload = {
    exportedAt: new Date().toISOString(),
    sessions: rows.map((r) => ({
      id: r.id,
      parkedAt: r.parkedAt.toISOString(),
      endedAt: r.endedAt?.toISOString() ?? null,
      expiresAt: r.expiresAt?.toISOString() ?? null,
      latitude: r.latitude,
      longitude: r.longitude,
      accuracyM: r.accuracyM,
      note: r.note,
      voiceDurationSec: r.voiceDurationSec,
    })),
  };

  const uri = `${FileSystem.cacheDirectory}parkspot-export-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2));

  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/json',
        dialogTitle: 'ParkSpot data export',
      });
    } else {
      log.warn('Sharing not available on this device');
    }
  } catch (err) {
    log.error('Sharing failed', err);
  }
}
