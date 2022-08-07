import { createApi } from '@reduxjs/toolkit/query/react'
import {
  ActivityForm,
  GetActivitySuccess,
  ActivityCreateSuccess,
  ActivityUpdateSuccess,
  ActivityDeleteSuccess,
  GetActivityListSuccess,
  IActivityFormData,
} from './types'
import { Dayjs } from 'dayjs'
import routes from 'constants/end_points'
import getBaseQueryWithReauth from 'store/utils/baseQueryWithReauth'
import { timeToDayjs } from 'app/utils/time'

export const activityApi = createApi({
  reducerPath: 'activityApi',
  baseQuery: getBaseQueryWithReauth(false),
  refetchOnMountOrArgChange: true,
  tagTypes: [ 'Activity', 'ActivityList' ],
  endpoints: build => ({
    get: build.query<GetActivitySuccess, { id: string }>({
      query: ({ id }) => ({
        url: `${routes.activity.v1.base.full}/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: GetActivitySuccess) => {
        if (response.success) {
          const activity = { ...response.data }
          let time: number | Dayjs = activity.time
          if (time) {
            time = timeToDayjs(time as number)
            activity.time = time
            response.data = activity
          }
        }
        return response
      },
      providesTags: () => [ 'Activity' ],
    }),
    create: build.mutation<ActivityCreateSuccess, { activity: Omit<ActivityForm, 'id'> }>({
      query: ({ activity }) => ({
        url: routes.activity.v1.create.full,
        method: 'POST',
        body: activity,
      }),
      invalidatesTags: [ 'Activity' ],
    }),
    update: build.mutation<ActivityUpdateSuccess, { activity: IActivityFormData }>({
      query: ({ activity }) => ({
        url: `${routes.activity.v1.update.full}/${activity.get('id')}`,
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
  }),
})
