/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Official Government of Gujarat / VMC Palette
        gov: {
          navy: {
            950: '#071426',
            900: '#0B2545',
            800: '#133E87',
            700: '#1D4ED8',
            100: '#EFF6FF',
            50:  '#F8FAFC',
          },
          saffron: {
            DEFAULT: '#C25E00',
            light:   '#FFF7ED',
          },
          gold: '#B45309',
        },
        // Semantic Status & Severity Tokens
        sev: {
          low:      '#166534',
          medium:   '#B45309',
          critical: '#B91C1C',
        },
        stat: {
          pending:  '#1E40AF',
          progress: '#B45309',
          resolved: '#15803D',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body:    ['Plus Jakarta Sans', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm:   '4px',
        md:   '6px',
        lg:   '8px',
        xl:   '10px',
        pill: '999px',
      },
      boxShadow: {
        '2xs':  '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        xs:     '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        card:   '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        hover:  '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        drawer: '-4px 0 16px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
