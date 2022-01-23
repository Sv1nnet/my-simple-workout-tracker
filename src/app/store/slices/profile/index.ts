import { createSlice } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { profileApi } from './api'
import { ProfileForm } from './types'

export type Credentials = Pick<Partial<ProfileForm>, 'email'>

export interface IProfileState {
  credentials: Credentials,
  status: 'initial' | 'loading' | 'error' | 'loaded'
}

const initialState: IProfileState = {
  credentials: {},
  status: 'initial',
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
          state.status = 'loading'
        },
      )
      .addMatcher(
        profileApi.endpoints.update.matchFulfilled,
        (state, { payload }) => {
          Object.assign(state.credentials, payload.data)
          state.status = 'loaded'
        },
      )
      .addMatcher(
        profileApi.endpoints.update.matchRejected,
        (state) => {
          state.status = 'error'
        },
      )
      // get profile
      .addMatcher(
        profileApi.endpoints.get.matchPending,
        (state) => {
          state.status = 'loading'
        },
      )
      .addMatcher(
        profileApi.endpoints.get.matchFulfilled,
        (state, { payload }) => {
          Object.assign(state.credentials, payload)
          state.status = 'loaded'
        },
      )
      .addMatcher(
        profileApi.endpoints.get.matchRejected,
        (state) => {
          state.status = 'error'
        },
      )
  },
})

export const selectCredentials = (state: AppState) => state.profile.credentials

export default profileSlice.reducer
