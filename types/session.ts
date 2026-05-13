import type { SessionRow } from '@/db/schema';

export type Session = SessionRow;

export interface SessionDraft {
  id: string;
  parkedAt: Date;
  expiresAt: Date | null;
  expirationLeadMinutes: number | null;
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  note: string;
  photoLocalUri: string | null;
  voiceLocalUri: string | null;
  voiceDurationSec: number | null;
}

export interface ActiveSessionView {
  id: string;
  parkedAt: Date;
  expiresAt: Date | null;
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  note: string | null;
  photoLocalUri: string | null;
  voiceLocalUri: string | null;
  voiceDurationSec: number | null;
}
