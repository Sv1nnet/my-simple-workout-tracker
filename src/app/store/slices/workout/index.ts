import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { workoutApi } from './api'
import { Workout, WorkoutListItem } from './types'
import { Dayjs } from 'dayjs'

export interface IWorkoutState {
  list: {
    data: WorkoutListItem[];
    status: ApiStatus;
  }
  single: {
    data: Workout<Dayjs>;
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
    resetListState: (state) => {
      state.list = initialState.list
    },
    resetSingleState: (state) => {
      state.single = initialState.single
    },
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
          state.list.data = payload.data || []
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
      .addMatcher(
        workoutApi.endpoints.get.matchPending,
        (state) => {
          state.single.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        workoutApi.endpoints.get.matchFulfilled,
        (state, { payload }) => {
          state.single.status = API_STATUS.LOADED
          state.single.data = payload.data
        },
      )
      .addMatcher(
        workoutApi.endpoints.get.matchRejected,
        (state) => {
          state.list.status = API_STATUS.ERROR
          state.single.data = null
        },
      )
  },
})

export const { updateList, resetListState, resetSingleState } = workoutSlice.actions

export const selectWorkout = (state: AppState) => state.workout.single
export const selectList = (state: AppState) => state.workout.list

export * as workoutHandlers from './noCredsLoginRequestHandlers'

export default workoutSlice.reducer
