export type WidgetState =
  | { kind: 'empty' }
  | {
      kind: 'last-ended';
      parkedAtIso: string;
      endedAtIso: string;
      latitude: number;
      longitude: number;
      note: string | null;
      photoLocalUri: string | null;
    }
  | {
      kind: 'active';
      parkedAtIso: string;
      latitude: number;
      longitude: number;
      note: string | null;
      photoLocalUri: string | null;
      expiresAtIso: string | null;
    };

export const WIDGET_NAME = 'ParkSpotWidget' as const;
