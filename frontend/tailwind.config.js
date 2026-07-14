/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        // Fraunces: an editorial serif with real character — carries the
        // "professional / trustworthy" register a job portal needs, and
        // reads as considered rather than a generic geometric SaaS display face.
        display: ['Fraunces', 'serif'],
        // Used sparingly for match-percentages, stats and other precise data —
        // tabular figures reinforce that the match score is a real calculation.
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // "Electric Indigo" — standard Tailwind indigo scale, used verbatim
        // so it matches the requested dark, indigo-accented product look.
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // Warm signal color reserved for standout CTAs / highlights —
        // distinct from the "match success" green so the two never compete.
        signal: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        warn: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#111623',
          950: '#0b0f19',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.05), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        'card-hover': '0 20px 40px -12px rgb(79 70 229 / 0.22)',
        elevated: '0 24px 64px -20px rgb(15 23 42 / 0.25)',
        // Combined glow + top inner-highlight for primary buttons — Tailwind's
        // shadow-* utilities each set the whole box-shadow property, so the
        // two effects have to live in one token rather than two stacked classes.
        button: 'inset 0 1px 0 0 rgb(255 255 255 / 0.16), 0 0 0 1px rgb(79 70 229 / 0.08), 0 8px 20px -4px rgb(79 70 229 / 0.35)',
        glow: '0 0 0 1px rgb(79 70 229 / 0.08), 0 8px 24px -4px rgb(79 70 229 / 0.25)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'grid-faint': 'linear-gradient(to right, rgb(15 23 42 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 23 42 / 0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
    },
  },
  plugins: [],
}
