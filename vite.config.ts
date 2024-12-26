import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://maplestory.io/api/GMS/83',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    port: 3000,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://maplestory.io/api/GMS/83',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
