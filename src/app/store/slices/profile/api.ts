import { createApi } from '@reduxjs/toolkit/query/react'
import {
  ProfileForm,
  GetProfileSuccess,
  ProfileUpdateSuccess,
} from './types'
import routes from 'constants/end_points'
import getBaseQueryWithReauth from 'store/utils/baseQueryWithReauth'

export const PROFILE_TAG_TYPES = {
  PROFILE: 'profile',
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: getBaseQueryWithReauth(false),
  refetchOnMountOrArgChange: true,
  tagTypes: [ PROFILE_TAG_TYPES.PROFILE ],
  endpoints: build => ({
    get: build.query<GetProfileSuccess, void>({
      query: () => ({
        url: routes.profile.v1.base.full,
        method: 'GET',
      }),
      providesTags: () => [ PROFILE_TAG_TYPES.PROFILE ],
    }),
    update: build.query<ProfileUpdateSuccess, { profile: ProfileForm }>({
      query: ({ profile }) => ({
        url: routes.profile.v1.update.full,
        method: 'PATCH',
        body: { ...profile },
      }),
      providesTags: () => [ PROFILE_TAG_TYPES.PROFILE ],
    }),
  }),
})
