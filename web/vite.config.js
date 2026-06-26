import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // react-konva pulls in react-reconciler, which can cause Vite to load a
  // second copy of React ("Invalid hook call"). Force a single React instance.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-konva', 'konva'],
  },
})
