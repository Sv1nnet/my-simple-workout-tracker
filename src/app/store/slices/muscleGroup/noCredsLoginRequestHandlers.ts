import { FetchArgs } from '@reduxjs/toolkit/dist/query'
import { MuscleGroupModel } from './models/MuscleGroupsModel'
import { UUID_REGEX } from 'app/store/utils/baseQueryWithReauth'
import { ExerciseModel } from 'store/slices/exercise/models/ExerciseModel'

const handlers = {
  get: async (...args: [FetchArgs, URL, URLSearchParams, string]) => {
    const [ ,,,id ] = args    
    const exercise = await ExerciseModel.getOneFromDB(id)

    return {
      data: {
        data: exercise.toPlainObject(),
        success: true,
        error: null,
      },
    }
  },
  list: async (_body?: FetchArgs, _url?: URL) => {
    const list = (await MuscleGroupModel.getAllFromDB())
      .sort((a, b) => {
        if (a.title > b.title) return 1
        else if (a.title < b.title) return -1
        return 0
      })

    return { data: { data: list, success: true, error: null } }
  },
  create: async ({ body: { id: _id, ...restBody } }: { body: MuscleGroupModel }) => {
    const muscleGroup = new MuscleGroupModel({
      ...restBody,
      is_in_exercise: false,
      in_exercises: [],
    })
    await muscleGroup.save()

    return { data: { data: muscleGroup, success: true, error: null } }
  },
  update: async ({ body }: { body: Partial<MuscleGroupModel> }) => {
    const muscleGroupFromDb = await MuscleGroupModel.getOneFromDB(body.id)
    const muscleGroup = new MuscleGroupModel(muscleGroupFromDb)

    muscleGroup.update(body)
  
    await muscleGroup.save()

    return { data: { data: muscleGroup, success: true, error: null } }
  },
  delete: async (_args: FetchArgs, url: URL) => {
    try {
      const [ id ] = url.pathname.match(UUID_REGEX)
      return await handlers.deleteMany({ body: { ids: [ id ] } })
    } catch (error) {
      return { data: { data: null, success: false, error: 'Error deleting muscle group' } }
    }
  },
  deleteMany: async ({ body }: { body: { ids: string[] } }) => {
    const { ids } = body
    const muscleGroups = await MuscleGroupModel.getManyFromDB(ids)
    const exercisesId = [ ...new Set(muscleGroups.map(muscleGroup => muscleGroup.in_exercises).flat()) ]
    const exercises = await ExerciseModel.getManyFromDB(exercisesId)

    muscleGroups.forEach((muscleGroup) => {
      const exercisesInMuscleGroup = exercises.filter(exercise => exercise.muscle_groups.includes(muscleGroup.id))
      exercisesInMuscleGroup.forEach((exercise) => {
        exercise.removeMuscleGroups(muscleGroup.id)
      })
    })

    await ExerciseModel.updateMany(exercises)
    await MuscleGroupModel.deleteMany(muscleGroups)

    return handlers.list()
  },
}

export default handlers