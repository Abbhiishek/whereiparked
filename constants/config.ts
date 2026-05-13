export const APP_CONFIG = {
  defaultReminderMinutes: 15,
  maxVoiceNoteSeconds: 60,
  maxNoteChars: 200,
  defaultRetentionDays: 30,
  historyPageSize: 30,
  syncMaxAttempts: 5,
  backgroundFetchIntervalSeconds: 900,
  photoQuality: 0.6,
  photoMaxWidth: 1280,
} as const;

export const SYNC_BACKOFF_MS = (attempt: number): number =>
  Math.min(1000 * 2 ** attempt, 60_000);

export const DEEP_LINKS = {
  widgetSave: 'parkspot://widget/save',
  widgetFind: 'parkspot://widget/find',
  authCallback: 'parkspot://auth/callback',
} as const;
