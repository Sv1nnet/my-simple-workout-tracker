import { IndexedDB, IndexedDBTable } from 'app/utils/IndexedDBUtils'

const tables = [ 'exercises', 'workouts', 'activities', 'config', 'muscleGroups', 'settings' ]

const browserDb = (() => ({
  onInit: null,
  onDisconnect: null,
  isDropping: false,
  droppingPromise: null,
  init(onInit?: (db: IDBDatabase) => void, onDisconnect?: (db?: IDBDatabase) => void) {
    if (!this.db) {
      this.db = new IndexedDB('local', tables, onInit)
      this.onInit = onInit
      this.onDisconnect = onDisconnect
    } else {
      (this.onInit || (this.onInit = onInit || null))?.(this.db.db)
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

      this.isDropping = true

      try {
        this.droppingPromise = db.dropDB()
        await this.droppingPromise
      } catch (error) {
        console.warn('Drop DB failed', error)
        location.reload()
      }

      this.db = null
      this.onInit = null
      this.droppingPromise = null
      this.isDropping = false

      return
    }

    return Promise.reject(new Error('DB is not initialized'))
  },
  db: null as null | IndexedDB<string | 'exercises' | 'workouts' | 'activities' | 'config' | 'muscleGroups' | 'settings'>,
  getTables() {
    if (!this.db) {
      this.db = new IndexedDB('local', tables, this.onInit)
    }

    return {
      exercisesTable: this.db.tables.exercises,
      workoutsTable: this.db.tables.workouts,
      activitiesTable: this.db.tables.activities,
      configTable: this.db.tables.config,
      muscleGroupsTable: this.db.tables.muscleGroups,
    } as {
      exercisesTable: IndexedDBTable<'exercises'>,
      workoutsTable: IndexedDBTable<'workouts'>,
      activitiesTable: IndexedDBTable<'activities'>,
      configTable: IndexedDBTable<'config'>,
      muscleGroupsTable: IndexedDBTable<'muscleGroups'>
    }
  },
}))()

export type BrowserDB = typeof browserDb

export default browserDb
