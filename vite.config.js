import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  publicDir: 'public',
  // Copy model files to public directory
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Environment variables
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000')
  }
})
