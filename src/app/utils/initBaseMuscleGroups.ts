import { IndexedDB } from './IndexedDBUtils'

export const initBaseMuscleGroups = async (db: IndexedDB<string>, lang: 'ru' | 'eng') => {
  let baseMuscleGroups = null
  try {
    baseMuscleGroups = lang === 'ru'
      ? await import('app/constants/base_muscle_groups_ru')
      : await import('app/constants/base_muscle_groups_eng')
  } catch (error) {
    console.error(error)
    throw error
  }

  const { muscleGroups: muscleGroupsTable } = db.tables

  for await (const muscleGroup of baseMuscleGroups.default) {
    await db.set(muscleGroupsTable, muscleGroup.id, JSON.stringify(muscleGroup))
  }
}
