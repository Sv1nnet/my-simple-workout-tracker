import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  UserForm,
  Reset, 
  Login,
  SignupSuccess,
  LoginSuccess,
  LogoutSuccess,
  ResetSuccess,
  RestoreSuccess,
  RefreshSuccess,
  VerifySignupCodeSuccess,
} from './types'
import routes from 'constants/end_points'

export const AUTH_TAG_TYPES = {
  AUTH: 'Auth',
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: routes.base, credentials: 'include' }),
  refetchOnMountOrArgChange: true,
  tagTypes: [ AUTH_TAG_TYPES.AUTH ],
  endpoints: build => ({
    login: build.query<LoginSuccess, Login>({
      query: cred => ({
        url: routes.auth.v1.login.full,
        method: 'POST',
        body: { ...cred },
      }),
      providesTags: () => [ AUTH_TAG_TYPES.AUTH ],
    }),
    signup: build.query<SignupSuccess, UserForm>({
      query: cred => ({
        url: routes.auth.v1.signup.full,
        method: 'POST',
        body: { ...cred },
      }),
    }),
    verifySignupCode: build.query<VerifySignupCodeSuccess, void>({
      query: code => ({
        url: routes.auth.v1.verifySignupCode.full,
        method: 'POST',
        body: { code },
      }),
    }),
    logout: build.query<LogoutSuccess, void>({
      query: () => ({
        url: routes.auth.v1.logout.full,
        method: 'POST',
      }),
      providesTags: () => [ AUTH_TAG_TYPES.AUTH ],
    }),
    resetPassword: build.query<ResetSuccess, Reset>({
      query: cred => ({
        url: routes.auth.v1.resetPassword.full,
        method: 'POST',
        body: { ...cred },
      }),
    }),
    restorePassword: build.query<RestoreSuccess, void>({
      query: body => ({
        url: routes.auth.v1.restorePassword.full,
        method: 'POST',
        body,
      }),
    }),
    refreshToken: build.query<RefreshSuccess, void>({
      query: () => ({
        url: routes.auth.v1.refresh.full,
        method: 'GET',
      }),
    }),
  }),
})
