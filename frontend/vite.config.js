import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The proxy below forwards any /api request from the Vite dev server
// (localhost:5173) to the Spring Boot backend (localhost:8080). To the
// browser, this makes every request look same-origin, so we never need
// to touch CORS config on the backend at all during development.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
