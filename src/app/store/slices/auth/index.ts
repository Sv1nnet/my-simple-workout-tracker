import { ResponseError } from 'constants/response_types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Cookie from 'js-cookie'
import type { AppState } from 'app/store'
import { authApi } from './api'
import { Token } from './types'
import * as actions from './actions'
import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'

export interface IAuthState {
  isNoAuthLogin: boolean;
  token: null | Token;
  status: ApiStatus;
}

const initialState: IAuthState = {
  isNoAuthLogin: false,
  token: Cookie.get('access_token') || null,
  status: API_STATUS.INITIAL,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginWithNoAuth: (state) => {
      state.isNoAuthLogin = true
      state.token = null
      localStorage.setItem('isNoAuthLogin', JSON.stringify(state.isNoAuthLogin))
    },
    logoutWithNoAuth: (state) => {
      state.isNoAuthLogin = false
      state.token = null
      localStorage.setItem('isNoAuthLogin', JSON.stringify(state.isNoAuthLogin))
    },
    updateToken: (state, action: PayloadAction<Token>) => {
      state.token = action.payload
      state.status = API_STATUS.LOADED
    },
  },
  extraReducers: (builder) => {
    builder
    // logout
      .addCase(
        actions.logout.pending,
        (state) => {
          Cookie.set('logout', Date.now())
          state.token = null
          state.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        authApi.endpoints.logout.matchPending,
        (state) => {
          Cookie.set('logout', Date.now())
          state.token = null
          state.status = API_STATUS.LOADED
        },
      )
      // refresh token
      .addMatcher(
        authApi.endpoints.refreshToken.matchPending,
        (state) => {
          state.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        authApi.endpoints.refreshToken.matchFulfilled,
        (state, { payload }) => {
          state.token = payload.data.token
          state.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        authApi.endpoints.refreshToken.matchRejected,
        (state, { payload }) => {
          state.token = (payload as unknown as ResponseError).appCode === 4032 ? null : state.token
          state.status = API_STATUS.ERROR
        },
      )
  },
})

export const { updateToken, loginWithNoAuth, logoutWithNoAuth } = authSlice.actions
export const { logout } = actions

export const selectIsNoAuthLogin = (state: AppState) => state.auth.isNoAuthLogin
export const selectToken = (state: AppState) => state.auth.token
export const selectAuthStatus = (state: AppState) => state.auth.status

export default authSlice.reducer
