import { IndexedDB } from '../utils/IndexedDBUtils'

const db = new IndexedDB('noCreds', [ 'exercises', 'workouts', 'activities' ])

export const { tables } = db

export default db