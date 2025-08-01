import { FetchArgs } from '@reduxjs/toolkit/dist/query'
import { PlainWorkoutObject, WorkoutModel, WorkoutModelConstructorParameter } from './models/WorkoutModel'
import { ExerciseModel } from 'app/store/slices/exercise/models/ExerciseModel'
import { UUID_REGEX } from 'app/store/utils/baseQueryWithReauth'
import formatFormData from 'app/store/utils/formatFormData'
import EntityModel from 'app/store/utils/EntityModel'
import { MuscleGroupModel } from 'store/slices/muscleGroup/models/MuscleGroupsModel'
import { ActivityModel } from 'store/slices/activity/models/ActivityModel'

const handlers = {
  get: async (...args: [FetchArgs, URL, URLSearchParams, string]) => {
    const [ ,,,id ] = args
    const workout = await WorkoutModel.getOneFromDB(id)

    return {
      data: {
        data: workout.toPlainObject(),
        success: true,
        error: null,
      },
    }
  },
  list: async (_body?: FetchArgs, _url?: URL, params?: URLSearchParams) => {
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

    const rawList = (await WorkoutModel.getAllFromDB())
      .filter(Boolean)
      .filter(workout => all || archived === workout.archived || !workout.archived || workout.in_activities.includes(in_activity))
      .sort((a, b) => {
        if (a.title > b.title) return 1
        else if (a.title < b.title) return -1
        return 0
      })

    const allExercises = await ExerciseModel.getAllFromDB()
    const allMuscleGroups = await MuscleGroupModel.getAllFromDB()

    const preparedList = await Promise.all(rawList.map(async (rawWorkout: WorkoutModelConstructorParameter) => {
      const exerciseIds = rawWorkout.exercises.map(({ id }) => id)
      const exercisesInWorkout = allExercises
        .filter((({ id }) => exerciseIds.includes(id)))
        .map((exercise) => {
          const muscleGroups = exercise
            .muscle_groups
            .map((muscleGroupId) => {
              const muscleGroup = allMuscleGroups.find(_muscleGroup => _muscleGroup.id === muscleGroupId)

              return muscleGroup ? {
                id: muscleGroup.id,
                title: muscleGroup.title,
              } : null
            })
            .filter(Boolean)

          return {
            ...exercise,
            muscle_groups: muscleGroups,
          }
        })

      const sortedExercises = []
      exerciseIds.forEach((exerciseId, index) => {
        const indexInExercises = exercisesInWorkout.findIndex(({ id }) => id === exerciseId)
        sortedExercises[index] = exercisesInWorkout[indexInExercises]
      })

      const muscleGroupsInWorkout = [
        ...sortedExercises
          .reduce((acc, { muscle_groups }) => {
            muscle_groups.forEach(({ id }) => acc.add(id))
            return acc
          }, new Set()),
      ]
        .map(id => allMuscleGroups.find(muscleGroup => muscleGroup.id === id))

      return {
        ...rawWorkout,
        muscle_groups: muscleGroupsInWorkout,
        exercises: rawWorkout.exercises.map(({ ...exercise }, index) => ({
          ...exercise,
          details: sortedExercises[index],
        })),
      }
    }))

    return { data: { data: preparedList, success: true, error: null } }
  },
  create: async ({ body }: { body: WorkoutModel }) => {
    const workout = new WorkoutModel(body)    
    const exercisesInWorkout = await ExerciseModel.getManyFromDB(workout.exercises.map(exercise => exercise.id))

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
    const workout = await WorkoutModel.getOneFromDB(body.id)
    const exercisesInWorkout = workout.exercises
    const activities = await ActivityModel.getAllFromDB()

    const isInActivity = await workout.isInActivity(activities)
    if (isInActivity) {
      workout.update({
        ...body,
        exercises: body.exercises.map((exercise, index) => ({
          ...workout.exercises[index],
          repeats: exercise.repeats,
          weight: exercise.weight,
          time: exercise.time,
          round_break: exercise.round_break,
          break: exercise.break,
          break_enabled: exercise.break_enabled,
        })),
      })
    } else {
      workout.update(body)
    }

    const removedExerciseIds = exercisesInWorkout
      .filter(exercise => !workout
        .exercises
        .find(exerciseInUpdatedWorkout => exerciseInUpdatedWorkout.id === exercise.id))
      .map(({ id }) => id)

    if (removedExerciseIds.length) {
      const exercisesToUpdate = await ExerciseModel.getManyFromDB(removedExerciseIds)

      for (const exercise of exercisesToUpdate) {
        exercise.removeWorkout(workout.id)
        await exercise.save()
      }
    }

    if (workout.exercises.length) {
      const exercisesToUpdate = await ExerciseModel.getManyFromDB(workout.exercises.map(exercise => exercise.id))

      for (const exercise of exercisesToUpdate) {
        exercise.addWorkout(workout.id)
        await exercise.save()
      }
    }
  
    await workout.save()

    return { data: { data: workout, success: true, error: null } }
  },
  copy: async ({ body }: { body: { ids: string[] } }) => {
    const { ids = [] } = body
    const lang = JSON.parse(localStorage.getItem('settings') || null)?.lang || 'eng'

    const workoutsToCopy = await WorkoutModel.getManyFromDB(ids)

    const newWorkouts = []
    for (const workout of workoutsToCopy) {
      const newWorkout = new WorkoutModel({
        ...workout,
        title: `${workout.title} ${lang === 'ru' ? '(копия)' : '(copy)'}`,
      })
      newWorkout.update({ id: EntityModel.createId() })
      newWorkouts.push(newWorkout)
    }

    await WorkoutModel.updateMany(newWorkouts)

    const exercisesToUpdate = await ExerciseModel.getManyFromDB([ ...new Set(newWorkouts.flatMap(workout => workout.exercises.map(exercise => exercise.id))) ])
    for (const workout of newWorkouts) {
      const exercisesInNewWorkout = exercisesToUpdate.filter(exercise => workout.exercises.find(workoutExercise => workoutExercise.id === exercise.id))
      exercisesInNewWorkout.forEach((exercise) => {
        exercise.addWorkout(workout.id)
      })
    }
    
    await ExerciseModel.updateMany(exercisesToUpdate)
      
    return { data: { data: null, success: true, error: null } }
  },
  restore: async () => {
    try {
      const settings = JSON.parse(localStorage.getItem('settings') || null)
      const lang = settings?.lang || 'eng'
  
      const defaultWorkouts = await (lang === 'ru' ? import('app/constants/base_workouts_ru') : import('app/constants/base_workouts_eng'))
      const workouts = defaultWorkouts.default.map(workout => new WorkoutModel(workout as PlainWorkoutObject))

      await WorkoutModel.updateMany(workouts)

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
    const activities = await ActivityModel.getAllFromDB()

    const workouts = await WorkoutModel.getManyFromDB(ids)
    let toArchive: WorkoutModel[] = []
    let toDelete: WorkoutModel[] = []

    for (const workout of workouts) {
      if (await workout.isInActivity(activities)) {
        toArchive.push(workout)
      } else {
        toDelete.push(workout)
      }
    }

    toArchive.forEach(workout => workout.archive())
    await WorkoutModel.updateMany(toArchive)
    await WorkoutModel.deleteMany(toDelete)

    const exercisesInWorkouts = await ExerciseModel.getManyFromDB([ ...new Set(toDelete.flatMap(workout => workout.exercises.map(exercise => exercise.id))) ])
    for (const workout of toDelete) {
      const exercisesInWorkout = exercisesInWorkouts.filter(exercise => workout.exercises.find(workoutExercise => workoutExercise.id === exercise.id))
      exercisesInWorkout.forEach((exercise) => {
        exercise.removeWorkout(workout.id)
      })
    }

    await ExerciseModel.updateMany(exercisesInWorkouts)

    return handlers.list()
  },
}

export default handlers