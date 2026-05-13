import { desc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { APP_CONFIG } from '@/constants/config';
import { db } from '@/db/client';
import { sessions } from '@/db/schema';
import type { SessionRow } from '@/db/schema';

export function useRecentSessions(): SessionRow[] {
  const { data } = useLiveQuery(
    db.select().from(sessions).orderBy(desc(sessions.parkedAt)).limit(APP_CONFIG.historyPageSize),
  );
  return data ?? [];
}
