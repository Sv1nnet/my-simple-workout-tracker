import { WorkoutModel } from './../workout/models/WorkoutModel'
import { FetchArgs } from '@reduxjs/toolkit/dist/query'
import browserDB from '../../BrowserDB'
import { ActivityModelConstructorParameter, ActivityModel } from './models/ActivityModel'
import { ExerciseModel } from '../exercise/models/ExerciseModel'
import { UUID_REGEX } from '../../utils/baseQueryWithReauth'
import formatFormData from '../../utils/formatFormData'

const handlers = {
  get: async (...args: [FetchArgs, URL, URLSearchParams, string]) => {
    const { activitiesTable } = browserDB.getTables()

    const [ ,,,id ] = args
    const activity = JSON.parse(await browserDB.db?.get(activitiesTable, id))

    return {
      data: {
        data: activity,
        success: true,
        error: null,
      },
    }
  },
  list: async (_body?: FetchArgs, _url?: URL, params?: URLSearchParams) => {
    const { activitiesTable, workoutsTable, exercisesTable } = browserDB.getTables()
    
    let page = 1
    let byPage = 30
    let searchValue = ''

    if (params) {
      ({ page, byPage, searchValue } = formatFormData<
      { page: string, byPage: string, searchValue: string },
      { page: number, byPage: number, searchValue: string }
      >(
        { page: params.get('page') || '1', byPage: params.get('byPage') || '30', searchValue: params.get('searchValue').toLowerCase() },
        { page: 'number', byPage: 'number' },
      ))
    }

    const startIndex = ((page - 1) * byPage)
    const endIndex = startIndex + byPage

    const allActivities = (await browserDB.db?.getAllValues(activitiesTable))
      .filter(Boolean)
      .map(activityStr => new ActivityModel(JSON.parse(activityStr)))
      .sort((a, b) => b.index - a.index)
  
    const allExercises = (await browserDB.db?.getAllValues(exercisesTable))
      .filter(Boolean)
      .map(exercise => new ExerciseModel(JSON.parse(exercise)))

    const allWorkouts = (await browserDB.db?.getAllValues(workoutsTable))
      .filter(Boolean)
      .map(workout => new WorkoutModel(JSON.parse(workout)))
      .filter(workout => workout.is_in_activity && workout.title.toLocaleLowerCase().includes(searchValue))

    const totalActivities = allActivities.length
    
    const activitiesByPage = allActivities
      .filter((activity) => {
        const hasActivityWorkout = allWorkouts.some(workout => workout.id === activity.workout_id)
        return hasActivityWorkout
      })
      .slice(startIndex, endIndex)
      .map(({ results, ...activity }) => {
        const workoutInActivity = allWorkouts.find(workout => workout.id === activity.workout_id)
        const exercisesInActivity = (workoutInActivity?.exercises || []).map(({ id }) => allExercises.find(exercise => exercise.id === id))
        const fullResults = results.map((result) => {
          const exercise = exercisesInActivity.find(_exercise => _exercise.id === result.original_id)
          return {
            ...result,
            exercise_title: exercise.title,
            type: exercise.type,
            details: {
              repeats: exercise.repeats,
              time: exercise.time,
              weight: exercise.weight,
              mass_unit: exercise.mass_unit,
            },
          }
        })

        return {
          ...activity,
          results: fullResults,
          workout_title: workoutInActivity?.title || '',
        }
      })

    return { data: { data: { list: activitiesByPage, total: totalActivities }, success: true, error: null } }
  },
  create: async ({ body }: { body: ActivityModelConstructorParameter }) => {
    const { workoutsTable } = browserDB.getTables()

    const activity = new ActivityModel({
      ...body,
      index: new Date(body.date).valueOf(),
    })
    await activity.save()

    const workout = await browserDB.db?.get(workoutsTable, activity.workout_id).then(workoutStr => new WorkoutModel(JSON.parse(workoutStr)))
    await workout
      .addActivity(activity.id)
      .save()

    return { data: activity }
  },
  update: async ({ body }: { body: Partial<ActivityModel> }) => {
    const { activitiesTable } = browserDB.getTables()
    
    const rawActivity = JSON.parse(await browserDB.db?.get(activitiesTable, body.id))
    const activity = new ActivityModel(rawActivity)

    await activity
      .update(body)
      .save()

    return { data: { data: activity, success: true, error: null } }
  },
  delete: (_args: FetchArgs, url: URL) => {
    const [ id ] = url.pathname.match(UUID_REGEX)
    return handlers.deleteMany({ body: { ids: [ id ] } })
  },
  deleteMany: async ({ body }: { body: { ids: string[] } }) => {
    const { activitiesTable, workoutsTable } = browserDB.getTables()

    const { ids } = body

    const awaitingForDeletingPromises = (await Promise.all(ids.map(id => browserDB.db?.get(activitiesTable, id))))
      .map(activity => new ActivityModel(JSON.parse(activity)))
      .map(async (activity) => {
        await activity.delete()

        let workoutInActivity: WorkoutModel = await browserDB.db?.get(workoutsTable, activity.workout_id).then(workout => new WorkoutModel(JSON.parse(workout)))
        workoutInActivity = await workoutInActivity
          .removeFromActivity(activity.id)
          .save()
        
        if (workoutInActivity.archived && !workoutInActivity.is_in_activity) {
          await workoutInActivity.delete([])
        }
        
        return activity
      })
    
    await Promise.all(awaitingForDeletingPromises)

    return handlers.list()
  },
  getHistory: async (_body: FetchArgs, url: URL, params: URLSearchParams) => {
    const { activitiesTable, workoutsTable } = browserDB.getTables()

    const [ workout_id ] = url.pathname.match(UUID_REGEX)

    let page = 1
    let byPage = 30
    let offset = 0
    let activity_id = params.get('activity_id')

    if (params) {
      ({ page, byPage, offset } = formatFormData<
      { page: string, byPage: string, offset: string },
      { page: number, byPage: number, offset: number }
      >(
        { page: params.get('page') || '1', byPage: params.get('byPage') || '30', offset: params.get('offset') || '0' },
        { page: 'number', byPage: 'number', offset: 'number' },
      ))
    }

    const allActivities = (await browserDB.db?.getAllValues(activitiesTable))
    const totalActivities = allActivities.length
    const activitiesWithWorkout = allActivities
      .map(activity => new ActivityModel(JSON.parse(activity)))
      .filter(activity => activity.workout_id === workout_id)
      .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())

    if (activity_id) offset = activitiesWithWorkout.findIndex(activity => activity.id === activity_id) + 1

    const startIndex = ((page - 1) * byPage) + offset
    const endIndex = startIndex + offset + (byPage + 2) // byPage (30 by default) + 2 to get byPage + 1 activities
    const activitiesByPage = activitiesWithWorkout.slice(startIndex, endIndex)

    const workout = await browserDB.db?.get(workoutsTable, workout_id).then(workoutStr => new WorkoutModel(JSON.parse(workoutStr)))
    
    const results = activitiesByPage.reduce((acc, activity) => {
      activity.results.forEach((exerciseResults) => {
        if (!acc[exerciseResults.id_in_workout].total) {
          acc[exerciseResults.id_in_workout].items = []
          acc[exerciseResults.id_in_workout].total = totalActivities
        }
        acc[exerciseResults.id_in_workout].items.push({
          date: activity.date,
          results: exerciseResults.rounds,
        })
      })

      return acc
    }, workout.exercises.reduce((acc, exercise) => {
      acc[exercise._id] = { items: [], total: 0 }
      return acc
    }, {}))

    return { data: { data: results, success: true, error: null } }
  },
}

export default handlers