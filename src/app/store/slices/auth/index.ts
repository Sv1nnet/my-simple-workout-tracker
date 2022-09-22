import { ResponseError } from 'constants/response_types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Cookie from 'js-cookie'
import type { AppState } from 'app/store'
import { authApi } from './api'
import { Token } from './types'
import * as actions from './actions'
import { ApiStatus, API_STATUS } from '@/src/app/constants/api_statuses'

export interface IAuthState {
  token: null | Token;
  status: ApiStatus;
}

const initialState: IAuthState = {
  token: null,
  status: API_STATUS.INITIAL,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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

// export const { updateToken, logout } = authSlice.actions
export const { updateToken } = authSlice.actions
export const { logout } = actions

export const selectToken = (state: AppState) => state.auth.token

export default authSlice.reducer
