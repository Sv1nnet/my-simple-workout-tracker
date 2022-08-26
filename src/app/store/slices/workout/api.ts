import { createApi } from '@reduxjs/toolkit/query/react'
import {
  WorkoutForm,
  GetWorkoutSuccess,
  WorkoutCreateSuccess,
  WorkoutUpdateSuccess,
  WorkoutDeleteSuccess,
  GetWorkoutListSuccess,
  WorkoutServerPayload,
} from './types'
import routes from 'constants/end_points'
import getBaseQueryWithReauth from 'store/utils/baseQueryWithReauth'
import { secondsToDayjs } from 'app/utils/time'

export const workoutApi = createApi({
  reducerPath: 'workoutApi',
  baseQuery: getBaseQueryWithReauth(false),
  refetchOnMountOrArgChange: true,
  tagTypes: [ 'Workout', 'WorkoutList' ],
  endpoints: build => ({
    get: build.query<GetWorkoutSuccess, { id: string }>({
      query: ({ id }) => ({
        url: `${routes.workout.v1.base.full}/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: GetWorkoutSuccess) => {
        if (response.success) {
          const workout = { ...response.data }
          workout.exercises = workout.exercises.map(({ id, rounds, round_break, break: exercise_break, break_enabled }) => ({
            id,
            rounds,
            round_break: typeof round_break === 'object' ? round_break : secondsToDayjs(round_break as number),
            break_enabled,
            break: typeof exercise_break === 'object' ? exercise_break : secondsToDayjs(exercise_break as number),
          }))
          response.data = workout
        }
        return response
      },
      providesTags: () => [ 'Workout' ],
    }),
    create: build.mutation<WorkoutCreateSuccess, { workout: Omit<WorkoutForm, 'id'> }>({
      query: ({ workout }) => ({
        url: routes.workout.v1.create.full,
        method: 'POST',
        body: workout,
      }),
      invalidatesTags: [ 'Workout' ],
    }),
    update: build.mutation<WorkoutUpdateSuccess, { workout: WorkoutServerPayload }>({
      query: ({ workout }) => ({
        url: `${routes.workout.v1.update.full}/${workout.id}`,
        method: 'PATCH',
        body: workout,
      }),
      invalidatesTags: [ 'Workout' ],
    }),
    delete: build.mutation<WorkoutDeleteSuccess, { id: Pick<WorkoutServerPayload, 'id'> }>({
      query: ({ id }) => ({
        url: `${routes.workout.v1.delete.full}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [ 'Workout', 'WorkoutList' ],
    }),
    deleteMany: build.mutation<WorkoutDeleteSuccess, { ids: Pick<WorkoutServerPayload, 'id'>[] }>({
      query: ({ ids }) => ({
        url: `${routes.workout.v1.delete.full}`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [ 'Workout', 'WorkoutList' ],
    }),
    list: build.query<GetWorkoutListSuccess, void>({
      query: () => ({
        url: routes.workout.v1.list.full,
        method: 'GET',
      }),
      providesTags: () => [ 'WorkoutList' ],
    }),
  }),
})
