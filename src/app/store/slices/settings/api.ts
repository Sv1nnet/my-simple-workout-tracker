import { createApi } from '@reduxjs/toolkit/query/react'
import {
  SettingsForm,
  GetSettingsSuccess,
  SettingsUpdateSuccess,
} from './types'
import routes from 'constants/end_points'
import getBaseQueryWithReauth from 'store/utils/baseQueryWithReauth'

export const SETTINGS_TAG_TYPES = {
  SETTINGS: 'settings',
}

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: getBaseQueryWithReauth(false),
  tagTypes: [ SETTINGS_TAG_TYPES.SETTINGS ],
  endpoints: build => ({
    get: build.query<GetSettingsSuccess, void>({
      query: () => ({
        url: routes.settings.v1.base.full,
        method: 'GET',
      }),
      providesTags: () => [ SETTINGS_TAG_TYPES.SETTINGS ],
    }),
    update: build.query<SettingsUpdateSuccess, { settings: Partial<SettingsForm> }>({
      query: ({ settings }) => ({
        url: routes.settings.v1.update.full,
        method: 'PATCH',
        body: { ...settings },
      }),
      providesTags: () => [ SETTINGS_TAG_TYPES.SETTINGS ],
    }),
  }),
})
