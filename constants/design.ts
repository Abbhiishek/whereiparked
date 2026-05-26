/**
 * Midnight design tokens — mirrors `theme.jsx` from the design bundle.
 * Use this when className strings can't easily express a value (e.g. dynamic
 * stroke colors, gradient stops, animated counts).
 */
export const Midnight = {
  bg: '#0B0D11',
  surface: '#15181F',
  surface2: '#1D2129',
  surface3: '#262B35',
  border: 'rgba(255,255,255,0.08)',
  text: '#F4F5F7',
  textMute: 'rgba(244,245,247,0.62)',
  textDim: 'rgba(244,245,247,0.40)',
  accent: '#FFC542',
  accentInk: '#1A1300',
  safe: '#7BE5B0',
  urgent: '#FF6B58',
  mapBg: '#0F1217',
  mapInk: '#1A1F29',
  mapRoad: '#252B36',
  mapRoadHi: '#2E3543',
  mapWater: '#15202E',
  mapPark: '#152019',
} as const;

export type Theme = typeof Midnight;

export const Fonts = {
  display: 'System',
  sans: 'System',
  mono: 'monospace',
} as const;

export const Type = {
  // Headlines
  h1: { fontSize: 32, fontWeight: '700', letterSpacing: -0.7, lineHeight: 36 },
  h2: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  h3: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  // Body
  body: { fontSize: 15, fontWeight: '500' },
  bodySm: { fontSize: 13, fontWeight: '500' },
  // Eyebrow / labels
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
  // Mono coords / timestamps
  mono: { fontSize: 11, letterSpacing: 0.3, fontFamily: 'monospace' },
} as const;
