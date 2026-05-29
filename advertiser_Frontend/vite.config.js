import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backendUrl = process.env.VITE_API_URL || 'http://localhost:8080'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/auth': backendUrl,
      '/users': backendUrl,
      '/ads': backendUrl,
      '/images': backendUrl,
      '/videos': backendUrl,
      '/files': backendUrl,
      '/inquiries': backendUrl,
      '/conversations': backendUrl,
      '/health': backendUrl,
    }
  }
})

