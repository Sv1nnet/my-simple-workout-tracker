import { defineConfig } from 'vite'
// eslint-disable-next-line import/no-extraneous-dependencies
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // eslint-disable-next-line new-cap
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: {
                statuses: [ 0, 200 ],
              },
            },
          },
          {
            urlPattern: ({ url }) => /^(\/assets\/index)/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'static-cache',
              cacheableResponse: {
                statuses: [ 0, 200 ],
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/manifest.webmanifest'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'manifest-cache',
              cacheableResponse: {
                statuses: [ 0, 200 ],
              },
            },
          },
        ],
        globPatterns: [ '**/*.{ts,tsx,js,css,html}' ],
      },
      manifest: {
        name: 'My Simple Workout Tracker',
        short_name: 'Simple w-t tracker',
        start_url: '/',
        display: 'standalone',
        description: 'Simple workout tracker. Add your exercises, workout plan and track progress of your activities.',
        lang: 'en',
        theme_color: '#0aa679',
        background_color: '#0aa679',
        orientation: 'portrait',
        icons: [
          {
            src: '/manifest-icon-512.maskable',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable',
          },
          {
            src: '/manifest-icon-192.maskable',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'maskable',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'src': path.resolve(__dirname, './src'),
      'app':  path.resolve(__dirname, './src/app'),
      'pages':  path.resolve(__dirname, './src/pages'),
      'components':  path.resolve(__dirname, './src/app/components'),
      'layouts':  path.resolve(__dirname, './src/layouts'),
      'utils':  path.resolve(__dirname, './src/utils'),
      'styles':  path.resolve(__dirname, './src/styles'),
      'constants':  path.resolve(__dirname, './src/app/constants'),
      'store':  path.resolve(__dirname, './src/app/store'),
      'api':  path.resolve(__dirname, './src/pages/api'),
      'models':  path.resolve(__dirname, './src/models'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
})
