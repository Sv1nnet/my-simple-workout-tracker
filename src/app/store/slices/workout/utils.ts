import db from '../../BrowserDB'

export const table = db.tables.workouts
export const activityTable = db.tables.activities

export const fieldsToFormat = { archived: 'bool', is_in_activity: 'bool' }