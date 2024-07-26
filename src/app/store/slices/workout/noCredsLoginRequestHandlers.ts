import { FetchArgs } from '@reduxjs/toolkit/dist/query'
import browserDB from 'app/store/utils/BrowserDB'
import { PlainWorkoutObject, WorkoutModel, WorkoutModelConstructorParameter } from './models/WorkoutModel'
import { ExerciseModel, PlainExerciseObject } from 'app/store/slices/exercise/models/ExerciseModel'
import { UUID_REGEX } from 'app/store/utils/baseQueryWithReauth'
import formatFormData from 'app/store/utils/formatFormData'
import EntityModel from 'app/store/utils/EntityModel'
import { WorkoutExerciseModel } from './models/WorkoutExerciseModel'

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
        exercise.removeWorkout(workout.id)
        await exercise.save()
      }
    }
  
    await workout.save()

    return { data: { data: workout, success: true, error: null } }
  },
  copy: async ({ body }: { body: { ids: string[] } }) => {
    const { exercisesTable, workoutsTable } = browserDB.getTables()
    const { ids = [] } = body
    const lang = JSON.parse(localStorage.getItem('config') || null)?.lang || 'eng'

    const allWorkouts: PlainWorkoutObject[] = (await browserDB.db?.getAllValues(workoutsTable)).map(value => JSON.parse(value))
    const workoutsToCopy = allWorkouts.filter(workout => ids.find(id => id === workout.id)).map(workout => new WorkoutModel(workout))

    const newWorkouts = await Promise.all(workoutsToCopy.map(async (workout) => {
      let newWorkout = await new WorkoutModel({
        ...workout,
        title: `${workout.title} ${lang === 'ru' ? '(копия)' : '(copy)'}`,
      })
      newWorkout.update({ id: EntityModel.createId() })
      newWorkout = await newWorkout.save()
        
      return newWorkout
    }))
    
    const allExercises: PlainExerciseObject[] = (await browserDB.db?.getAllValues(exercisesTable)).map(value => JSON.parse(value))
    const exercisesToUpdate = workoutsToCopy
      .reduce<WorkoutExerciseModel[]>((acc, { exercises }) => {
      const exercisesToAdd = exercises.filter(exercise => !acc.find(_exercise => _exercise.id === exercise.id))
      return acc.concat(exercisesToAdd)
    }, [])
      .reduce<ExerciseModel[]>((acc, workoutExercise) => {
      const exercise = allExercises.find(_exercise => _exercise.id === workoutExercise.id)
        
      if (exercise) {
        acc.push(new ExerciseModel(exercise))
      }
      
      return acc
    }, [])    
    
    await Promise.all(exercisesToUpdate.map(async (exercise) => {
      const workoutsToAddToExercise = newWorkouts.filter(workout => workout.exercises.find(_exercise => _exercise.id === exercise.id))

      return Promise.all(
        workoutsToAddToExercise.map(async workout => exercise
          .addWorkout(workout.id)
          .save()),
      )
    }))
      
    return { data: { data: null, success: true, error: null } }
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
            .removeWorkout(workout.id)
            .save()            
        }
        return workout
      })
    
    await Promise.all(awaitingForDeletingPromises)

    return handlers.list()
  },
}

export default handlers