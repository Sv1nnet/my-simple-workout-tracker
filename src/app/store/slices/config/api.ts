import { createApi } from '@reduxjs/toolkit/query/react'
import {
  GetConfigSuccess,
  Config,
  UpdateConfigSuccess,
} from './types'
import routes from 'constants/end_points'
import getBaseQueryWithReauth from 'store/utils/baseQueryWithReauth'

export const configApi = createApi({
  reducerPath: 'configApi',
  baseQuery: getBaseQueryWithReauth(false),
  refetchOnMountOrArgChange: true,
  tagTypes: [ 'Config' ],
  endpoints: build => ({
    get: build.query<GetConfigSuccess, void>({
      query: () => ({
        url: routes.config.v1.base.full,
        method: 'GET',
      }),
      providesTags: () => [ 'Config' ],
    }),
    update: build.query<UpdateConfigSuccess, { config: Config }>({
      query: ({ config }) => ({
        url: routes.config.v1.update.full,
        method: 'PATCH',
        body: { ...config },
      }),
      providesTags: () => [ 'Config' ],
    }),
  }),
})
