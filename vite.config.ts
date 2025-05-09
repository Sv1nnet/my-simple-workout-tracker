import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __ENVIRONMENT__: JSON.stringify(process.env.ENVIRONMENT),
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
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
