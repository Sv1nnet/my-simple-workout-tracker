import ruExercises from 'app/constants/base_exercises_ru'
import enExercises from 'app/constants/base_exercises_en'
import { IndexedDB } from './IndexedDBUtils'

export const initBaseExercises = async (db: IndexedDB<string>, lang: 'ru' | 'eng') => {
  const exercises = lang === 'ru' ? ruExercises : enExercises

  const { exercises: exercisesTable } = db.tables

  for await (const exercise of exercises) {
    await db.set(exercisesTable, exercise.id, JSON.stringify(exercise))
  }
}
