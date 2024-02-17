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


class IndexedDBTable {
  constructor(db, tableName) {
    this.db = db
    this.name = tableName
  }

  getAllKeys() {
    return this.db.getAllKeys(this.name)
  }

  get(key) {
    return this.db.get(this.name, key)
  }

  remove(key) {
    return this.db.remove(this.name, key)
  }

  set(key, value) {
    return this.db.set(this.name, key, value)
  }
}

class IndexedDB {
  static initialize(dbName, tableNames) {
    return new Promise((resolve, reject) => {
      try {
        const connection = window.indexedDB.open(dbName)
  
        connection.addEventListener('success', (event) => {
          const request = event.target
          resolve(request.result)
        })
  
        connection.addEventListener('error', (event) => {
          reject(event)
        })
  
        connection.addEventListener('blocked', () => {
          reject(new Error('IndexedDB initialization blocked'))
        })
  
        connection.addEventListener('upgradeneeded', (event) => {
          const request = event.target
          tableNames?.forEach((name) => {
            request.result.createObjectStore(name)
          })
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  static getAllKeys(dbName, tableName) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await IndexedDB.initialize(dbName, [ tableName ])
        const transaction = db.transaction(tableName, 'readonly')
        const objectStore = transaction.objectStore(tableName)
        const request = objectStore.getAllKeys()
  
        request.addEventListener('success', () => {
          const keys = request.result
          db.close()
          resolve(keys)
        })
        request.addEventListener('error', (e) => {
          db.close()
          reject(e)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  static get(dbName, tableName, key) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await IndexedDB.initialize(dbName, [ tableName ])
        const transaction = db.transaction([ tableName ], 'readonly')
        const objectStore = transaction.objectStore(tableName)
        const request = objectStore.getAll(key)
  
        request.addEventListener('success', () => {
          const result = request.result[0]
          db.close()
          resolve(result)
        })
        request.addEventListener('error', (e) => {
          db.close()
          reject(e)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  static remove(dbName, tableName, key) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await IndexedDB.initialize(dbName, [ tableName ])
        const transaction = db.transaction(tableName, 'readwrite')
        const objectStore = transaction.objectStore(tableName)
        const request = objectStore.delete(key)
  
        request.addEventListener('success', () => {
          db.close()
          resolve()
        })
        request.addEventListener('error', (e) => {
          db.close()
          reject(e)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  static set(dbName, tableName, key, value) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await IndexedDB.initialize(dbName, [ tableName ])
        const transaction = db.transaction(tableName, 'readwrite')
        const objectStore = transaction.objectStore(tableName)
        const request = objectStore.put(value, key)
  
        request.addEventListener('success', () => {
          db.close()
          resolve()
        })
        request.addEventListener('error', (e) => {
          db.close()
          reject(e)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  constructor(dbName, tableNames) {
    this.name = dbName
    this.tableNames = tableNames
    this.initialize()
    this.tables = tableNames.reduce((acc, name) => {
      acc[name] = new IndexedDBTable(this, name)
      return acc
    }, {})
  }

  initialize() {
    return IndexedDB.initialize(this.name, this.tableNames)
  }

  getAllKeys(tableName) {
    return IndexedDB.getAllKeys(this.name, tableName)
  }

  get(tableName, key) {
    return IndexedDB.get(this.name, tableName, key)
  }

  remove(tableName, key) {
    return IndexedDB.remove(this.name, tableName, key)
  }

  set(tableName, key, value) {
    return IndexedDB.set(this.name, tableName, key, value)
  }
}
