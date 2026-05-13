export type WidgetState =
  | { kind: 'empty' }
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
