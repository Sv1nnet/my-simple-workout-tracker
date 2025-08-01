
import browserDB from 'app/store/utils/BrowserDB'
import formatFormData from 'app/store/utils/formatFormData'
import { FetchArgs } from '@reduxjs/toolkit/dist/query'
import { ExerciseModel, ExerciseModelConstructorParameter, PlainExerciseObject } from './models/ExerciseModel'
import { ImageFields, ImageModel, imageSizeErrorText } from './models/ImageModel'
import { fieldsToFormat, imageSizeError, mapFormDataToImageAndRestForm } from './utils'
import { UUID_REGEX } from 'app/store/utils/baseQueryWithReauth'
// eslint-disable-next-line import/extensions
import intl from 'app/constants/intl.json'
import EntityModel from 'store//utils/EntityModel'
import { MuscleGroupModel } from 'store/slices/muscleGroup/models/MuscleGroupsModel'
import { GetExerciseServerPayload } from './types'
import { WorkoutModel } from 'store/slices/workout/models/WorkoutModel'
import { ActivityModel } from 'store/slices/activity/models/ActivityModel'
import { parseIfString } from 'app/utils/parsers'

const parseEntityStr = <T extends { archived?: boolean, title: string }>(archivedPostfix: string) => (entity: string | T): T => {
  const parsed: T = parseIfString<T>(entity)
  if (parsed.archived) parsed.title = `${parsed.title} (${archivedPostfix})`
  return parsed
}

const sortByTitle = (a: { title: string }, b: { title: string }) => {
  if (a.title > b.title) return 1
  else if (a.title < b.title) return -1
  return 0
}

