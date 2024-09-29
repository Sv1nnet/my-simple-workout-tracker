import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { activityApi } from './api'
import { ActivityForm, ActivityListItem, ActivityListResponseSuccess, HistoryRequestQuery, HistoryResponseData, SelectedRoundPayload } from './types'
import { ListQuery } from 'store/utils/StateResultTypes'
import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } from 'app/utils/localStorage'
import { Dayjs } from 'dayjs'

export const ACTIVITY_PAGE_TYPE = {
  LIST: 'list',
  EDIT: 'edit',
  CREATE: 'create',
  NONE: 'none',
} as const

export type ActivityPageType = typeof ACTIVITY_PAGE_TYPE[keyof typeof ACTIVITY_PAGE_TYPE]

export interface IActivityState {
  isOpen: boolean,
  pageType: ActivityPageType,
  list: {
    total: number,
    data: ActivityListItem[];
    status: ApiStatus;
    query: ListQuery;
  }
  single: {
    data: ActivityForm<string>;
    status: ApiStatus;
  }
  cachedActivity: {
    data: ActivityForm;
  },
  history: {
    data: HistoryResponseData | null;
    query: HistoryRequestQuery;
    status: ApiStatus;
  },
  charts: {
    [key: string]: null | {
      selectedRoundIndex: null | string | number;
    };
  }
}

const initialState: IActivityState = {
  isOpen: false,
  pageType: ACTIVITY_PAGE_TYPE.NONE,
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
  cachedActivity: {
    data: getLocalStorageItem('cached_activity'),
  },
  history: {
    data: null,
    query: {
      workoutId: null,
      activityId: null,
      page: 1,
      byPage: 30,
    },
    status: API_STATUS.INITIAL,
  },
  charts: {},
}

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    open: (state, { payload }: PayloadAction<{ pageType: ActivityPageType }>) => {
      state.isOpen = true
      state.pageType = payload.pageType
    },
    close: (state) => {
      state.isOpen = false
      state.pageType = ACTIVITY_PAGE_TYPE.NONE
    },
    setCachedActivity: (state, { payload }: PayloadAction<{ data: ActivityForm, shouldSaveToLocalStorage?: boolean }>) => {
      state.cachedActivity.data = payload.data
      if (payload.shouldSaveToLocalStorage) {
        setLocalStorageItem('cached_activity', payload.data)
      }
    },
    removeCachedActivity: (state, { payload }: PayloadAction<{ shouldRemoveFromLocalStorage: boolean }>) => {
      if (payload.shouldRemoveFromLocalStorage) {
        removeLocalStorageItem('cached_activity')
      }
      state.cachedActivity.data = null
    },
    setPageType: (state, { payload }: PayloadAction<ActivityPageType>) => {
      state.pageType = payload
    },
    resetListState: (state) => {
      state.list = initialState.list
    },
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
    updateHistoryQuery: (state, { payload }: PayloadAction<Partial<HistoryRequestQuery>>) => {
      state.history.query.workoutId ??= payload.workoutId
      state.history.query.activityId ??= payload.activityId
      state.history.query.page ??= payload.page
      state.history.query.byPage ??= payload.byPage
      state.history.query.offset ??= payload.offset
    },
    resetHistoryState: (state) => {
      state.history = initialState.history
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
      .addMatcher(
        activityApi.endpoints.get.matchPending,
        (state) => {
          state.single.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        activityApi.endpoints.get.matchFulfilled,
        (state, { payload }) => {
          state.single.status = API_STATUS.LOADED
          state.single.data = payload.data
        },
      )
      .addMatcher(
        activityApi.endpoints.get.matchRejected,
        (state) => {
          state.list.status = API_STATUS.ERROR
          state.single.data = null
        },
      ).addMatcher(
        activityApi.endpoints.getHistory.matchPending,
        (state) => {
          state.history.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        activityApi.endpoints.getHistory.matchFulfilled,
        (state, { payload }) => {
          state.history.data = payload.data
          state.history.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        activityApi.endpoints.getHistory.matchRejected,
        (state) => {
          state.history.status = API_STATUS.ERROR
        },
      )
  },
})

export const {
  updateList,
  setSelectedRound,
  updateQuery,
  resetListState,
  open,
  close,
  setPageType,
  setCachedActivity,
  removeCachedActivity,
  updateHistoryQuery,
  resetHistoryState,
} = activitySlice.actions

export const selectIsOpen = (state: AppState) => state.activity.isOpen
export const selectPageType = (state: AppState) => state.activity.pageType
export const selectPageInfo = (state: AppState) => ({
  isOpen: state.activity.isOpen,
  pageType: state.activity.pageType,
})
export const selectActivity = (state: AppState) => state.activity.single
export const selectCachedActivity = (state: AppState) => state.activity.cachedActivity
export const selectList = (state: AppState) => state.activity.list
export const selectSelectedRoundIndex = (chartId: string) => (state: AppState) => state.activity.charts[chartId]?.selectedRoundIndex

export * as activityHandlers from './noCredsLoginRequestHandlers'

export default activitySlice.reducer
