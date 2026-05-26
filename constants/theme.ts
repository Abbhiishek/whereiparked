import { Platform } from 'react-native';

import { Midnight } from './design';

// The app is dark-first (Midnight design). Both light and dark slots map to
// the same Midnight tokens so callers that read `Colors[scheme]` get a
// consistent palette regardless of system theme.
const palette = {
  text: Midnight.text,
  textMuted: Midnight.textMute,
  background: Midnight.bg,
  surface: Midnight.surface2,
  border: Midnight.border,
  tint: Midnight.accent,
  icon: Midnight.textMute,
  tabIconDefault: Midnight.textDim,
  tabIconSelected: Midnight.accent,
  danger: Midnight.urgent,
  success: Midnight.safe,
  accent: Midnight.accent,
} as const;

export const Colors = {
  light: palette,
  dark: palette,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xl2: 32,
  xl3: 48,
} as const;

export const Radii = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    rounded: 'System',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
