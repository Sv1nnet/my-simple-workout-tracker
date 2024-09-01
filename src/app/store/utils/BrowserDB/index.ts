import { IndexedDB, IndexedDBTable } from 'app/utils/IndexedDBUtils'

const browserDb = (() => ({
  onInit: null,
  onDisconnect: null,
  isDropping: false,
  droppingPromise: null,
  init(onInit?: (db: IDBDatabase) => void, onDisconnect?: (db?: IDBDatabase) => void) {
    if (!this.db) {
      this.db = new IndexedDB('noAuth', [ 'exercises', 'workouts', 'activities' ], onInit)
      this.onInit = onInit
      this.onDisconnect = onDisconnect
    } else {
      this.onInit?.(this.db.db)
    }
    return this.db
  },
  disconnect() {
    const db = this.db
    if (this.db) {
      this.db = null
      this.onInit = null
    }
    this.onDisconnect?.(db?.db)
  },
  async dropDB() {
    if (this.db) {
      const db = this.db

      this.db = null
      this.onInit = null
      this.isDropping = true
      this.droppingPromise = db.dropDB()

      await this.droppingPromise
      
      this.droppingPromise = null
      this.isDropping = false

      return
    }

    return Promise.reject(new Error('DB is not initialized'))
  },
  db: null as null | IndexedDB<string | 'exercises' | 'workouts' | 'activities'>,
  getTables() {
    if (!this.db) {
      this.db = new IndexedDB('noAuth', [ 'exercises', 'workouts', 'activities' ], this.onInit)
    }

    return {
      exercisesTable: this.db.tables.exercises,
      workoutsTable: this.db.tables.workouts,
      activitiesTable: this.db.tables.activities,
    } as {
      exercisesTable: IndexedDBTable<'exercises'>,
      workoutsTable: IndexedDBTable<'workouts'>,
      activitiesTable: IndexedDBTable<'activities'>,
    }
  },
}))()

export default browserDb
