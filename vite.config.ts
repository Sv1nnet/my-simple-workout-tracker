import { defineConfig } from 'vite'
// eslint-disable-next-line import/no-extraneous-dependencies
// import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // eslint-disable-next-line new-cap
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   devOptions: {
    //     enabled: true,
    //   },
    //   workbox: {
    //     globPatterns: [ '**/*.{js,css,html,ico,png,svg}' ],
    //   },
    //   manifest: {
    //     'name': 'My Simple Workout Tracker',
    //     'short_name': 'MSWT',
    //     'theme_color': '#ffffff',
    //     'background_color': '#004740',
    //     'display': 'fullscreen',
    //     'orientation': 'portrait',
    //     'scope': '/',
    //     'start_url': '/',
    //     'icons': [
    //       {
    //         'src': 'icons/chart.svg',
    //         'type': 'image/svg',
    //       },
    //       {
    //         'src': '/icons/ruflag.svg',
    //         'type': 'image/svg',
    //       },
    //       {
    //         'src': 'icons/table.svg',
    //         'type': 'image/svg',
    //       },
    //       {
    //         'src': '/icons/usa_flag.svg',
    //         'type': 'image/svg',
    //       },
    //       {
    //         'src': 'logo.svg',
    //         'type': 'image/svg',
    //       },
    //     ],
    //   },
    // }),
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
