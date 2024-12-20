import { IndexedDB } from './IndexedDBUtils'

export const initBaseWorkouts = async (db: IndexedDB<string>, lang: 'ru' | 'eng') => {
  let baseWorkouts = null
  try {
    baseWorkouts = lang === 'ru'
      ? await import('app/constants/base_workouts_ru')
      : await import('app/constants/base_workouts_eng')
  } catch (error) {
    console.error(error)
    throw error
  }

  const { workouts: workoutsTable } = db.tables

  for await (const workout of baseWorkouts.default) {
    await db.set(workoutsTable, workout.id, JSON.stringify(workout))
  }
}
