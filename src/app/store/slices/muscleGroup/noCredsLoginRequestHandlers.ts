
import browserDB from 'app/store/utils/BrowserDB'
import formatFormData from 'app/store/utils/formatFormData'
import { FetchArgs } from '@reduxjs/toolkit/dist/query'
import { MuscleGroupModel } from './models/MuscleGroupsModel'
import { UUID_REGEX } from 'app/store/utils/baseQueryWithReauth'
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
    const { muscleGroupsTable } = browserDB.getTables()
    
    let archived = false
    let exerciseId = params?.get('exerciseId') || ''
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

    const list = (await browserDB.db?.getAllValues(muscleGroupsTable))
      .filter(Boolean)
      .map((muscleGroupStr) => {
        const parsed: MuscleGroupModel = JSON.parse(muscleGroupStr)
        if (parsed.archived) parsed.title = `${parsed.title} (${intl.rest.muscle_group.state.archived[lang]})`
        return parsed
      })
      .filter(muscleGroup => muscleGroup.archived ? archived && muscleGroup.in_exercises.includes(exerciseId) : !muscleGroup.archived)
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
      archived: false,
    })
    await muscleGroup.save()

    return { data: { data: muscleGroup, success: true, error: null } }
  },
  update: async ({ body }: { body: Partial<MuscleGroupModel> }) => {
    const { muscleGroupsTable } = browserDB.getTables()
    
    const muscleGroupFromDb = JSON.parse(await browserDB.db?.get(muscleGroupsTable, body.id))
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
    const { exercisesTable, muscleGroupsTable } = browserDB.getTables()
    
    const { ids } = body
    const exercises = (await browserDB.db?.getAllValues(exercisesTable))
      .map(exercise => JSON.parse(exercise))

    const awaitingForDeletingPromises = (await Promise.all(ids.map(id => browserDB.db?.get(muscleGroupsTable, id))))
      .map(muscleGroup => new MuscleGroupModel(JSON.parse(muscleGroup)))
      .map(muscleGroup => muscleGroup.delete(exercises))
    
    await Promise.all(awaitingForDeletingPromises)

    return handlers.list()
  },
}

export default handlers