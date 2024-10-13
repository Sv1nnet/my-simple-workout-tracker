import { BrowserDB } from 'app/store/utils/BrowserDB'

export type BrowserDBLoader = {
  db: BrowserDB | null
  get: () => Promise<BrowserDB>
}

const browserDBLoader: BrowserDBLoader = {
  db: null,
  async get() {
    if (!this.db) {
      this.db = (await import('app/store/utils/BrowserDB')).default
    }
    return this.db
  },
}

export default browserDBLoader
