import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { configApi } from './api'
import { isUndefined } from 'app/utils/typeCheckers'

export interface IConfigState {
  data: {
    isLoggedIn: boolean;
  };
  updateRequestCount: number;
  status: ApiStatus;
}

const initialState: IConfigState = {
  data: {
    isLoggedIn: false,
  },
  updateRequestCount: 0,
  status: API_STATUS.INITIAL,
}

const updateConfigLocally = (state: IConfigState) => {
  try {
    if (!isUndefined(localStorage)) localStorage.setItem('config', JSON.stringify(state.data))
  } catch (error) {
    console.warn('Update local config error', error.message)
  }
}

export const authSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    changeIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.data.isLoggedIn = action.payload
      updateConfigLocally(state)
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        configApi.endpoints.get.matchPending,
        (state) => {
          state.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        configApi.endpoints.get.matchFulfilled,
        (state, { payload }) => {
          state.data = payload.data
          updateConfigLocally(state)
          state.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        configApi.endpoints.get.matchRejected,
        (state) => {
          state.status = API_STATUS.ERROR
        },
      )
      .addMatcher(
        configApi.endpoints.update.matchPending,
        (state) => {
          state.updateRequestCount += 1
          state.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        configApi.endpoints.update.matchFulfilled,
        (state, { payload }) => {
          state.updateRequestCount -= 1
          if (state.updateRequestCount === 0) {
            state.data = payload.data
            updateConfigLocally(state)
          }
          state.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        configApi.endpoints.update.matchRejected,
        (state) => {
          state.updateRequestCount -= 1
          state.status = API_STATUS.ERROR
        },
      )
  },
})

export const { changeIsLoggedIn } = authSlice.actions

export const selectIsLoggedIn = (state: AppState) => state.config.data.isLoggedIn
export const selectConfig = (state: AppState) => state.config.data

export default authSlice.reducer
