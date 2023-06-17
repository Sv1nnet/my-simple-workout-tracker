import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { workoutApi } from './api'
import { WorkoutListItem, WorkoutServerPayload } from './types'

export interface IWorkoutState {
  list: {
    data: WorkoutListItem[];
    status: ApiStatus;
  }
  single: {
    data: WorkoutServerPayload;
    status: ApiStatus;
  }
}

const initialState: IWorkoutState = {
  list: {
    data: [],
    status: API_STATUS.INITIAL,
  },
  single: {
    data: null,
    status: API_STATUS.INITIAL,
  },
}

export const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    updateList: (state, action: PayloadAction<WorkoutListItem[]>) => {
      state.list.data = action.payload
      state.list.status = API_STATUS.LOADED
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        workoutApi.endpoints.list.matchPending,
        (state) => {
          state.list.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        workoutApi.endpoints.list.matchFulfilled,
        (state, { payload }) => {
          state.list.data = payload.data
          state.list.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        workoutApi.endpoints.list.matchRejected,
        (state, { error }) => {
          if (error?.name === 'ConditionError') return state
          state.list.status = API_STATUS.ERROR
        },
      )
  },
})

export const { updateList } = workoutSlice.actions

export const selectList = (state: AppState) => state.workout.list

export default workoutSlice.reducer
