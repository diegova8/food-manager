import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@vercel/blob'] // Exclude server-only packages
  },
  server: {
    fs: {
      // Don't serve files from api/ folder
      deny: ['**/api/**']
    }
  }
})
