import { createApi } from '@reduxjs/toolkit/query/react'
import { create, deleteMuscleGroup, updateInList } from 'store/slices/muscleGroup'
import {
  MuscleGroupForm,
  GetMuscleGroupSuccess,
  MuscleGroupCreateSuccess,
  MuscleGroupUpdateSuccess,
  MuscleGroupDeleteSuccess,
  GetMuscleGroupListSuccess,
  MuscleGroupCopySuccess,
  MuscleGroup,
} from './types'
import routes from 'constants/end_points'
import getBaseQueryWithReauth from 'store/utils/baseQueryWithReauth'
import { Lang } from 'store/slices/settings/types'

export const MUSCLE_GROUP_TAG_TYPES = {
  MUSCLE_GROUP: 'MuscleGroup',
  MUSCLE_GROUP_LIST: 'MuscleGroupList',
}

export const muscleGroupApi = createApi({
  reducerPath: 'muscleGroupApi',
  baseQuery: getBaseQueryWithReauth(false),
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: Infinity,
  tagTypes: [ MUSCLE_GROUP_TAG_TYPES.MUSCLE_GROUP, MUSCLE_GROUP_TAG_TYPES.MUSCLE_GROUP_LIST ],
  endpoints: build => ({
    get: build.query<GetMuscleGroupSuccess, { id: string }>({
      query: ({ id }) => ({
        url: `${routes.muscleGroup.v1.base.full}/${id}`,
        method: 'GET',
      }),
      providesTags: () => [ MUSCLE_GROUP_TAG_TYPES.MUSCLE_GROUP ],
    }),
    create: build.mutation<MuscleGroupCreateSuccess, MuscleGroupForm>({
      query: muscleGroup => ({
        url: routes.muscleGroup.v1.create.full,
        method: 'POST',
        body: muscleGroup,
      }),
      async onQueryStarted(newMuscleGroup, { dispatch, queryFulfilled }) {
        dispatch(create(newMuscleGroup))
        const response = await queryFulfilled
        dispatch(updateInList({ byIdFromClient: true, muscleGroup: response.data.data }))
      },
      invalidatesTags: [ MUSCLE_GROUP_TAG_TYPES.MUSCLE_GROUP_LIST ],
    }),
    update: build.mutation<MuscleGroupUpdateSuccess, { muscleGroup: MuscleGroup }>({
      query: ({ muscleGroup }) => ({
        url: `${routes.muscleGroup.v1.update.full}/${muscleGroup.id}`,
        method: 'PATCH',
        body: muscleGroup,
      }),
      invalidatesTags: [ MUSCLE_GROUP_TAG_TYPES.MUSCLE_GROUP, MUSCLE_GROUP_TAG_TYPES.MUSCLE_GROUP_LIST ],
    }),
    delete: build.mutation<MuscleGroupDeleteSuccess, { id: MuscleGroup['id'] }>({
      query: ({ id }) => ({
        url: `${routes.muscleGroup.v1.delete.full}/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ id }, { dispatch }) {
        dispatch(deleteMuscleGroup(id))
      },
      invalidatesTags: [ MUSCLE_GROUP_TAG_TYPES.MUSCLE_GROUP_LIST ],
    }),
    deleteMany: build.mutation<MuscleGroupDeleteSuccess, { ids: MuscleGroup['id'][] }>({
      query: ({ ids }) => ({
        url: `${routes.muscleGroup.v1.delete.full}`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [ MUSCLE_GROUP_TAG_TYPES.MUSCLE_GROUP_LIST ],
    }),
    list: build.query<GetMuscleGroupListSuccess, { archived?: boolean, workoutId?: string, exerciseId?: string, lang?: Lang } | void>({
      query: (params) => {
        let query = '?'
        if (params) {
          const { archived, workoutId, exerciseId, lang } = params
          
          query += `archived=${!!archived}${workoutId ? `&workoutId=${workoutId}` : ''}${exerciseId ? `&exerciseId=${exerciseId}` : ''}${lang ? `&lang=${lang}` : ''}`
        }
        return {
          url: `${routes.muscleGroup.v1.list.full}${query}`,
          method: 'GET',
        }
      },
      providesTags: () => [ MUSCLE_GROUP_TAG_TYPES.MUSCLE_GROUP_LIST ],
    }),
    copy: build.mutation<MuscleGroupCopySuccess, { ids: MuscleGroupForm['id'][] }>({
      query: ({ ids }) => ({
        url: `${routes.muscleGroup.v1.copy.full}`,
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [ MUSCLE_GROUP_TAG_TYPES.MUSCLE_GROUP_LIST ],
    }),
  }),
})
