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

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: routes.base, credentials: 'include' }),
  refetchOnMountOrArgChange: true,
  tagTypes: [ 'Auth' ],
  endpoints: build => ({
    login: build.query<LoginSuccess, Login>({
      query: cred => ({
        url: routes.auth.v1.login.full,
        method: 'POST',
        body: { ...cred },
      }),
      providesTags: () => [ 'Auth' ],
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
      providesTags: () => [ 'Auth' ],
    }),
    resetPassword: build.query<ResetSuccess, Reset>({
      query: cred => ({
        url: routes.auth.v1.resetPassword.full,
        method: 'POST',
        body: { ...cred },
      }),
    }),
    restorePassword: build.query<RestoreSuccess, void>({
      query: () => ({
        url: routes.auth.v1.restorePassword.full,
        method: 'POST',
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
