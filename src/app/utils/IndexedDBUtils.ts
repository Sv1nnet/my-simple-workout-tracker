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
}

export class IndexedDB<N extends string> {
  public static init(dbName: string, tableNames?: string[]): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      try {
        const connection = window.indexedDB.open(dbName)
  
        connection.addEventListener('success', (event) => {
          const request = event.target as IDBOpenDBRequest
          resolve(request.result)
        })
  
        connection.addEventListener('error', (event) => {
          reject(event)
        })
  
        connection.addEventListener('blocked', () => {
          reject(new Error('IndexedDB initialization blocked'))
        })
  
        connection.addEventListener('upgradeneeded', (event) => {
          const request = event.target as IDBOpenDBRequest
          tableNames?.forEach((name) => {
            request.result.createObjectStore(name)
          })
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  public static getAllKeys(dbName: string, tableName: string): Promise<IDBValidKey[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await IndexedDB.init(dbName, [ tableName ])
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

  public static get<V = unknown>(dbName: string, tableName: string, key: string | IDBValidKey): Promise<V> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await IndexedDB.init(dbName, [ tableName ])
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

  public static remove(dbName: string, tableName: string, key: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await IndexedDB.init(dbName, [ tableName ])
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

  public static dropDB(dbName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.deleteDatabase(dbName)
        request.addEventListener('success', () => {
          resolve()
        })
        request.addEventListener('error', (e) => {
          reject(e)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  public static set(dbName: string, tableName: string, key: string, value?: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await IndexedDB.init(dbName, [ tableName ])
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

  public readonly name: string

  public readonly tableNames: N[]

  public readonly tables: { [K in N]: IndexedDBTable<N> } = null

  constructor(dbName: string, tableNames: N[], onInit?: (db: IDBDatabase) => void) {
    this.name = dbName
    this.tableNames = tableNames
    this.initialize().then(db => onInit && onInit(db))
    this.tables = tableNames.reduce((acc, name) => {
      acc[name] = new IndexedDBTable(this, name)
      return acc
    }, {} as { [K in N]: IndexedDBTable<N> })
  }

  initialize(): Promise<IDBDatabase> {
    return IndexedDB.init(this.name, this.tableNames)
  }

  getAllKeys(table: N | IndexedDBTable<N>): Promise<IDBValidKey[]> {
    const tableName = typeof table === 'string' ? table : table.name
    return IndexedDB.getAllKeys(this.name, tableName)
  }

  async getAllValues(table: N | IndexedDBTable<N>): Promise<string[]> {
    const keys = await this.getAllKeys(table)
    return Promise.all(keys.map(key => this.get(table, key)))
  }

  get(table: N | IndexedDBTable<N>, key: string | IDBValidKey): Promise<string> {
    const tableName = typeof table === 'string' ? table : table.name
    return IndexedDB.get(this.name, tableName, key)
  }

  remove(table: N | IndexedDBTable<N>, key: string): Promise<void> {
    const tableName = typeof table === 'string' ? table : table.name
    return IndexedDB.remove(this.name, tableName, key)
  }

  set(table: N | IndexedDBTable<N>, key: string, value?: string): Promise<void> {
    const tableName = typeof table === 'string' ? table : table.name
    return IndexedDB.set(this.name, tableName, key, value)
  }

  dropDB(): Promise<void> {
    return IndexedDB.dropDB(this.name)
  }
}
