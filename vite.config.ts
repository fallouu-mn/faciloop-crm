import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: false,
      injectManifest: {
        rollupFormat: 'es',
        globIgnores: ['**/node_modules/**/*'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /realtime/, /^\/super-admin/],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  server: {
    host: '::',
    port: 8080,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  ...(mode === 'production' && {
    esbuild: {
      drop: ['debugger'],
      pure: ['console.log', 'console.debug', 'console.info', 'console.warn'],
    },
  }),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-recharts': ['recharts'],
          'vendor-i18n': ['i18next', 'react-i18next'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
}));
