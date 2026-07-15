import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:4010';

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: true
    },
    build: {
      outDir: 'dist',
      target: 'es2022',
      sourcemap: false,
      assetsDir: 'assets',
      emptyOutDir: true
    }
  };
});
