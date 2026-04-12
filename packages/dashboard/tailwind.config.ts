import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        surface: {
          primary: '#0f172a',
          secondary: '#1e293b',
          card: '#334155',
        },
      },
    },
  },
  plugins: [],
}

export default config
