import { FetchArgs } from '@reduxjs/toolkit/dist/query'
import browserDB from '../../BrowserDB'
import { WorkoutModel, WorkoutModelConstructorParameter } from './models/WorkoutModel'
import { ExerciseModel } from '../exercise/models/ExerciseModel'
import EntityModel from '../../utils/EntityModel'
import { UUID_REGEX } from '../../utils/baseQueryWithReauth'
import formatFormData from '../../utils/formatFormData'

const handlers = {
  get: async (...args: [FetchArgs, URL, URLSearchParams, string]) => {
    const { workoutsTable } = browserDB.getTables()

    const [ ,,,id ] = args
    const workout = JSON.parse(await browserDB.db.get(workoutsTable, id))

    return {
      data: {
        data: workout,
        success: true,
        error: null,
      },
    }
  },
  list: async (_body?: FetchArgs, _url?: URL, params?: URLSearchParams) => {
    const { workoutsTable, exercisesTable } = browserDB.getTables()

    let archived = false
    let all = false
    let in_activity = params?.get('in_activity') ?? ''

    if (params) {
      ({ archived, all } = formatFormData<
      { archived: string, all: string },
      { archived: boolean, all: boolean }
      >(
        { archived: params.get('archived') || 'false', all: params.get('all') || 'false' },
        { archived: 'bool', all: 'bool' },
      ))
    }

    const rawList = (await browserDB.db?.getAllValues(workoutsTable))
      .filter(Boolean)
      .map(workoutStr => JSON.parse(workoutStr))
      .filter(workout => all || archived === workout.archived || !workout.archived || workout.in_activities.includes(in_activity))
      .sort((a, b) => {
        if (a.title > b.title) return 1
        else if (a.title < b.title) return -1
        return 0
      })

    const allExercises = (await browserDB.db?.getAllValues(exercisesTable))
      .filter(Boolean)
      .map(exercise => JSON.parse(exercise))

    const preparedList = await Promise.all(rawList.map(async (rawWorkout: WorkoutModelConstructorParameter) => {
      const exerciseIds = rawWorkout.exercises.map(({ id }) => id)
      const exercisesInWorkout = allExercises.filter((({ id }) => exerciseIds.includes(id)))

      const sortedExercises = []
      exerciseIds.forEach((exerciseId, index) => {
        const indexInExercises = exercisesInWorkout.findIndex(({ id }) => id === exerciseId)
        sortedExercises[index] = exercisesInWorkout[indexInExercises]
      })

      return {
        ...rawWorkout,
        exercises: rawWorkout.exercises.map(({ ...exercise }, index) => ({
          ...exercise,
          exercise: sortedExercises[index],
        })),
      }

    }))

    return { data: { data: preparedList, success: true, error: null } }
  },
  create: async ({ body }: { body: WorkoutModel }) => {
    const { exercisesTable } = browserDB.getTables()
    const workout = new WorkoutModel(body)
    const exercisesInWorkout = (await Promise.all(workout.exercises.map(exercise => browserDB.db?.get(exercisesTable, exercise.id))))
      .filter(Boolean)
      .map(exercise => new ExerciseModel(JSON.parse(exercise)))

    await Promise.all(exercisesInWorkout.map(async exercise => 
      (await exercise.update({
        image: exercise.image,
        is_in_workout: true,
        in_workouts: [ ...exercise.in_workouts, workout.id ],
      })).save()))

    await workout.save()

      
    return { data: workout }
  },
  update: async ({ body }: { body: Partial<WorkoutModel> }) => {
    const { activitiesTable, workoutsTable, exercisesTable } = browserDB.getTables()
    
    const workoutFromDb = JSON.parse(await browserDB.db?.get(workoutsTable, body.id))
    const workout = new WorkoutModel(workoutFromDb)
    const exercisesInWorkout = workout.exercises
    const activities = (await browserDB.db?.getAllValues(activitiesTable)).map(value => JSON.parse(value))

    const isInActivity = await workout.isInActivity(activities)
    if (isInActivity) {
      workout.update({
        ...body,
        exercises: body.exercises.map((exercise, index) => ({
          ...workout.exercises[index],
          round_break: exercise.round_break,
          break: exercise.break,
          break_enabled: exercise.break_enabled,
        })),
      })
    } else {
      workout.update(body)
    }

    const removedExerciseIds = exercisesInWorkout
      .filter(exercise => workout
        .exercises
        .find(exerciseInUpdatedWorkout => exerciseInUpdatedWorkout.id === exercise.id))
      .map(({ id }) => id)

    if (removedExerciseIds.length) {
      const exercisesToUpdate = (await Promise.all(
        removedExerciseIds.map(id => browserDB.db?.get(exercisesTable, id)),
      ))
        .filter(Boolean)
        .map(exerciseStr => new ExerciseModel(JSON.parse(exerciseStr)))

      for (const exercise of exercisesToUpdate) {
        exercise.removeFromWorkout(workout.id)
        await exercise.save()
      }
    }
  
    await workout.save()

    return { data: { data: workout, success: true, error: null } }
  },
  delete: (_args: FetchArgs, url: URL) => {
    const [ id ] = url.pathname.match(UUID_REGEX)
    return handlers.deleteMany({ body: { ids: [ id ] } })
  },
  deleteMany: async ({ body }: { body: { ids: string[] } }) => {
    const { activitiesTable, workoutsTable, exercisesTable } = browserDB.getTables()
    
    const { ids } = body
    const activities = (await browserDB.db?.getAllValues(activitiesTable))
      .map(activity => JSON.parse(activity))

    const awaitingForDeletingPromises = (await Promise.all(ids.map(id => browserDB.db?.get(workoutsTable, id))))
      .map(workout => new WorkoutModel(JSON.parse(workout)))
      .map(async (workout) => {
        await workout.delete(activities)
        
        const exerciseIds = workout.exercises.map(({ id }) => id)
        for (const exerciseId of exerciseIds) {
          await new ExerciseModel(
            JSON.parse(
              await browserDB.db?.get(exercisesTable, exerciseId),
            ),
          )
            .removeFromWorkout(workout.id)
            .save()            
        }
        return workout
      })
    
    await Promise.all(awaitingForDeletingPromises)

    return handlers.list()
  },
  copy: async ({ body }) => {
    const { exercisesTable } = browserDB.getTables()
    
    const { ids } = body

    const awaitingForSavingPromises = (await Promise.all(ids.map(id => browserDB.db?.get(exercisesTable, id))))
      .filter(Boolean)
      .map(async (exerciseStr: string) => {
        const exercise = new ExerciseModel(JSON.parse(exerciseStr))
        exercise.update({ id: EntityModel.createId(), title: `${exercise.title} (Copy)` })
        return exercise.save()
      })

    await Promise.all(awaitingForSavingPromises)

    return handlers.list()
  },
}

export default handlers