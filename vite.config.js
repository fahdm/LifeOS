import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.', // everything lives at root
  build: {
    outDir: 'dist',
  },
})
