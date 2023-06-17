import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import cookie from 'js-cookie'
import { configApi } from './api'
import { ILangs, Lang } from './types'

export interface IConfigState {
  data: {
    lang: Lang,
  };
  updateRequestCount: number;
  status: ApiStatus;
}
export const langs: ILangs = {
  ru: 'ru',
  eng: 'eng',
} as const

let localLang: Lang = langs.eng

if (typeof localStorage !== 'undefined') {
  try {
    localLang = (JSON.parse(localStorage.getItem('config')) as { lang: Lang })?.lang ?? langs.eng
    cookie.set('lang', localLang)
  } catch {
    console.warn('Get lang locally error')
  }
}

const initialState: IConfigState = {
  data: {
    lang: localLang,
  },
  updateRequestCount: 0,
  status: API_STATUS.INITIAL,
}

const updateConfigLocally = (state) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem('config', JSON.stringify(state.data))
    cookie.set('lang', state.data.lang)
  } catch (error) {
    console.warn('Update local config error', error.message)
  }
}

export const authSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    changeLang: (state, action: PayloadAction<string>) => {
      state.data.lang = langs[action.payload] ?? langs.eng
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

export const { changeLang } = authSlice.actions

export const selectLang = (state: AppState) => state.config.data.lang

export default authSlice.reducer
