import { ResponseError } from 'constants/response_types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Cookie from 'js-cookie'
import type { AppState } from 'app/store'
import { authApi } from './api'
import { Token } from './types'
import * as actions from './actions'

export interface IAuthState {
  token: null | Token
  status: 'initial' | 'loading' | 'error' | 'loaded'
}

const initialState: IAuthState = {
  token: null,
  status: 'initial',
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateToken: (state, action: PayloadAction<Token>) => {
      state.token = action.payload
      state.status = 'loaded'
    },
    // logout: (state) => {
    //   Cookie.set('logout', Date.now())
    //   state.token = null
    //   state.status = 'loaded'
    // },
  },
  extraReducers: (builder) => {
    builder
    // logout
      .addCase(
        actions.logout.pending,
        (state) => {
          Cookie.set('logout', Date.now())
          state.token = null
          state.status = 'loaded'
        },
      )
      // refresh token
      .addMatcher(
        authApi.endpoints.refreshToken.matchPending,
        (state) => {
          state.status = 'loading'
        },
      )
      .addMatcher(
        authApi.endpoints.refreshToken.matchFulfilled,
        (state, { payload }) => {
          state.token = payload.data.token
          state.status = 'loaded'
        },
      )
      .addMatcher(
        authApi.endpoints.refreshToken.matchRejected,
        (state, { payload }) => {
          state.token = (payload as unknown as ResponseError).appCode === 4032 ? null : state.token
          state.status = 'error'
        },
      )
  },
})

// export const { updateToken, logout } = authSlice.actions
export const { updateToken } = authSlice.actions
export const { logout } = actions

export const selectToken = (state: AppState) => state.auth.token

export default authSlice.reducer
