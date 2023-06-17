import { createApi } from '@reduxjs/toolkit/query/react'
import {
  ActivityForm,
  GetActivitySuccess,
  ActivityCreateSuccess,
  ActivityUpdateSuccess,
  ActivityDeleteSuccess,
  GetActivityListSuccess,
  IActivityFormData,
  GetHistoryListSuccess,
} from './types'
import routes from 'constants/end_points'
import getBaseQueryWithReauth from 'store/utils/baseQueryWithReauth'
import { WorkoutForm } from 'store/slices/workout/types'

export const ACTIVITY_TAG_TYPES = {
  ACTIVITY: 'Activity',
  ACTIVITY_LIST: 'ActivityList',
  HISTORY: 'History',
}

export const activityApi = createApi({
  reducerPath: 'activityApi',
  baseQuery: getBaseQueryWithReauth(false),
  refetchOnMountOrArgChange: true,
  tagTypes: [ ACTIVITY_TAG_TYPES.ACTIVITY, ACTIVITY_TAG_TYPES.ACTIVITY_LIST, ACTIVITY_TAG_TYPES.HISTORY ],
  endpoints: build => ({
    get: build.query<GetActivitySuccess, { id: string }>({
      query: ({ id }) => ({
        url: `${routes.activity.v1.base.full}/${id}`,
        method: 'GET',
      }),
      providesTags: () => [ ACTIVITY_TAG_TYPES.ACTIVITY ],
    }),
    create: build.mutation<ActivityCreateSuccess, { activity: Omit<ActivityForm<string>, 'id'> }>({
      query: ({ activity }) => ({
        url: routes.activity.v1.create.full,
        method: 'POST',
        body: activity,
      }),
      invalidatesTags: [ ACTIVITY_TAG_TYPES.ACTIVITY_LIST, ACTIVITY_TAG_TYPES.HISTORY  ],
    }),
    update: build.mutation<ActivityUpdateSuccess, { activity: IActivityFormData }>({
      query: ({ activity }) => ({
        url: `${routes.activity.v1.update.full}/${activity.id}`,
        method: 'PATCH',
        body: activity,
      }),
      invalidatesTags: [ ACTIVITY_TAG_TYPES.ACTIVITY, ACTIVITY_TAG_TYPES.ACTIVITY_LIST, ACTIVITY_TAG_TYPES.HISTORY ],
    }),
    delete: build.mutation<ActivityDeleteSuccess, { id: Pick<ActivityForm, 'id'> }>({
      query: ({ id }) => ({
        url: `${routes.activity.v1.delete.full}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [ ACTIVITY_TAG_TYPES.ACTIVITY_LIST, ACTIVITY_TAG_TYPES.HISTORY ],
    }),
    deleteMany: build.mutation<ActivityDeleteSuccess, { ids: Pick<ActivityForm, 'id'>[] }>({
      query: ({ ids }) => ({
        url: `${routes.activity.v1.delete.full}`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [ ACTIVITY_TAG_TYPES.ACTIVITY_LIST, ACTIVITY_TAG_TYPES.HISTORY ],
    }),
    list: build.query<GetActivityListSuccess, { page?: number, byPage?: number, searchValue?: string } | undefined>({
      query: ({ page = 1, byPage = 30, searchValue = '' } = { page: 1, byPage: 30 }) => ({
        url: `${routes.activity.v1.list.full}?page=${page}&byPage=${byPage}&searchValue=${searchValue}`,
        method: 'GET',
      }),
      providesTags: () => [ ACTIVITY_TAG_TYPES.ACTIVITY_LIST ],
    }),
    getHistory: build.query<GetHistoryListSuccess, { workoutId: Pick<WorkoutForm, 'id'>, activityId?: string, page?: number, byPage?: number, offset?: number }>({
      query: ({ workoutId, activityId, page = 1, byPage = 30, offset }) => ({
        url: `${routes.activity.v1.history.full}/${workoutId}?${activityId ? `activity_id=${activityId}&` : ''}page=${page}&byPage=${byPage}${typeof offset === 'number' ? `&offset=${offset}` : ''}`,
        method: 'GET',
      }),
      providesTags: () => [ ACTIVITY_TAG_TYPES.HISTORY ],
    }),
  }),
})
