import { desc, isNull } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { sessions } from '@/db/schema';
import type { ActiveSessionView } from '@/types/session';

export function useActiveSession(): ActiveSessionView | null {
  const { data } = useLiveQuery(
    db
      .select()
      .from(sessions)
      .where(isNull(sessions.endedAt))
      .orderBy(desc(sessions.parkedAt))
      .limit(1),
  );
  const row = data?.[0];
  if (!row) return null;
  return {
    id: row.id,
    parkedAt: row.parkedAt,
    expiresAt: row.expiresAt ?? null,
    latitude: row.latitude,
    longitude: row.longitude,
    accuracyM: row.accuracyM ?? null,
    note: row.note ?? null,
    photoLocalUri: row.photoLocalUri ?? null,
    voiceLocalUri: row.voiceLocalUri ?? null,
    voiceDurationSec: row.voiceDurationSec ?? null,
  };
}
