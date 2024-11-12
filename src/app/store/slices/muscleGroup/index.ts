import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { muscleGroupApi } from './api'
import { MuscleGroupListItem } from './types'

export interface IMuscleGroupState {
  list: {
    data: MuscleGroupListItem[];
    status: ApiStatus;
  },
  single: {
    data: MuscleGroupListItem | null;
    status: ApiStatus;
  }
}

const initialState: IMuscleGroupState = {
  list: {
    data: [],
    status: API_STATUS.INITIAL,
  },
  single: {
    data: null,
    status: API_STATUS.INITIAL,
  },
}

export const muscleGroupSlice = createSlice({
  name: 'muscleGroup',
  initialState,
  reducers: {
    updateSingle: (state, action: PayloadAction<MuscleGroupListItem>) => {
      state.single.data = action.payload
    },
    updateInList: (state, action: PayloadAction<{ byIdFromClient: boolean, muscleGroup: MuscleGroupListItem }>) => {
      const index = state.list.data.findIndex(item => action.payload.byIdFromClient
        ? item.idFromClient === action.payload.muscleGroup.idFromClient
        : item.id === action.payload.muscleGroup.id)

      if (index !== -1) {
        state.list.data[index] = action.payload.muscleGroup
      }
    },
    resetListState: (state) => {
      state.list = initialState.list
    },
    updateList: (state, action: PayloadAction<MuscleGroupListItem[]>) => {
      state.list.data = action.payload
      state.list.status = API_STATUS.LOADED
    },
    create: (state, action: PayloadAction<MuscleGroupListItem>) => {
      state.list.data.push(action.payload)
      state.list.data.sort((a, b) => {
        if (a.title > b.title) return 1
        else if (a.title < b.title) return -1
        return 0
      })
    },
    delete: (state, action: PayloadAction<MuscleGroupListItem['id']>) => {
      state.list.data = state.list.data.filter(item => item.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        muscleGroupApi.endpoints.list.matchPending,
        (state) => {
          state.list.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        muscleGroupApi.endpoints.list.matchFulfilled,
        (state, { payload }) => {
          state.list.data = payload.data
          state.list.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        muscleGroupApi.endpoints.list.matchRejected,
        (state) => {
          state.list.status = API_STATUS.ERROR
        },
      )
      .addMatcher(
        muscleGroupApi.endpoints.create.matchPending,
        (state) => {
          state.single.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        muscleGroupApi.endpoints.create.matchFulfilled,
        (state, { payload }) => {
          state.single.data = payload.data
          state.single.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        muscleGroupApi.endpoints.create.matchRejected,
        (state) => {
          state.single.status = API_STATUS.ERROR
        },
      )
  },
})

export const { create, delete: deleteMuscleGroup, updateInList, updateList, resetListState } = muscleGroupSlice.actions

export const selectMuscleGroup = (state: AppState) => state.muscleGroup.single
export const selectList = (state: AppState) => state.muscleGroup.list

export * as muscleGroupHandlers from './noCredsLoginRequestHandlers'

export default muscleGroupSlice.reducer
