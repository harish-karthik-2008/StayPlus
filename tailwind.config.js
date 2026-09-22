/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FFF7F7',      // Very light coral bg
          100: '#FFF0F0',     // Soft coral
          200: '#FEDADA',     // Light border / subtle badge
          300: '#FCA5A5',     // Soft red/coral
          400: '#FF8A8A',     // Accent bright coral
          500: '#FF7F7F',     // Primary Coral
          600: '#E96B6B',     // Dark Coral (buttons, hovers)
          700: '#D95353',     // Deeper coral
          800: '#B93838',     // Deepest coral
          900: '#8E2020',
        },
        slate: {
          850: '#1e293b',
          900: '#0f172a',
        },
        border: {
          coral: '#F0DADA',
          subtle: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px -2px rgba(233, 107, 107, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 30px -4px rgba(233, 107, 107, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'coral-glow': '0 0 25px rgba(255, 127, 127, 0.25)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out forwards',
        pulseSlow: 'pulseSlow 2.5s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
