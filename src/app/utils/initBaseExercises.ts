import { IndexedDB } from './IndexedDBUtils'

export const initBaseExercises = async (db: IndexedDB<string>, lang: 'ru' | 'eng') => {
  let baseExercises = null
  try {
    baseExercises = lang === 'ru'
      ? await import('app/constants/base_exercises_ru')
      : await import('app/constants/base_exercises_eng')
  } catch (error) {
    console.error(error)
    throw error
  }

  const { exercises: exercisesTable } = db.tables

  for await (const exercise of baseExercises.default) {
    await db.set(exercisesTable, exercise.id, JSON.stringify(exercise))
  }
}
