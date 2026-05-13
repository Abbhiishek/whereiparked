import { desc, eq, isNull, sql } from 'drizzle-orm';

import { db } from '../client';
import { type NewSession, type SessionRow, sessions } from '../schema';

export async function insertSession(row: NewSession): Promise<SessionRow> {
  const [inserted] = await db.insert(sessions).values(row).returning();
  return inserted;
}

export async function getActiveSession(): Promise<SessionRow | null> {
  const result = await db
    .select()
    .from(sessions)
    .where(isNull(sessions.endedAt))
    .orderBy(desc(sessions.parkedAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getSessionById(id: string): Promise<SessionRow | null> {
  const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return result[0] ?? null;
}

export async function listRecentSessions(limit = 30): Promise<SessionRow[]> {
  return db.select().from(sessions).orderBy(desc(sessions.parkedAt)).limit(limit);
}

export async function markSessionEnded(id: string): Promise<SessionRow | null> {
  const now = new Date();
  const [updated] = await db
    .update(sessions)
    .set({
      endedAt: now,
      clientUpdatedAt: now,
    })
    .where(eq(sessions.id, id))
    .returning();
  return updated ?? null;
}

export async function updateSession(
  id: string,
  patch: Partial<NewSession>,
): Promise<SessionRow | null> {
  const [updated] = await db
    .update(sessions)
    .set({
      ...patch,
      clientUpdatedAt: new Date(),
    })
    .where(eq(sessions.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteSession(id: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function deleteSessionsBefore(cutoff: Date): Promise<number> {
  const cutoffSeconds = Math.floor(cutoff.getTime() / 1000);
  const result = await db
    .delete(sessions)
    .where(sql`${sessions.parkedAt} < ${cutoffSeconds}`);
  return (result as unknown as { changes: number }).changes ?? 0;
}

export async function clearAllSessions(): Promise<void> {
  await db.delete(sessions);
}
