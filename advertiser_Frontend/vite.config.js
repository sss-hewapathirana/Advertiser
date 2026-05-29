import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/auth': 'http://localhost:8080',
      '/users': 'http://localhost:8080',
      '/ads': 'http://localhost:8080',
      '/images': 'http://localhost:8080',
      '/videos': 'http://localhost:8080',
      '/files': 'http://localhost:8080',
      '/inquiries': 'http://localhost:8080',
      '/conversations': 'http://localhost:8080',
      '/health': 'http://localhost:8080',
    }
  }
})
