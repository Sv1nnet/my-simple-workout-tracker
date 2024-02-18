
import browserDB from '../../BrowserDB'
import formatFormData from '../../utils/formatFormData'
import { FetchArgs } from '@reduxjs/toolkit/dist/query'
import { ExerciseModel, ExerciseModelConstructorParameter } from './models/ExerciseModel'
import { ImageFields, ImageModel, imageSizeErrorText } from './models/ImageModel'
import { fieldsToFormat, imageSizeError, mapFormDataToImageAndRestForm } from './utils'
import { UUID_REGEX } from '../../utils/baseQueryWithReauth'
// eslint-disable-next-line import/extensions
import intl from 'app/constants/intl.json'

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
    const { exercisesTable } = browserDB.getTables()
    
    let archived = false
    let workoutId = params?.get('workoutId') || ''
    let lang = params?.get('lang') || 'eng'

    if (params) {
      ({ archived } = formatFormData<
      { archived: string },
      { archived: boolean }
      >(
        { archived: params.get('archived') || 'false' },
        { archived: 'bool' },
      ))
    }

    const list = (await browserDB.db?.getAllValues(exercisesTable))
      .filter(Boolean)
      .map((exerciseStr) => {
        const parsed: ExerciseModel = JSON.parse(exerciseStr)
        if (parsed.archived) parsed.title = `${parsed.title} (${intl.pages.exercises.state.archived[lang]})`
        return parsed
      })
      .filter(exercise => exercise.archived ? archived && exercise.in_workouts.includes(workoutId) : !exercise.archived)
      .sort((a, b) => {
        if (a.title > b.title) return 1
        else if (a.title < b.title) return -1
        return 0
      })

    return { data: { data: list, success: true, error: null } }
  },
  create: async ({ body }: { body: FormData }) => {
    const bodyKeys = body.keys()
    let data: Partial<ExerciseModelConstructorParameter> = {}

    for (let key of bodyKeys) {
      data[key] = body.get(key)
    }

    data = formatFormData(data, fieldsToFormat)

    try {
      const exercise = new ExerciseModel(data as ExerciseModelConstructorParameter)
      
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
  update: async ({ body }: { body: FormData }) => {
    const { exercisesTable, workoutsTable } = browserDB.getTables()
    
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
    const { exercisesTable, workoutsTable } = browserDB.getTables()
    
    const { ids } = body
    const workouts = (await browserDB.db?.getAllValues(workoutsTable))
      .map(workout => JSON.parse(workout))

    const awaitingForDeletingPromises = (await Promise.all(ids.map(id => browserDB.db?.get(exercisesTable, id))))
      .map(exercise => new ExerciseModel(JSON.parse(exercise)))
      .map(exercise => exercise.delete(workouts))
    
    await Promise.all(awaitingForDeletingPromises)

    return handlers.list()
  },
}

export default handlers