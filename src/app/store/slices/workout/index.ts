import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { workoutApi } from './api'
import { WorkoutServerPayload } from './types'

export interface IWorkoutState {
  list: {
    data: WorkoutServerPayload[];
    status: 'initial' | 'loading' | 'error' | 'loaded';
  }
  single: {
    data: WorkoutServerPayload;
    status: 'initial' | 'loading' | 'error' | 'loaded';
  }
}

const initialState: IWorkoutState = {
  list: {
    data: [],
    status: 'initial',
  },
  single: {
    data: null,
    status: 'initial',
  },
}

export const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    updateList: (state, action: PayloadAction<WorkoutServerPayload[]>) => {
      state.list.data = action.payload
      state.list.status = 'loaded'
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        workoutApi.endpoints.list.matchPending,
        (state) => {
          state.list.status = 'loading'
        },
      )
      .addMatcher(
        workoutApi.endpoints.list.matchFulfilled,
        (state, { payload }) => {
          state.list.data = payload.data
          state.list.status = 'loaded'
        },
      )
      .addMatcher(
        workoutApi.endpoints.list.matchRejected,
        (state) => {
          state.list.status = 'error'
        },
      )
  },
})

export const { updateList } = workoutSlice.actions

export const selectList = (state: AppState) => state.workout.list

export default workoutSlice.reducer
