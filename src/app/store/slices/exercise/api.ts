import { createApi } from '@reduxjs/toolkit/query/react'
import {
  ExerciseForm,
  GetExerciseSuccess,
  ExerciseCreateSuccess,
  ExerciseUpdateSuccess,
  ExerciseDeleteSuccess,
  GetExerciseListSuccess,
  IExerciseFormData,
  ExerciseCopySuccess,
  ExerciseRestoreSuccess,
} from './types'
import routes from 'constants/end_points'
import getBaseQueryWithReauth from 'store/utils/baseQueryWithReauth'
import { Lang } from '../settings/types'

export const EXERCISE_TAG_TYPES = {
  EXERCISE: 'Exercise',
  EXERCISE_LIST: 'ExerciseList',
}

export const exerciseApi = createApi({
  reducerPath: 'exerciseApi',
  baseQuery: getBaseQueryWithReauth(false),
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: Infinity,
  tagTypes: [ EXERCISE_TAG_TYPES.EXERCISE, EXERCISE_TAG_TYPES.EXERCISE_LIST ],
  endpoints: build => ({
    get: build.query<GetExerciseSuccess, { id: string }>({
      query: ({ id }) => ({
        url: `${routes.exercise.v1.base.full}/${id}`,
        method: 'GET',
      }),
      providesTags: () => [ EXERCISE_TAG_TYPES.EXERCISE ],
    }),
    create: build.mutation<ExerciseCreateSuccess, { exercise: Omit<ExerciseForm, 'id'> }>({
      query: ({ exercise }) => ({
        url: routes.exercise.v1.create.full,
        method: 'POST',
        body: exercise,
      }),
      invalidatesTags: [ EXERCISE_TAG_TYPES.EXERCISE_LIST ],
    }),
    update: build.mutation<ExerciseUpdateSuccess, { exercise: IExerciseFormData }>({
      query: ({ exercise }) => ({
        url: `${routes.exercise.v1.update.full}/${exercise.get('id')}`,
        method: 'PATCH',
        body: exercise,
      }),
      invalidatesTags: [ EXERCISE_TAG_TYPES.EXERCISE, EXERCISE_TAG_TYPES.EXERCISE_LIST ],
    }),
    restore: build.mutation<ExerciseRestoreSuccess, void>({
      query: () => ({
        url: `${routes.exercise.v1.restore.full}`,
        method: 'POST',
      }),
    }),
    delete: build.mutation<ExerciseDeleteSuccess, { id: ExerciseForm['id'] }>({
      query: ({ id }) => ({
        url: `${routes.exercise.v1.delete.full}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [ EXERCISE_TAG_TYPES.EXERCISE_LIST ],
    }),
    deleteMany: build.mutation<ExerciseDeleteSuccess, { ids: ExerciseForm['id'][] }>({
      query: ({ ids }) => ({
        url: `${routes.exercise.v1.delete.full}`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [ EXERCISE_TAG_TYPES.EXERCISE_LIST ],
    }),
    list: build.query<GetExerciseListSuccess, { archived?: boolean, workoutId?: string, lang?: Lang } | void>({
      query: (params) => {
        let query = '?'
        if (params) {
          const { archived, workoutId, lang } = params
          
          query += `archived=${!!archived}${workoutId ? `&workoutId=${workoutId}` : ''}${lang ? `&lang=${lang}` : ''}`
        }
        return {
          url: `${routes.exercise.v1.list.full}${query}`,
          method: 'GET',
        }
      },
      providesTags: () => [ EXERCISE_TAG_TYPES.EXERCISE_LIST ],
    }),
    copy: build.mutation<ExerciseCopySuccess, { ids: ExerciseForm['id'][] }>({
      query: ({ ids }) => ({
        url: `${routes.exercise.v1.copy.full}`,
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [ EXERCISE_TAG_TYPES.EXERCISE_LIST ],
    }),
  }),
})
