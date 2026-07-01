import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const BACKEND = env.VITE_API_BASE_URL;

  return {
    plugins: [react()],
    // react-konva pulls in react-reconciler, which can cause Vite to load a
    // second copy of React ("Invalid hook call"). Force a single React instance.
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-konva', 'konva'],
    },
    server: {
      proxy: {
        '/api': {
          target: BACKEND,
          changeOrigin: true,
        },
        '/game': {
          target: BACKEND,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
})
