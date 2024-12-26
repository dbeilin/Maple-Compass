import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    cors: true
  },
  preview: {
    port: 3000,
    host: true,
    cors: true
  }
})
