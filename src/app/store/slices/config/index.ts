import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import cookie from 'js-cookie'
import { configApi } from './api'
import { Lang, Langs, Theme, Themes, Unit, Units } from './types'
import { isUndefined } from 'app/utils/typeCheckers'

export interface IConfigState {
  data: {
    lang: Lang,
    theme: Theme;
    units: Unit;
  };
  updateRequestCount: number;
  status: ApiStatus;
}

export const themes: Themes = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const

export const langs: Langs = {
  ru: 'ru',
  eng: 'eng',
} as const

export const units: Units = {
  kg: 'kg',
  lb: 'lb',
} as const

let localLang: Lang = langs.eng

if (!isUndefined(localStorage)) {
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
    theme: themes.light,
    units: units.kg,
  },
  updateRequestCount: 0,
  status: API_STATUS.INITIAL,
}

const updateConfigLocally = (state: IConfigState) => {
  try {
    if (!isUndefined(localStorage)) localStorage.setItem('config', JSON.stringify(state.data))
    cookie.set('lang', state.data.lang)
  } catch (error) {
    console.warn('Update local config error', error.message)
  }
}

export const authSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    changeLang: (state, action: PayloadAction<Lang>) => {
      state.data.lang = langs[action.payload] ?? langs.eng
      updateConfigLocally(state)
    },
    changeTheme: (state, action: PayloadAction<Theme>) => {
      state.data.theme = action.payload
      updateConfigLocally(state)
    },
    changeUnits: (state, action: PayloadAction<Unit>) => {
      state.data.units = action.payload
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

export const { changeLang, changeTheme, changeUnits } = authSlice.actions

export const selectLang = (state: AppState) => state.config.data.lang

export default authSlice.reducer
