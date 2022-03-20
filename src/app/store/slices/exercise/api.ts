import { createApi } from '@reduxjs/toolkit/query/react'
import {
  ExerciseForm,
  GetExerciseSuccess,
  ExerciseCreateSuccess,
  ExerciseUpdateSuccess,
  ExerciseDeleteSuccess,
  GetExerciseListSuccess,
  IExerciseFormData,
} from './types'
import { Dayjs } from 'dayjs'
import routes from 'constants/end_points'
import getBaseQueryWithReauth from 'store/utils/baseQueryWithReauth'
import { timeToDayjs } from 'app/utils/time'

export const exerciseApi = createApi({
  reducerPath: 'exerciseApi',
  baseQuery: getBaseQueryWithReauth(false),
  refetchOnMountOrArgChange: true,
  tagTypes: [ 'Exercise', 'ExerciseList' ],
  endpoints: build => ({
    get: build.query<GetExerciseSuccess, { id: string }>({
      query: ({ id }) => ({
        url: `${routes.exercise.v1.base.full}/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: GetExerciseSuccess) => {
        if (response.success) {
          const exercise = { ...response.data }
          let time: number | Dayjs = exercise.time
          if (time) {
            time = timeToDayjs(time as number)
            exercise.time = time
            response.data = exercise
          }
        }
        return response
      },
      providesTags: () => [ 'Exercise' ],
    }),
    create: build.mutation<ExerciseCreateSuccess, { exercise: Omit<ExerciseForm, 'id'> }>({
      query: ({ exercise }) => ({
        url: routes.exercise.v1.create.full,
        method: 'POST',
        body: exercise,
      }),
      invalidatesTags: [ 'Exercise' ],
    }),
    update: build.mutation<ExerciseUpdateSuccess, { exercise: IExerciseFormData }>({
      query: ({ exercise }) => ({
        url: `${routes.exercise.v1.update.full}/${exercise.get('id')}`,
        method: 'PATCH',
        body: exercise,
      }),
      invalidatesTags: [ 'Exercise' ],
    }),
    delete: build.mutation<ExerciseDeleteSuccess, { id: Pick<ExerciseForm, 'id'> }>({
      query: ({ id }) => ({
        url: `${routes.exercise.v1.delete.full}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [ 'Exercise', 'ExerciseList' ],
    }),
    deleteMany: build.mutation<ExerciseDeleteSuccess, { ids: Pick<ExerciseForm, 'id'>[] }>({
      query: ({ ids }) => ({
        url: `${routes.exercise.v1.delete.full}`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [ 'Exercise', 'ExerciseList' ],
    }),
    list: build.query<GetExerciseListSuccess, void>({
      query: () => ({
        url: routes.exercise.v1.list.full,
        method: 'GET',
      }),
      providesTags: () => [ 'ExerciseList' ],
    }),
  }),
})
