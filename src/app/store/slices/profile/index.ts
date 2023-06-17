import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'
import { createSlice } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { profileApi } from './api'
import { ProfileForm } from './types'

export type Credentials = Pick<Partial<ProfileForm>, 'email'>

export interface IProfileState {
  credentials: Credentials;
  status: ApiStatus;
}

const initialState: IProfileState = {
  credentials: {},
  status: API_STATUS.INITIAL,
}

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // refresh token
      .addMatcher(
        profileApi.endpoints.update.matchPending,
        (state) => {
          state.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        profileApi.endpoints.update.matchFulfilled,
        (state, { payload }) => {
          Object.assign(state.credentials, payload.data)
          state.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        profileApi.endpoints.update.matchRejected,
        (state) => {
          state.status = API_STATUS.ERROR
        },
      )
      // get profile
      .addMatcher(
        profileApi.endpoints.get.matchPending,
        (state) => {
          state.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        profileApi.endpoints.get.matchFulfilled,
        (state, { payload }) => {
          Object.assign(state.credentials, payload.data)
          state.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        profileApi.endpoints.get.matchRejected,
        (state) => {
          state.status = API_STATUS.ERROR
        },
      )
  },
})

export const selectCredentials = (state: AppState) => state.profile.credentials

export default profileSlice.reducer
