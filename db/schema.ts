import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    parkedAt: integer('parked_at', { mode: 'timestamp' }).notNull(),
    endedAt: integer('ended_at', { mode: 'timestamp' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    accuracyM: real('accuracy_m'),
    note: text('note'),
    photoLocalUri: text('photo_local_uri'),
    voiceLocalUri: text('voice_local_uri'),
    voiceDurationSec: integer('voice_duration_sec'),
    reminderNotificationId: text('reminder_notification_id'),
    clientUpdatedAt: integer('client_updated_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    parkedAtIdx: index('idx_sessions_parked_at').on(table.parkedAt),
    activeIdx: index('idx_sessions_active').on(table.endedAt),
  }),
);

export type SessionRow = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
