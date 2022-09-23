import { ApiStatus, API_STATUS } from '@/src/app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { configApi } from './api'
import { ILangs, Lang } from './types'

export interface IConfigState {
  data: {
    lang: Lang,
  };
  status: ApiStatus;
}
export const langs: ILangs = {
  ru: 'ru',
  eng: 'eng',
} as const

const initialState: IConfigState = {
  data: {
    lang: typeof localStorage !== 'undefined'
      ? ((JSON.parse(localStorage.getItem('config')) as { lang: Lang })?.lang ?? langs.eng)
      : langs.eng,
  },
  status: API_STATUS.INITIAL,
}

export const authSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    changeLang: (state, action: PayloadAction<string>) => {
      state.data.lang = langs[action.payload] ?? langs.eng
      if (localStorage) {
        localStorage.setItem('config', JSON.stringify(state.data))
      }
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
          state.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        configApi.endpoints.get.matchRejected,
        (state) => {
          state.status = API_STATUS.ERROR
        },
      )
  },
})

export const { changeLang } = authSlice.actions

export const selectLang = (state: AppState) => state.config.data.lang

export default authSlice.reducer
