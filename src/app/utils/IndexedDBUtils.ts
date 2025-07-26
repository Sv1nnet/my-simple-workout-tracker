import { isString } from './typeCheckers'

export class IndexedDBTable<N extends string> {
  public readonly db: IndexedDB<N>

  public readonly name: N

  constructor(db: IndexedDB<N>, tableName: N) {
    this.db = db
    this.name = tableName
  }

  getAllKeys(): Promise<IDBValidKey[]> {
    return this.db.getAllKeys(this.name)
  }

  get(key: string): Promise<string> {
    return this.db.get(this.name, key)
  }

  remove(key: string): Promise<void> {
    return this.db.remove(this.name, key)
  }

  set(key: string, value?: string): Promise<void> {
    return this.db.set(this.name, key, value)
  }

  batchInsert<T = unknown>(items: { key: string, value: T }[]): Promise<number> {
    return this.db.batchInsert(this.name, items)
  }

  batchRemove(keys: string[]): Promise<number> {
    return this.db.batchRemove(this.name, keys)
  }

  getRange<T = unknown>(
    options: {
      startKey?: IDBValidKey
      limit?: number
      direction?: IDBCursorDirection
      skipCount?: number
    } = {},
  ): Promise<{ items: T[], lastKey: IDBValidKey | null, hasMore: boolean }> {
    return this.db.getRange(this.name, options)
  }
}

