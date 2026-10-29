/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: token('c-base'),
        surface: {
          1: token('c-surface-1'),
          2: token('c-surface-2'),
          3: token('c-surface-3'),
        },
        line: token('c-line'),
        ink: {
          DEFAULT: token('c-ink'),
          muted: token('c-ink-muted'),
          faint: token('c-ink-faint'),
        },
        signal: token('c-signal'),
        amber: token('c-amber'),
        ok: token('c-ok'),
        bad: token('c-bad'),
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        hud: '0.18em',
      },
      maxWidth: {
        console: '72rem',
      },
    },
  },
  plugins: [],
};
