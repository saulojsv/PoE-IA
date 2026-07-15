import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/data': {
        target: 'http://127.0.0.1:8765',
        rewrite: path => path.replace(/^\/data/, ''),
      },
      '/assets': 'http://127.0.0.1:8765',
    },
  },
})
