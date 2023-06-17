import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { activityApi } from './api'
import { ActivityListItem, ActivityListResponseSuccess, SelectedRoundPayload } from './types'
import { ListQuery } from 'store/utils/StateResultTypes'

export interface IActivityState {
  list: {
    total: number,
    data: ActivityListItem[];
    status: ApiStatus;
    query: ListQuery;
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
    query: {
      page: 1,
      byPage: 50,
      searchValue: '',
    },
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
    updateQuery: (state, { payload }: PayloadAction<Partial<ListQuery>>) => {
      state.list.query.page ??= payload.page
      state.list.query.byPage ??= payload.byPage
      state.list.query.searchValue ??= payload.searchValue
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        activityApi.endpoints.list.matchPending,
        (state, { meta }) => {
          if (meta?.arg?.originalArgs) {
            state.list.query.page = meta?.arg?.originalArgs.page ?? state.list.query.page
            state.list.query.byPage = meta?.arg?.originalArgs.byPage ?? state.list.query.byPage
            state.list.query.searchValue = meta?.arg?.originalArgs.searchValue ?? state.list.query.searchValue
          }
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

export const { updateList, setSelectedRound, updateQuery } = activitySlice.actions

export const selectList = (state: AppState) => state.activity.list
export const selectSelectedRoundIndex = (chartId: string) => (state: AppState) => state.activity.charts[chartId]?.selectedRoundIndex

export default activitySlice.reducer
