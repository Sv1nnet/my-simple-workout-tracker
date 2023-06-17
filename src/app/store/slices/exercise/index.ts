import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { exerciseApi } from './api'
import { ExerciseListItem, ExerciseServerPayload } from './types'

export interface IExerciseState {
  list: {
    data: ExerciseListItem[];
    status: ApiStatus;
  }
  single: {
    data: ExerciseServerPayload;
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
  },
})

export const { updateList } = exerciseSlice.actions

export const selectList = (state: AppState) => state.exercise.list

export default exerciseSlice.reducer
