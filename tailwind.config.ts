import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-surface': 'var(--bg-surface)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',

        accent: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          dark: '#60a5fa',
          'dark-hover': '#93c5fd',
        },

        alert: {
          extreme: '#dc2626',
          'extreme-text': '#fef2f2',
          severe: '#f97316',
          'severe-text': '#fff7ed',
          moderate: '#fbbf24',
          'moderate-text': '#451a03',
          minor: '#fde047',
          'minor-text': '#713f12',
        },

        // temperature
        temp: {
          cold: '#3b82f6',
          cool: '#06b6d4',
          mild: '#22c55e',
          warm: '#f59e0b',
          hot: '#ef4444',
        },

        // precipitation
        precip: {
          rain: '#60a5fa',
          snow: '#cbd5e1',
        },
      },
    },
  },
  plugins: [],
};

export default config;
