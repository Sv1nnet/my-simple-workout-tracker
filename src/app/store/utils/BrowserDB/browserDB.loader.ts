const browserDBLoader = {
  db: null,
  async get() {
    if (!this.db) {
      this.db = (await import('app/store/utils/BrowserDB')).default
    }
    return this.db
  },
}

export default browserDBLoader
