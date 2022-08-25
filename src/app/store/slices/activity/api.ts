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

export const activityApi = createApi({
  reducerPath: 'activityApi',
  baseQuery: getBaseQueryWithReauth(false),
  refetchOnMountOrArgChange: true,
  tagTypes: [ 'Activity', 'ActivityList', 'History' ],
  endpoints: build => ({
    get: build.query<GetActivitySuccess, { id: string }>({
      query: ({ id }) => ({
        url: `${routes.activity.v1.base.full}/${id}`,
        method: 'GET',
      }),
      providesTags: () => [ 'Activity' ],
    }),
    create: build.mutation<ActivityCreateSuccess, { activity: Omit<ActivityForm<string>, 'id'> }>({
      query: ({ activity }) => ({
        url: routes.activity.v1.create.full,
        method: 'POST',
        body: activity,
      }),
      invalidatesTags: [ 'Activity' ],
    }),
    update: build.mutation<ActivityUpdateSuccess, { activity: IActivityFormData }>({
      query: ({ activity }) => ({
        url: `${routes.activity.v1.update.full}/${activity.id}`,
        method: 'PATCH',
        body: activity,
      }),
      invalidatesTags: [ 'Activity' ],
    }),
    delete: build.mutation<ActivityDeleteSuccess, { id: Pick<ActivityForm, 'id'> }>({
      query: ({ id }) => ({
        url: `${routes.activity.v1.delete.full}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [ 'Activity', 'ActivityList' ],
    }),
    deleteMany: build.mutation<ActivityDeleteSuccess, { ids: Pick<ActivityForm, 'id'>[] }>({
      query: ({ ids }) => ({
        url: `${routes.activity.v1.delete.full}`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [ 'Activity', 'ActivityList' ],
    }),
    list: build.query<GetActivityListSuccess, void>({
      query: () => ({
        url: routes.activity.v1.list.full,
        method: 'GET',
      }),
      providesTags: () => [ 'ActivityList' ],
    }),
    getHistory: build.query<GetHistoryListSuccess, { workoutId: Pick<WorkoutForm, 'id'>, activityId?: string, page?: number, byPage?: number, offset?: number }>({
      query: ({ workoutId, activityId, page = 1, byPage = 30, offset }) => ({
        url: `${routes.activity.v1.history.full}/${workoutId}?${activityId ? `activity_id=${activityId}&` : ''}page=${page}&byPage=${byPage}${typeof offset === 'number' ? `&offset=${offset}` : ''}`,
        method: 'GET',
      }),
      providesTags: () => [ 'History' ],
    }),
  }),
})
