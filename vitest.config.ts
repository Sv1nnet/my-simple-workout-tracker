/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './setupTests.ts',
  },
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
