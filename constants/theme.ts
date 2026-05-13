import { Platform } from 'react-native';

const tintColorLight = '#0E7C66';
const tintColorDark = '#5AB395';

export const Colors = {
  light: {
    text: '#0E1411',
    textMuted: '#5C6B66',
    background: '#FFFFFF',
    surface: '#F5F8F6',
    border: '#E2E8E5',
    tint: tintColorLight,
    icon: '#5C6B66',
    tabIconDefault: '#5C6B66',
    tabIconSelected: tintColorLight,
    danger: '#D14343',
    success: '#2BB673',
    accent: '#FFB020',
  },
  dark: {
    text: '#F5F8F6',
    textMuted: '#9AAAA4',
    background: '#0B1F1A',
    surface: '#13312A',
    border: '#1F4337',
    tint: tintColorDark,
    icon: '#9AAAA4',
    tabIconDefault: '#9AAAA4',
    tabIconSelected: tintColorDark,
    danger: '#FF6B6B',
    success: '#4FD198',
    accent: '#FFC04D',
  },
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
