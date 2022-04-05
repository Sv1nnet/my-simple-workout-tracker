import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { exerciseApi } from './api'
import { ExerciseServerPayload } from './types'

export interface IExerciseState {
  list: {
    data: ExerciseServerPayload[];
    status: 'initial' | 'loading' | 'error' | 'loaded';
  }
  single: {
    data: ExerciseServerPayload;
    status: 'initial' | 'loading' | 'error' | 'loaded';
  }
}

const initialState: IExerciseState = {
  list: {
    data: [],
    status: 'initial',
  },
  single: {
    data: null,
    status: 'initial',
  },
}

export const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {
    updateList: (state, action: PayloadAction<ExerciseServerPayload[]>) => {
      state.list.data = action.payload
      state.list.status = 'loaded'
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        exerciseApi.endpoints.list.matchPending,
        (state) => {
          state.list.status = 'loading'
        },
      )
      .addMatcher(
        exerciseApi.endpoints.list.matchFulfilled,
        (state, { payload }) => {
          state.list.data = payload.data
          state.list.status = 'loaded'
        },
      )
      .addMatcher(
        exerciseApi.endpoints.list.matchRejected,
        (state) => {
          state.list.status = 'error'
        },
      )
  },
})

export const { updateList } = exerciseSlice.actions

export const selectList = (state: AppState) => state.exercise.list

export default exerciseSlice.reducer
