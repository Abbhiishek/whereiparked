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
        brand: {
          50: '#E6F4F0',
          100: '#C3E4D9',
          200: '#8FCCB7',
          300: '#5AB395',
          400: '#2C9A78',
          500: '#0E7C66',
          600: '#0B6253',
          700: '#08493D',
          800: '#053128',
          900: '#031C16',
        },
        accent: {
          DEFAULT: '#FFB020',
          dark: '#CC8C19',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#0B1F1A',
        },
        ink: {
          DEFAULT: '#0E1411',
          muted: '#5C6B66',
          inverse: '#F5F8F6',
        },
        danger: '#D14343',
        success: '#2BB673',
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        xl2: '20px',
      },
    },
  },
  plugins: [],
};
