import { desc, isNotNull } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { sessions } from '@/db/schema';
import type { SessionRow } from '@/db/schema';

/**
 * Most recent session that has been ended. Returns null while loading or if
 * the user has never parked.
 */
export function useLastEndedSession(): SessionRow | null {
  const { data } = useLiveQuery(
    db
      .select()
      .from(sessions)
      .where(isNotNull(sessions.endedAt))
      .orderBy(desc(sessions.endedAt))
      .limit(1),
  );
  return data?.[0] ?? null;
}
