import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static, no-backend build. `npm run build` emits dist/ for the eval harness to serve.
export default defineConfig({
  plugins: [react()],
  base: './',
})
