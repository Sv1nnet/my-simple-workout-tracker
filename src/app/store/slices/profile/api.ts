import { createApi } from '@reduxjs/toolkit/query/react'
import {
  ProfileForm,
  GetProfileSuccess,
  ProfileUpdateSuccess,
} from './types'
import routes from 'constants/end_points'
import getBaseQueryWithReauth from 'store/utils/baseQueryWithReauth'
import { Token } from '../auth/types'

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: getBaseQueryWithReauth(false),
  refetchOnMountOrArgChange: true,
  tagTypes: [ 'Profile' ],
  endpoints: build => ({
    get: build.query<GetProfileSuccess, Token>({
      query: token => ({
        url: routes.profile.v1.base.full,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: () => [ 'Profile' ],
    }),
    update: build.query<ProfileUpdateSuccess, { profile: ProfileForm, token: Token }>({
      query: ({ profile, token }) => ({
        url: routes.profile.v1.update.full,
        method: 'PATCH',
        body: { ...profile },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: () => [ 'Profile' ],
    }),
  }),
})
