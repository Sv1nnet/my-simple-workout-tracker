
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

const parseEntityStr = <T extends { archived: boolean, title: string }>(archivedPostfix: string) => (entity: string): T => {
  const parsed: T = JSON.parse(entity)
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
    const { exercisesTable } = browserDB.getTables()
    const exercise = JSON.parse(await browserDB.db?.get(exercisesTable, id))

    return {
      data: {
        data: exercise,
        success: true,
        error: null,
      },
    }
  },
  list: async (_body?: FetchArgs, _url?: URL, params?: URLSearchParams) => {
    const { exercisesTable, muscleGroupsTable } = browserDB.getTables()
    
    let archived = false
    let workoutId = params?.get('workoutId') || ''
    let lang = params?.get('lang') || JSON.parse(localStorage.getItem('config') || null)?.lang || 'eng'

    if (params) {
      ({ archived } = formatFormData<
      { archived: string },
      { archived: boolean }
      >(
        { archived: params.get('archived') || 'false' },
        { archived: 'bool' },
      ))
    }

    const muscleGroupList = (await browserDB.db?.getAllValues(muscleGroupsTable))
      .filter(Boolean)
      .map(parseEntityStr<MuscleGroupModel>(intl.rest.muscle_group.state.archived[lang]))
      .sort(sortByTitle)

    const list = (await browserDB.db?.getAllValues(exercisesTable))
      .filter(Boolean)
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
    const { muscleGroupsTable } = browserDB.getTables()
    const bodyKeys = body.keys()
    let data: Partial<ExerciseModelConstructorParameter> = {}

    for (let key of bodyKeys) {
      data[key] = body.get(key)
    }

    data = formatFormData(data, fieldsToFormat)

    try {
      const exercise = new ExerciseModel(data as ExerciseModelConstructorParameter)
      const muscleGroupsInExercise = (await browserDB.db?.getAllValues(muscleGroupsTable))
        .filter(Boolean)
        .map(muscleGroup => new MuscleGroupModel(JSON.parse(muscleGroup)))
        .filter(muscleGroup => data.muscle_groups.includes(muscleGroup.id))

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
    const lang = JSON.parse(localStorage.getItem('config') || null)?.lang || 'eng'

    try {
      const allExercises: PlainExerciseObject[] = (await browserDB.db?.getAllValues(exercisesTable)).map(value => JSON.parse(value))
      const exercisesToCopy = allExercises.filter(exercise => ids.find(id => id === exercise.id)).map(exercise => new ExerciseModel(exercise))
      const muscleGroupsInExercises = (await browserDB.db?.getAllValues(muscleGroupsTable))
        .filter(Boolean)
        .map(muscleGroup => JSON.parse(muscleGroup))
        .filter(muscleGroup => exercisesToCopy.some(exercise => exercise.muscle_groups.includes(muscleGroup.id)))
        .map(muscleGroup => new MuscleGroupModel(muscleGroup))

      await Promise.all(exercisesToCopy.map(async (exercise) => {
        let newExercise = new ExerciseModel({
          ...exercise,
          title: `${exercise.title} ${lang === 'ru' ? '(копия)' : '(copy)'}`,
          is_in_workout: false,
          in_workouts: [],
        })
        newExercise.update({ id: EntityModel.createId() })
        newExercise = await newExercise.save()

        const muscleGroupsInNewExercise = muscleGroupsInExercises.filter(muscleGroup => exercisesToCopy.some(_exercise => _exercise.muscle_groups.includes(muscleGroup.id)))
        
        await Promise.all(muscleGroupsInNewExercise.map(muscleGroup => muscleGroup.update({
          is_in_exercise: true,
          in_exercises: [ ...muscleGroup.in_exercises, newExercise.id ],
        }).save()))
        
        return newExercise
      }))
      
      return { data: { data: null, success: true, error: null } }
    } catch (e) {
      if (e.message === imageSizeErrorText) return imageSizeError
      throw e
    }
  },
  update: async ({ body }: { body: FormData }) => {
    const { exercisesTable, workoutsTable, muscleGroupsTable } = browserDB.getTables()
    
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

    const exerciseFromDb = JSON.parse(await browserDB.db?.get(exercisesTable, data.id))

    /**
     * if the same image is sent, then just save itself.
     */
    try {
      const exercise = new ExerciseModel(exerciseFromDb)
      const workouts = (await browserDB.db?.getAllValues(workoutsTable)).map(value => JSON.parse(value))
  
      if (exercise.image) {
        await exercise.image.imageSetter
      }

      const isInWorkout = await exercise.isInWorkout(workouts)
      if (isInWorkout) {
        await exercise.update({ title: restForm.title, description: restForm.description, image: image ? new ImageModel(image) : restForm.image })
      } else {
        await exercise.update(image ? { ...restForm, image: new ImageModel(image) } : restForm)
      }

      const allMuscleGroups = (await browserDB.db?.getAllValues(muscleGroupsTable))
        .filter(Boolean)
        .map(muscleGroup => new MuscleGroupModel(JSON.parse(muscleGroup)))

      const muscleGroupsToRemove = allMuscleGroups.filter(muscleGroup => exerciseFromDb.muscle_groups.includes(muscleGroup.id) && !exercise.muscle_groups.includes(muscleGroup.id))
      const muscleGroupsToAdd = allMuscleGroups.filter(muscleGroup => !exerciseFromDb.muscle_groups.includes(muscleGroup.id) && exercise.muscle_groups.includes(muscleGroup.id))

      await Promise.all(muscleGroupsToRemove.map(muscleGroup => muscleGroup.removeExercise(exercise.id).save()))
      await Promise.all(muscleGroupsToAdd.map(muscleGroup => muscleGroup.addExercise(exercise.id).save()))
  
      await exercise.save()

      return { data: { data: exercise, success: true, error: null } }
    } catch (e) {
      if (e.message === imageSizeErrorText) return imageSizeError
      throw e
    }
  },
  delete: (_args: FetchArgs, url: URL) => {
    const [ id ] = url.pathname.match(UUID_REGEX)
    return handlers.deleteMany({ body: { ids: [ id ] } })
  },
  deleteMany: async ({ body }: { body: { ids: string[] } }) => {
    const { exercisesTable, workoutsTable, muscleGroupsTable } = browserDB.getTables()
    
    const { ids } = body
    const workouts = (await browserDB.db?.getAllValues(workoutsTable))
      .map(workout => JSON.parse(workout))

    const awaitingForDeletingPromises = (await Promise.all(ids.map(id => browserDB.db?.get(exercisesTable, id))))
      .map(exercise => new ExerciseModel(JSON.parse(exercise)))
      .map(async (exercise) => {
        await exercise.delete(workouts)

        for (const muscleGroupId of exercise.muscle_groups) {
          await new MuscleGroupModel(
            JSON.parse(
              await browserDB.db?.get(muscleGroupsTable, muscleGroupId),
            ),
          )
            .removeExercise(exercise.id)
            .save()
        }
        return exercise
      })
    
    await Promise.all(awaitingForDeletingPromises)

    return handlers.list()
  },
}

export default handlers