const handlers = {
  get: async (...args: [FetchArgs, URL, URLSearchParams, string]) => {
    const [ ,,,id ] = args
    const exercise = await ExerciseModel.getOneFromDB(id)

    let isInActivity = false

    if (exercise.in_workouts.length) {
      const allActivities = await ActivityModel.getAllFromDB()

      const workouts = (await WorkoutModel.getAllFromDB())
        .filter(workout => exercise.in_workouts.includes(workout.id))
        .map(workout => new WorkoutModel(workout))

      for (const workout of workouts) {
        if (await workout.isInActivity(allActivities)) {
          isInActivity = true
          break
        }
      }
    }

    return {
      data: {
        data: {
          ...exercise,
          image: exercise.image?.toPlainObject(),
          is_in_activity: isInActivity, // to prevent from changing type of payload
        },
        success: true,
        error: null,
      },
    }
  },
  list: async (_body?: FetchArgs, _url?: URL, params?: URLSearchParams) => {
    let archived = false
    let workoutId = params?.get('workoutId') || ''
    let lang = params?.get('lang') || JSON.parse(localStorage.getItem('settings') || null)?.lang || 'eng'

    if (params) {
      ({ archived } = formatFormData<
      { archived: string },
      { archived: boolean }
      >(
        { archived: params.get('archived') || 'false' },
        { archived: 'bool' },
      ))
    }

    const muscleGroupList = (await MuscleGroupModel.getAllFromDB())
      .map(parseEntityStr<MuscleGroupModel>(intl.rest.muscle_group.state.archived[lang]))
      .sort(sortByTitle)

    const list = (await ExerciseModel.getAllFromDB())
      .map(parseEntityStr<ExerciseModel>(intl.pages.exercises.state.archived[lang]))
      .filter(exercise => exercise.archived ? archived && exercise.in_workouts.includes(workoutId) : !exercise.archived)
      .map(exercise => ({
        ...exercise,
        muscle_groups: exercise.muscle_groups.reduce((acc, id) => {
          const muscleGroupInExercise = muscleGroupList.find(muscleGroup => muscleGroup.id === id)
          if (muscleGroupInExercise) acc.push({ id: muscleGroupInExercise.id, title: muscleGroupInExercise.title })
          return acc
        }, []),
      } as GetExerciseServerPayload))
      .sort(sortByTitle)

    return { data: { data: list, success: true, error: null } }
  },
  create: async ({ body }: { body: FormData }) => {
    const bodyKeys = body.keys()
    let data: Partial<ExerciseModelConstructorParameter> = {}

    for (let key of bodyKeys) {
      data[key] = body.get(key)
    }

    let image = data.image
    let restForm = formatFormData<typeof data, typeof data & ImageFields>(data, fieldsToFormat)

    if (!image) {
      ({ image, restForm } = mapFormDataToImageAndRestForm(restForm))
    }

    try {
      const exercise = new ExerciseModel({ ...restForm, image } as ExerciseModelConstructorParameter)
      const muscleGroupsInExercise = (await MuscleGroupModel.getAllFromDB())
        .filter(muscleGroup => restForm.muscle_groups.includes(muscleGroup.id))

      await Promise.all(muscleGroupsInExercise.map(muscleGroup => muscleGroup.update({
        is_in_exercise: true,
        in_exercises: [ ...muscleGroup.in_exercises, exercise.id ],
      }).save()))
      
      if (exercise.image) {
        await exercise.image.imageSetter
      }

      await exercise.save()
      
      return { data: exercise }
    } catch (e) {
      if (e.message === imageSizeErrorText) return imageSizeError
      throw e
    }
  },
  copy: async ({ body }: { body: { ids: string[] } }) => {
    const { exercisesTable, muscleGroupsTable } = browserDB.getTables()
    const { ids = [] } = body
    const lang = JSON.parse(localStorage.getItem('settings') || null)?.lang || 'eng'

    try {
      const allExercises = await ExerciseModel.getAllFromDB()
      const exercisesToCopy = allExercises.filter(exercise => ids.find(id => id === exercise.id)).map(exercise => new ExerciseModel(exercise))
      const muscleGroupsInExercises = (await MuscleGroupModel.getAllFromDB())
        .filter(muscleGroup => exercisesToCopy.some(exercise => exercise.muscle_groups.includes(muscleGroup.id)))
        .map(muscleGroup => new MuscleGroupModel(muscleGroup))

      // Create all new exercises with new IDs
      const newExercises = exercisesToCopy.map((exercise) => {
        const newExercise = new ExerciseModel({
          ...exercise,
          title: `${exercise.title} ${lang === 'ru' ? '(копия)' : '(copy)'}`,
          is_in_workout: false,
          in_workouts: [],
        })
        newExercise.update({ id: EntityModel.createId() })
        return newExercise
      })

      // Batch insert all new exercises using batchInsert method
      const exerciseDataToInsert = newExercises.map(exercise => ({
        key: exercise.id,
        value: exercise.toPlainObject(),
      }))

      await browserDB.db?.batchInsert(exercisesTable, exerciseDataToInsert)

      // Update muscle groups for all new exercises
      const muscleGroupUpdates = newExercises.flatMap((newExercise) => {
        const muscleGroupsInNewExercise = muscleGroupsInExercises.filter(muscleGroup => 
          newExercise.muscle_groups.includes(muscleGroup.id))
        
        return muscleGroupsInNewExercise.map(muscleGroup => muscleGroup.update({
          is_in_exercise: true,
          in_exercises: [ ...muscleGroup.in_exercises, newExercise.id ],
        }))
      })

      await browserDB.db?.batchUpdate(muscleGroupsTable, muscleGroupUpdates.map(muscleGroup => ({
        key: muscleGroup.id,
        value: muscleGroup.toPlainObject(),
      })))
      
      return { data: { data: null, success: true, error: null } }
    } catch (e) {
      if (e.message === imageSizeErrorText) return imageSizeError
      throw e
    }
  },
  update: async ({ body }: { body: FormData }) => {
    const { exercisesTable, muscleGroupsTable } = browserDB.getTables()
    
    const bodyKeys = body.keys()
    let data: Partial<ExerciseModel & Partial<ImageFields>> = {}

    for (let key of bodyKeys) {
      data[key] = body.get(key)
    }

    let image = data.image
    let restForm = formatFormData<typeof data, typeof data & ImageFields>(data, fieldsToFormat)

    if (!image) {
      ({ image, restForm } = mapFormDataToImageAndRestForm(restForm))
    }

    const rawExerciseFromDb = await browserDB.db?.get(exercisesTable, data.id)
    const exercise = new ExerciseModel(parseIfString<PlainExerciseObject>(rawExerciseFromDb))

    try {
      // const exercise = new ExerciseModel(exerciseFromDb)
      const workouts = await WorkoutModel.getAllFromDB()

      /**
       * if the same image is sent, then just save itself.
       */
      if (exercise.image) {
        await exercise.image.imageSetter
      }

      const inWorkouts = await exercise.inWorkouts(workouts)
      const isInWorkout = !!inWorkouts.length
      let isWorkoutInActivity = false

      if (isInWorkout) {
        for (let workout of inWorkouts) {
          isWorkoutInActivity = await workout.isInActivity()

          if (isWorkoutInActivity) break
        }
      }

      if (isWorkoutInActivity) {
        await exercise.update({ title: restForm.title, description: restForm.description, image: image ? new ImageModel(image) : restForm.image })
      } else {
        await exercise.update(image ? { ...restForm, image: new ImageModel(image) } : restForm)
      }

      const allMuscleGroups = await MuscleGroupModel.getAllFromDB()

      const muscleGroupsToRemove = allMuscleGroups.filter(muscleGroup => !exercise.muscle_groups.includes(muscleGroup.id))
      const muscleGroupsToAdd = allMuscleGroups.filter(muscleGroup => exercise.muscle_groups.includes(muscleGroup.id) && !muscleGroup.in_exercises.includes(exercise.id))

      let muscleGroupsToUpdate = []
      muscleGroupsToRemove.forEach((muscleGroup) => {
        muscleGroup.removeExercise(exercise.id)
        muscleGroupsToUpdate.push(muscleGroup)
      })
      muscleGroupsToAdd.forEach((muscleGroup) => {
        muscleGroup.addExercise(exercise.id)
        muscleGroupsToUpdate.push(muscleGroup)
      })

      await browserDB.db?.batchUpdate(muscleGroupsTable, muscleGroupsToUpdate.map(muscleGroup => ({
        key: muscleGroup.id,
        value: muscleGroup.toPlainObject(),
      })))
  
      await exercise.save()

      return { data: { data: exercise, success: true, error: null } }
    } catch (e) {
      if (e.message === imageSizeErrorText) return imageSizeError
      throw e
    }
  },
  restore: async () => {
    try {
      const settings = JSON.parse(localStorage.getItem('settings') || null)
      const lang = settings?.lang || 'eng'
  
      const defaultExercises = await (lang === 'ru' ? import('app/constants/base_exercises_ru') : import('app/constants/base_exercises_eng'))
      const exercises = defaultExercises.default.map(exercise => new ExerciseModel(exercise as PlainExerciseObject))

      await ExerciseModel.updateMany(exercises)

      return {
        data: null,
        success: true,
        error: null,
      }
    } catch (e) {
      return {
        data: null,
        success: false,
        error: e.message,
      }
    }
  },
  delete: (_args: FetchArgs, url: URL) => {
    const [ id ] = url.pathname.match(UUID_REGEX)
    return handlers.deleteMany({ body: { ids: [ id ] } })
  },
  deleteMany: async ({ body }: { body: { ids: string[] } }) => {
    const { ids } = body
    const workouts = await WorkoutModel.getAllFromDB()

    const exercises = await ExerciseModel.getManyFromDB(ids)
    const muscleGroupIds = exercises.flatMap(exercise => exercise.muscle_groups)
    const muscleGroupsToRemoveExercise = await MuscleGroupModel.getManyFromDB(muscleGroupIds)

    let toArchive = []
    let toDelete = []

    for (const exercise of exercises) {
      if (await exercise.isInWorkout(workouts)) {
        toArchive.push(exercise)
      } else {
        toDelete.push(exercise)
      }
    }

    await ExerciseModel.deleteMany(toDelete)

    toArchive.forEach(exercise => exercise.archive())
    await ExerciseModel.updateMany(toArchive)

    let muscleGroupsToUpdate = []
    exercises.forEach((exercise) => {
      exercise.muscle_groups.forEach((muscleGroupId) => {
        const muscleGroup = muscleGroupsToRemoveExercise.find(_muscleGroup => _muscleGroup.id === muscleGroupId)

        if (muscleGroup) {
          muscleGroup.removeExercise(exercise.id)
          muscleGroupsToUpdate.push(muscleGroup)
        }
      })
    })

    await MuscleGroupModel.updateMany(muscleGroupsToUpdate)

    return handlers.list()
  },
}

export default handlers