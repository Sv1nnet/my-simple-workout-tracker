import { IndexedDB } from '../utils/IndexedDBUtils'

const browserDb = (() => ({
  onInit: null,
  onDisconnect: null,
  initNoAuthDB(onInit?: (db: IDBDatabase) => void, onDisconnect?: (db?: IDBDatabase) => void) {
    if (!this.db) {
      this.db = new IndexedDB('noAuth', [ 'exercises', 'workouts', 'activities' ], onInit)
      this.onInit = onInit
      this.onDisconnect = onDisconnect
    } else {
      this.onInit?.(this.db.db)
    }
    return this.db
  },
  disconnectNoAuthDB() {
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
      await db.dropDB()
      window.location.reload()
    }

    return Promise.reject(new Error('DB is not initialized'))
  },
  db: null,
  getTables() {
    if (!this.db) {
      this.db = new IndexedDB('noAuth', [ 'exercises', 'workouts', 'activities' ], this.onInit)
    }

    return   ({
      exercisesTable: this.db.tables.exercises,
      workoutsTable: this.db.tables.workouts,
      activitiesTable: this.db.tables.activities,
    })
  },
}))()

export default browserDb