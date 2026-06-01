import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/fred-api': {
        target: 'https://api.stlouisfed.org/fred',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fred-api/, '')
      }
    }
  }
})
