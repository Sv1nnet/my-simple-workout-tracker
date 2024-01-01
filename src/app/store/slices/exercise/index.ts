import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { exerciseApi } from './api'
import { ExerciseForm, ExerciseListItem } from './types'

export interface IExerciseState {
  list: {
    data: ExerciseListItem[];
    status: ApiStatus;
  }
  single: {
    data: ExerciseForm;
    status: ApiStatus;
  }
}

const initialState: IExerciseState = {
  list: {
    data: [],
    status: API_STATUS.INITIAL,
  },
  single: {
    data: null,
    status: API_STATUS.INITIAL,
  },
}

export const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {
    updateList: (state, action: PayloadAction<ExerciseListItem[]>) => {
      state.list.data = action.payload
      state.list.status = API_STATUS.LOADED
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        exerciseApi.endpoints.list.matchPending,
        (state) => {
          state.list.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        exerciseApi.endpoints.list.matchFulfilled,
        (state, { payload }) => {
          state.list.data = payload.data
          state.list.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        exerciseApi.endpoints.list.matchRejected,
        (state) => {
          state.list.status = API_STATUS.ERROR
        },
      )
      .addMatcher(
        exerciseApi.endpoints.get.matchPending,
        (state) => {
          state.single.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        exerciseApi.endpoints.get.matchFulfilled,
        (state, { payload }) => {
          state.single.status = API_STATUS.LOADED
          state.single.data = payload.data
        },
      )
      .addMatcher(
        exerciseApi.endpoints.get.matchRejected,
        (state) => {
          state.list.status = API_STATUS.ERROR
          state.single.data = null
        },
      )
  },
})

export const { updateList } = exerciseSlice.actions

export const selectExercise = (state: AppState) => state.exercise.single
export const selectList = (state: AppState) => state.exercise.list

export * as exerciseHandlers from './noCredsLoginRequestHandlers'

export default exerciseSlice.reducer
