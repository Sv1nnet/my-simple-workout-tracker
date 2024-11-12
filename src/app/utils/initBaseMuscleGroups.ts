import ruMuscleGroups from 'app/constants/base_muscle_groups_ru'
import enMuscleGroups from 'app/constants/base_muscle_groups_en'
import { IndexedDB } from './IndexedDBUtils'

export const initBaseMuscleGroups = async (db: IndexedDB<string>, lang: 'ru' | 'eng') => {
  const muscleGroups = lang === 'ru' ? ruMuscleGroups : enMuscleGroups

  const { muscleGroups: muscleGroupsTable } = db.tables

  for await (const muscleGroup of muscleGroups) {
    await db.set(muscleGroupsTable, muscleGroup.id, JSON.stringify(muscleGroup))
  }
}