export class IndexedDB<N extends string> {
  public static init(dbName: string, tableNames: string[] = [], version = 1): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      try {
        const connection = window.indexedDB.open(dbName, version)
  
        connection.addEventListener('success', (e) => {
          const request = e.target as IDBOpenDBRequest
          resolve(request.result)
        })
  
        connection.addEventListener('error', (e) => {
          reject(e)
        })
  
        connection.addEventListener('blocked', (e) => {
          connection.result?.close()
          reject(e)
        })
  
        connection.addEventListener('upgradeneeded', (e) => {
          const request = e.target as IDBOpenDBRequest
          tableNames.forEach((name) => {
            request.result.createObjectStore(name)
          })
          resolve(request.result)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  public static open(dbName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      try {
        const connection = window.indexedDB.open(dbName)
  
        connection.addEventListener('success', (e) => {
          const request = e.target as IDBOpenDBRequest
          resolve(request.result)
        })
  
        connection.addEventListener('error', (e) => {
          connection.result.close()
          reject(e)
        })
  
        connection.addEventListener('blocked', (e) => {
          connection.result.close()
          reject(e)
        })
  
        connection.addEventListener('upgradeneeded', (e) => {
          connection.result.close()
          reject(e)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  public static getAllKeys(dbName: string, tableName: string): Promise<IDBValidKey[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = await IndexedDB.open(dbName)
        const transaction = connection.transaction(tableName, 'readonly')
        const objectStore = transaction.objectStore(tableName)
        const request = objectStore.getAllKeys()
  
        request.addEventListener('success', () => {
          const keys = request.result
          connection.close()
          resolve(keys)
        })
        request.addEventListener('error', (e) => {
          connection.close()
          reject(e)
        })
        request.addEventListener('blocked', (e) => {
          connection.close()
          reject(e)
        })
        connection.addEventListener('upgradeneeded', (e) => {
          connection.close()
          reject(e)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  public static get<V = unknown>(dbName: string, tableName: string, key: string | IDBValidKey): Promise<V> {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = await IndexedDB.open(dbName)
        const transaction = connection.transaction([ tableName ], 'readonly')
        const objectStore = transaction.objectStore(tableName)
        const request = objectStore.getAll(key)
  
        request.addEventListener('success', () => {
          const result = request.result[0]
          connection.close()
          resolve(result)
        })
        request.addEventListener('error', (e) => {
          connection.close()
          reject(e)
        })
        request.addEventListener('blocked', (e) => {
          connection.close()
          reject(e)
        })
        request.addEventListener('upgradeneeded', (e) => {
          connection.close()
          reject(e)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  public static remove(dbName: string, tableName: string, key: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = await IndexedDB.open(dbName)
        const transaction = connection.transaction(tableName, 'readwrite')
        const objectStore = transaction.objectStore(tableName)
        const request = objectStore.delete(key)
  
        request.addEventListener('success', () => {
          connection.close()
          resolve()
        })
        request.addEventListener('error', (e) => {
          connection.close()
          reject(e)
        })
        request.addEventListener('blocked', (e) => {
          connection.close()
          reject(e)
        })
        request.addEventListener('upgradeneeded', (e) => {
          connection.close()
          reject(e)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  public static dropDB(dbName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      try {
        const connection = window.indexedDB.deleteDatabase(dbName)
        connection.addEventListener('success', () => {
          resolve(connection.result)
        })
        connection.addEventListener('error', (e) => {
          connection.result.close()
          reject(e)
        })
        connection.addEventListener('blocked', (e) => {
          reject(e)
        })
        connection.addEventListener('upgradeneeded', (e) => {
          connection.result?.close()
          reject(e)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  public static set(dbName: string, tableName: string, key: string, value?: string | object | boolean | number | null): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = await IndexedDB.open(dbName)
        const transaction = connection.transaction(tableName, 'readwrite')
        const objectStore = transaction.objectStore(tableName)
        const request = objectStore.put(value, key)
  
        request.addEventListener('success', () => {
          connection.close()
          resolve()
        })
        request.addEventListener('error', (e) => {
          connection.close()
          reject(e)
        })
        request.addEventListener('blocked', (e) => {
          connection.close()
          reject(e)
        })
        request.addEventListener('upgradeneeded', (e) => {
          connection.close()
          reject(e)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  public static batchUpdate(dbName: string, tableName: string, items: { key: string, value: string | object | boolean | number | null }[]): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = await IndexedDB.open(dbName)
        const transaction = connection.transaction(tableName, 'readwrite')
        const objectStore = transaction.objectStore(tableName)
        let successCount = 0

        const handleSuccess = () => {
          successCount++
        }

        const handleError = (e: Event) => {
          connection.close()
          reject(e)
        }

        transaction.addEventListener('error', (e) => {
          connection.close()
          reject(e)
        })

        transaction.addEventListener('complete', () => {
          connection.close()
          resolve(successCount)
        })

        transaction.addEventListener('abort', (e) => {
          connection.close()
          reject(e)
        })

        for (const item of items) {
          const request = objectStore.put(item.value, item.key)
          request.addEventListener('success', handleSuccess)
          request.addEventListener('error', handleError)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  public static batchInsert<T = unknown>(dbName: string, tableName: string, items: { key: string, value: T }[]): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = await IndexedDB.open(dbName)
        const transaction = connection.transaction(tableName, 'readwrite')
        const objectStore = transaction.objectStore(tableName)
        let successCount = 0

        transaction.addEventListener('error', (e) => {
          connection.close()
          reject(e)
        })

        transaction.addEventListener('complete', () => {
          connection.close()
          resolve(successCount)
        })

        transaction.addEventListener('abort', (e) => {
          connection.close()
          reject(e)
        })

        const handleSuccess = () => {
          successCount++
        }

        const handleError = (e: Event) => {
          connection.close()
          reject(e)
        }

        for (const item of items) {
          let request: IDBRequest
          if (item && typeof item === 'object' && 'key' in item && 'value' in item) {
            // Handle key-value pairs
            request = objectStore.add(item.value, item.key)
          } else {
            // Handle plain items
            request = objectStore.add(item)
          }
          request.addEventListener('success', handleSuccess)
          request.addEventListener('error', handleError)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  public static getAll<T = unknown>(dbName: string, tableName: string): Promise<T[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = await IndexedDB.open(dbName)
        const transaction = connection.transaction(tableName, 'readonly')
        const objectStore = transaction.objectStore(tableName)
        const request = objectStore.getAll()

        request.addEventListener('success', () => {
          const result = request.result
          connection.close()
          resolve(result)
        })
        request.addEventListener('error', (e) => {
          connection.close()
          reject(e)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  public static getRange<T = unknown>(
    dbName: string, 
    tableName: string, 
    options: {
      filter?: (cursor: IDBCursorWithValue) => boolean
      startKey?: IDBValidKey
      limit?: number
      direction?: IDBCursorDirection
      skipCount?: number
    } = {},
  ): Promise<{ items: T[], lastKey: IDBValidKey | null, hasMore: boolean }> {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = await IndexedDB.open(dbName)
        const transaction = connection.transaction(tableName, 'readonly')
        const objectStore = transaction.objectStore(tableName)
        
        const { filter, startKey, limit = 50, direction = 'next', skipCount = 0 } = options
        const items: T[] = []
        let count = 0
        let skipped = 0
        let lastKey: IDBValidKey | null = null
        let hasMore = false

        // Create key range if startKey is provided
        const keyRange = startKey ? IDBKeyRange.lowerBound(startKey, false) : undefined
        const cursorRequest = objectStore.openCursor(keyRange, direction)

        cursorRequest.addEventListener('success', (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
          
          if (cursor) {
            const isFiltered = filter ? filter(cursor) : true
            // Skip items if skipCount is specified
            if (!isFiltered) {
              cursor.continue()
              return
            }

            if (skipped < skipCount) {
              skipped++
              cursor.continue()
              return
            }

            // If we've reached the limit, check if there are more items
            if (count >= limit) {
              hasMore = true
              connection.close()
              resolve({ 
                items, 
                lastKey, 
                hasMore,
              })
              return
            }

            // Add item to results
            items.push(cursor.value)
            lastKey = cursor.key
            count++

            // Continue to next item
            cursor.continue()
          } else {
            // No more items
            connection.close()
            resolve({ 
              items, 
              lastKey, 
              hasMore: false,
            })
          }
        })

        cursorRequest.addEventListener('error', (e) => {
          connection.close()
          reject(e)
        })

        transaction.addEventListener('error', (e) => {
          connection.close()
          reject(e)
        })

        transaction.addEventListener('abort', (e) => {
          connection.close()
          reject(e)
        })

      } catch (err) {
        reject(err)
      }
    })
  }

  public static batchRemove(dbName: string, tableName: string, keys: string[]): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = await IndexedDB.open(dbName)
        const transaction = connection.transaction(tableName, 'readwrite')
        const objectStore = transaction.objectStore(tableName)
        let successCount = 0

        transaction.addEventListener('error', (e) => {
          connection.close()
          reject(e)
        })

        transaction.addEventListener('complete', () => {
          connection.close()
          resolve(successCount)
        })

        transaction.addEventListener('abort', (e) => {
          connection.close()
          reject(e)
        })

        const handleSuccess = () => {
          successCount++
        }

        const handleError = (e: Event) => {
          connection.close()
          reject(e)
        }

        for (const key of keys) {
          const request = objectStore.delete(key)
          request.addEventListener('success', handleSuccess)
          request.addEventListener('error', handleError)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  public readonly name: string

  public readonly tableNames: N[]

  public readonly tables: { [K in N]: IndexedDBTable<N> } = null

  constructor(dbName: string, tableNames: N[], onInit?: (db: IDBDatabase) => void) {
    this.name = dbName
    this.tableNames = tableNames
    this.initialize().then(db => onInit && onInit(db)).catch(error => console.warn('onInit db error', error))
    this.tables = tableNames.reduce((acc, name) => {
      acc[name] = new IndexedDBTable(this, name)
      return acc
    }, {} as { [K in N]: IndexedDBTable<N> })
  }

  initialize(): Promise<IDBDatabase> {
    return IndexedDB.init(this.name, this.tableNames)
  }

  getAllKeys(table: N | IndexedDBTable<N>): Promise<IDBValidKey[]> {
    const tableName = isString(table) ? table : table.name
    return IndexedDB.getAllKeys(this.name, tableName)
  }

  get(table: N | IndexedDBTable<N>, key: string | IDBValidKey): Promise<string> {
    const tableName = isString(table) ? table : table.name
    return IndexedDB.get(this.name, tableName, key)
  }

  remove(table: N | IndexedDBTable<N>, key: string): Promise<void> {
    const tableName = isString(table) ? table : table.name
    return IndexedDB.remove(this.name, tableName, key)
  }

  set(table: N | IndexedDBTable<N>, key: string, value?: string | object | boolean | number | null): Promise<void> {
    const tableName = isString(table) ? table : table.name
    return IndexedDB.set(this.name, tableName, key, value)
  }

  batchUpdate(table: N | IndexedDBTable<N>, items: { key: string, value: string | object | boolean | number | null }[]): Promise<number> {
    const tableName = isString(table) ? table : table.name
    return IndexedDB.batchUpdate(this.name, tableName, items)
  }

  batchInsert<T = unknown>(table: N | IndexedDBTable<N>, items: { key: string, value: T }[]): Promise<number> {
    const tableName = isString(table) ? table : table.name
    return IndexedDB.batchInsert(this.name, tableName, items)
  }

  batchRemove(table: N | IndexedDBTable<N>, keys: string[]): Promise<number> {
    const tableName = isString(table) ? table : table.name
    return IndexedDB.batchRemove(this.name, tableName, keys)
  }

  getAll<T = unknown>(table: N | IndexedDBTable<N>): Promise<T[]> {
    const tableName = isString(table) ? table : table.name
    return IndexedDB.getAll(this.name, tableName)
  }

  getRange<T = unknown>(
    table: N | IndexedDBTable<N>, 
    options: {
      startKey?: IDBValidKey
      limit?: number
      direction?: IDBCursorDirection
      skipCount?: number
    } = {},
  ): Promise<{ items: T[], lastKey: IDBValidKey | null, hasMore: boolean }> {
    const tableName = isString(table) ? table : table.name
    return IndexedDB.getRange(this.name, tableName, options)
  }

  dropDB(): Promise<IDBDatabase> {
    return IndexedDB.dropDB(this.name)
  }
}
