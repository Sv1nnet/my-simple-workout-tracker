import { ApiStatus, API_STATUS } from '@/src/app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { activityApi } from './api'
import { ActivityListItem } from './types'

export interface IActivityState {
  list: {
    data: ActivityListItem[];
    status: ApiStatus;
  }
  single: {
    data: ActivityListItem;
    status: ApiStatus;
  }
}

const initialState: IActivityState = {
  list: {
    data: [],
    status: API_STATUS.INITIAL,
  },
  single: {
    data: null,
    status: API_STATUS.INITIAL,
  },
}

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    updateList: (state, action: PayloadAction<ActivityListItem[]>) => {
      state.list.data = action.payload
      state.list.status = API_STATUS.LOADED
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        activityApi.endpoints.list.matchPending,
        (state) => {
          state.list.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        activityApi.endpoints.list.matchFulfilled,
        (state, { payload }) => {
          state.list.data = payload.data
          state.list.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        activityApi.endpoints.list.matchRejected,
        (state) => {
          state.list.status = API_STATUS.ERROR
        },
      )
  },
})

export const { updateList } = activitySlice.actions

export const selectList = (state: AppState) => state.activity.list

export default activitySlice.reducer
