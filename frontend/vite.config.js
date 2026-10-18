import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react()],
    // Proxy API calls to the backend so no CORS setup is needed
    server: {
      proxy: { '/api': env.VITE_API_TARGET || 'http://localhost:5050' },
    },
  };
});
