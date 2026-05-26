/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Midnight palette (from design bundle)
        bg: '#0B0D11',
        surface: {
          DEFAULT: '#15181F',
          1: '#15181F',
          2: '#1D2129',
          3: '#262B35',
          light: '#FFFFFF',
          dark: '#0B0D11',
        },
        ink: {
          DEFAULT: '#F4F5F7',
          muted: 'rgba(244,245,247,0.62)',
          dim: 'rgba(244,245,247,0.40)',
          inverse: '#F4F5F7',
        },
        accent: {
          DEFAULT: '#FFC542',
          dark: '#E0A933',
          ink: '#1A1300',
        },
        safe: '#7BE5B0',
        urgent: '#FF6B58',
        danger: '#FF6B58',
        success: '#7BE5B0',
        edge: 'rgba(255,255,255,0.08)',
        'map-bg': '#0F1217',
        'map-ink': '#1A1F29',
        'map-road': '#252B36',
        'map-roadhi': '#2E3543',
        'map-water': '#15202E',
        'map-park': '#152019',
        // Legacy brand aliases — kept so screens not yet restyled don't break
        brand: {
          50: '#262B35',
          100: '#262B35',
          200: '#262B35',
          300: '#FFC542',
          400: '#FFC542',
          500: '#FFC542',
          600: '#E0A933',
          700: '#FFC542',
          800: '#1D2129',
          900: '#15181F',
        },
      },
      fontFamily: {
        sans: ['System'],
        display: ['System'],
        mono: ['monospace'],
      },
      borderRadius: {
        xl2: '20px',
      },
    },
  },
  plugins: [],
};
