/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono-custom)'],
      },
      colors: {
        parchment: {
          50: '#fdf8f0',
          100: '#f5e8cc',
          200: '#ead0a0',
          300: '#d4aa6e',
          400: '#b8873a',
          500: '#8c6420',
          600: '#6b4a14',
          700: '#4a3209',
          800: '#2e1e04',
          900: '#1a1002',
        },
        ink: {
          DEFAULT: '#1a1002',
          light: '#3d2e10',
        },
        rust: '#8b2e0a',
        gold: '#c9952a',
        cream: '#f5e8cc',
      },
    },
  },
  plugins: [],
};
