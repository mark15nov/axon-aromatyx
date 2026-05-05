/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        // Paleta cálida Aromatyx (flipped: low number = dark text, high number = light bg)
        ink: {
          0:   '#000000',
          50:  '#1a1410',  // primary text (was the lightest, now darkest)
          100: '#26201b',
          200: '#3a3128',
          300: '#574c41',
          400: '#7a6f63',
          500: '#9b9085',
          600: '#b5ab9f',
          700: '#d6cdc1',  // input/border emphasis
          800: '#ebe4d8',  // soft border / chip bg
          850: '#f1ebe0',
          900: '#f8f3ea',  // panel bg
          950: '#fbf7ef',  // page bg (warm cream)
        },
        steel: {
          // Warm terracotta accent — fits aroma brand
          50:  '#fdf5ee',
          100: '#fbe7d4',
          200: '#f5cda9',
          300: '#eeac74',
          400: '#e58a4d',
          500: '#d97441',
          600: '#c2592b',  // primary CTA
          700: '#9f4421',
          800: '#7d3620',
          900: '#5e2a1a',
        },
        signal: {
          ok: '#15803d',
          okBg: '#dcfce7',
          okBorder: '#86efac',
          warn: '#b45309',
          warnBg: '#fef3c7',
          warnBorder: '#fcd34d',
          alert: '#b91c1c',
          alertBg: '#fee2e2',
          alertBorder: '#fca5a5',
        },
        // Friendly zone palette (for map / chips)
        zone: {
          rose:    '#e8829c',
          ochre:   '#d29c4f',
          sage:    '#7fa37b',
          plum:    '#9871a8',
          sky:     '#5d9bbf',
          coral:   '#e57c5f',
          mint:    '#62a890',
          mustard: '#c8a34a',
        },
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      boxShadow: {
        soft:  '0 1px 2px rgba(58, 49, 40, 0.04), 0 1px 1px rgba(58, 49, 40, 0.03)',
        card:  '0 2px 8px rgba(58, 49, 40, 0.05), 0 1px 2px rgba(58, 49, 40, 0.04)',
        lift:  '0 8px 24px rgba(58, 49, 40, 0.08), 0 2px 6px rgba(58, 49, 40, 0.05)',
        focus: '0 0 0 3px rgba(194, 89, 43, 0.18)',
      },
    },
  },
  plugins: [],
}
