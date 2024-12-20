import { IndexedDB, IndexedDBTable } from './IndexedDBUtils'

const importData = (lang: 'ru' | 'eng') => lang === 'ru' ? [
  import('app/constants/base_muscle_groups_ru'),
  import('app/constants/base_exercises_ru'),
  import('app/constants/base_workouts_ru'),
] : [
  import('app/constants/base_muscle_groups_eng'),
  import('app/constants/base_exercises_eng'),
  import('app/constants/base_workouts_eng'),
]

type LoadBaseDataResult = {
  errors: {
    muscleGroups: Error | null
    exercises: Error | null
    workouts: Error | null
  } | null,
  data: {
    muscleGroups: Record<string, any>[]
    exercises: Record<string, any>[]
    workouts: Record<string, any>[]
  } | null,
}

const namesInQueue = [ 'muscleGroups', 'exercises', 'workouts' ]

const loadBaseData = async (lang: 'ru' | 'eng'): Promise<LoadBaseDataResult> => {
  const baseData = (await Promise.allSettled(importData(lang)))
    .reduce<LoadBaseDataResult>((acc, res, index) => {
    if (res.status !== 'fulfilled') {
      if (!acc.errors) {
        acc.errors = {
          muscleGroups: null,
          exercises: null,
          workouts: null,
        }
      }
      acc.errors[namesInQueue[index]] = new Error(res.reason)
    } else {
      if (!acc.data) {
        acc.data = {
          muscleGroups: [],
          exercises: [],
          workouts: [],
        }
      }
      acc.data[namesInQueue[index]] = res.value.default
    }
    return acc
  }, {
    errors: null,
    data: null,
  })

  return baseData
}

const setBaseDataInDb = async (db: IndexedDB<string>, table: IndexedDBTable<string>, data: Record<string, any>[]) => {
  for (const item of data) {
    await db.set(table, item.id, JSON.stringify(item))
  }
}

export const initBaseData = async (db: IndexedDB<string>, lang: 'ru' | 'eng') => {
  const { errors, data } = await loadBaseData(lang)

  if (errors) {
    throw new Error(`Failed to initialize base data: could not load ${Object.keys(errors).join(', ')}`)
  }

  const { muscleGroups, exercises, workouts } = data

  await setBaseDataInDb(db, db.tables.muscleGroups, muscleGroups)
  await setBaseDataInDb(db, db.tables.exercises, exercises)
  await setBaseDataInDb(db, db.tables.workouts, workouts)
}
