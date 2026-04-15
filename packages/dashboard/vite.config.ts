import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, proxy API calls to a local server by default, but allow overriding
// via VITE_API_TARGET env var (e.g. point at the live staging server).
const apiTarget = process.env.VITE_API_TARGET ?? 'http://localhost:3000'
const wsTarget = apiTarget.replace(/^http/, 'ws')

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api/ws': {
        target: wsTarget,
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
