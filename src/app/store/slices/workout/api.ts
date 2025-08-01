import { createApi } from '@reduxjs/toolkit/query/react'
import {
  WorkoutForm,
  GetWorkoutSuccess,
  WorkoutCreateSuccess,
  WorkoutUpdateSuccess,
  WorkoutDeleteSuccess,
  GetWorkoutListSuccess,
  WorkoutServerPayload,
  WorkoutListParams,
} from './types'
import routes from 'constants/end_points'
import getBaseQueryWithReauth from 'store/utils/baseQueryWithReauth'
import { secondsToDayjs } from 'app/utils/time'
import { Dayjs } from 'dayjs'
import { isNumber } from 'app/utils/typeCheckers'

export const WORKOUT_TAG_TYPES = {
  WORKOUT: 'Workout',
  WORKOUT_LIST: 'WorkoutList',
}

export const workoutApi = createApi({
  reducerPath: 'workoutApi',
  baseQuery: getBaseQueryWithReauth(false),
  refetchOnMountOrArgChange: true,
  tagTypes: [ WORKOUT_TAG_TYPES.WORKOUT, WORKOUT_TAG_TYPES.WORKOUT_LIST ],
  endpoints: build => ({
    get: build.query<GetWorkoutSuccess<Dayjs>, { id: string }>({
      query: ({ id }) => ({
        url: `${routes.workout.v1.base.full}/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: GetWorkoutSuccess<Dayjs>) => {
        if (response.success) {
          const workout = { ...response.data }
          workout.exercises = workout.exercises.map(({ id, rounds, details,  round_break, break: exercise_break, break_enabled, weight, repeats, time }) => ({
            id,
            rounds,
            round_break: isNumber(round_break) ? secondsToDayjs(round_break) : round_break,
            break_enabled,
            break: isNumber(exercise_break) ? secondsToDayjs(exercise_break) : exercise_break,
            details,
            weight,
            repeats,
            time,
          }))
          response.data = workout
        }
        return response
      },
      providesTags: () => [ WORKOUT_TAG_TYPES.WORKOUT ],
    }),
    create: build.mutation<WorkoutCreateSuccess, { workout: Omit<WorkoutForm, 'id'> }>({
      query: ({ workout }) => ({
        url: routes.workout.v1.create.full,
        method: 'POST',
        body: workout,
      }),
      invalidatesTags: [ WORKOUT_TAG_TYPES.WORKOUT_LIST ],
    }),
    update: build.mutation<WorkoutUpdateSuccess, { workout: WorkoutServerPayload }>({
      query: ({ workout }) => ({
        url: `${routes.workout.v1.update.full}/${workout.id}`,
        method: 'PATCH',
        body: workout,
      }),
      invalidatesTags: [ WORKOUT_TAG_TYPES.WORKOUT, WORKOUT_TAG_TYPES.WORKOUT_LIST ],
    }),
    delete: build.mutation<WorkoutDeleteSuccess, { id: WorkoutServerPayload['id'] }>({
      query: ({ id }) => ({
        url: `${routes.workout.v1.delete.full}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [ WORKOUT_TAG_TYPES.WORKOUT_LIST ],
    }),
    deleteMany: build.mutation<WorkoutDeleteSuccess, { ids: WorkoutServerPayload['id'][] }>({
      query: ({ ids }) => ({
        url: `${routes.workout.v1.delete.full}`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [ WORKOUT_TAG_TYPES.WORKOUT_LIST ],
    }),
    list: build.query<GetWorkoutListSuccess, WorkoutListParams | void>({
      query: ({ archived = false, inActivity = '', include = '' }: WorkoutListParams = {}) => ({
        url: `${routes.workout.v1.list.full}?archived=${archived}&in_activity=${inActivity}&include=${include}`,
        method: 'GET',
      }),
      providesTags: () => [ WORKOUT_TAG_TYPES.WORKOUT_LIST ],
    }),
    copy: build.mutation({
      query: ({ ids }) => ({
        url: `${routes.workout.v1.copy.full}`,
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [ WORKOUT_TAG_TYPES.WORKOUT_LIST ],
    }),
  }),
})
