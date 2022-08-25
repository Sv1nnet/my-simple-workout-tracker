import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { activityApi } from './api'
import { ActivityServerPayload } from './types'

export interface IActivityState {
  list: {
    data: ActivityServerPayload[];
    status: 'initial' | 'loading' | 'error' | 'loaded';
  }
  single: {
    data: ActivityServerPayload;
    status: 'initial' | 'loading' | 'error' | 'loaded';
  }
}

const initialState: IActivityState = {
  list: {
    data: [],
    status: 'initial',
  },
  single: {
    data: null,
    status: 'initial',
  },
}

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    updateList: (state, action: PayloadAction<ActivityServerPayload[]>) => {
      state.list.data = action.payload
      state.list.status = 'loaded'
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        activityApi.endpoints.list.matchPending,
        (state) => {
          state.list.status = 'loading'
        },
      )
      .addMatcher(
        activityApi.endpoints.list.matchFulfilled,
        (state, { payload }) => {
          state.list.data = payload.data
          state.list.status = 'loaded'
        },
      )
      .addMatcher(
        activityApi.endpoints.list.matchRejected,
        (state) => {
          state.list.status = 'error'
        },
      )
  },
})

export const { updateList } = activitySlice.actions

export const selectList = (state: AppState) => state.activity.list

export default activitySlice.reducer
