import db from '../../BrowserDB'

export const table = db.tables.activities
export const workoutsTable = db.tables.workouts
export const exercisesTable = db.tables.exercises

export const fieldsToFormat = { archived: 'bool', is_in_activity: 'bool' }