import { ApiStatus, API_STATUS } from '@/src/app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { activityApi } from './api'
import { ActivityListItem, ActivityListResponseSuccess, SelectedRoundPayload } from './types'

export interface IActivityState {
  list: {
    total: number,
    data: ActivityListItem[];
    status: ApiStatus;
  }
  single: {
    data: ActivityListItem;
    status: ApiStatus;
  }
  charts: {
    [key: string]: null | {
      selectedRoundIndex: null | string | number;
    };
  }
}

const initialState: IActivityState = {
  list: {
    total: 0,
    data: [],
    status: API_STATUS.INITIAL,
  },
  single: {
    data: null,
    status: API_STATUS.INITIAL,
  },
  charts: {},
}

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    updateList: (state, action: PayloadAction<ActivityListResponseSuccess>) => {
      state.list.total = action.payload.total
      state.list.data = action.payload.list
      state.list.status = API_STATUS.LOADED
    },
    setSelectedRound: (state, { payload }: PayloadAction<SelectedRoundPayload>) => {
      state.charts[payload.chartId] = {
        selectedRoundIndex: payload.index,
      }
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
        (state, { payload, meta }) => {
          const shouldConcatList = !!meta?.arg?.originalArgs?.page && meta?.arg?.originalArgs?.page !== 1
          state.list.total = payload.data.total
          state.list.data = shouldConcatList ? state.list.data.concat(payload.data.list) : payload.data.list
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

export const { updateList, setSelectedRound } = activitySlice.actions

export const selectList = (state: AppState) => state.activity.list
export const selectSelectedRoundIndex = (chartId: string) => (state: AppState) => state.activity.charts[chartId]?.selectedRoundIndex

export default activitySlice.reducer
