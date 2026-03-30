import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/auth': 'http://localhost:3001',
      '/api/users': 'http://localhost:3000',
      '/api/roles': 'http://localhost:3000',
      '/api/teams': 'http://localhost:3003',
      '/api/instances': 'http://localhost:3003',
    },
  },
})
