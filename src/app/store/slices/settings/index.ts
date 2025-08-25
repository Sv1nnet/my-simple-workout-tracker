import { ApiStatus, API_STATUS } from 'app/constants/api_statuses'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'
import { settingsApi } from './api'
import cookie from 'js-cookie'
import { Lang, Langs, SettingsForm, Theme, Themes, Unit, Units } from './types'
import { isUndefined } from 'app/utils/typeCheckers'

export interface ISettingsState {
  isOpen: boolean,
  data: SettingsForm;
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

let localLang: SettingsForm['lang'] = navigator.language.toLowerCase().includes('ru') ? langs.ru : langs.eng
let theme: Theme = themes.light
let localUnits: Unit = units.kg
let localTimers: SettingsForm['timers'] = {
  isVibration: true,
  isSound: true,
}

if (!isUndefined(localStorage)) {
  try {
    const settingsFromLocalStorage = JSON.parse(localStorage.getItem('settings')) as ISettingsState['data'] || null
    localLang = settingsFromLocalStorage?.lang ?? localLang
    theme = settingsFromLocalStorage?.theme ?? (window?.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? themes.dark
        : themes.light
      : theme)
    localUnits = settingsFromLocalStorage?.units ?? units.kg
    localTimers = settingsFromLocalStorage?.timers ?? {
      isVibration: true,
      isSound: true,
    }

    cookie.set('lang', localLang)
  } catch {
    console.warn('Get lang locally error')
  }
}

const initialState: ISettingsState = {
  isOpen: false,
  data: {
    lang: localLang,
    theme,
    units: localUnits,
    timers: localTimers,
  },
  status: API_STATUS.INITIAL,
}

const updateSettingsLocally = (state: ISettingsState) => {
  try {
    if (!isUndefined(localStorage)) localStorage.setItem('settings', JSON.stringify(state.data))
  } catch (error) {
    console.warn('Update local settings error', error.message)
  }
}

export const profileSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    open: (state) => {
      state.isOpen = true
    },
    close: (state) => {
      state.isOpen = false
    },
    changeLang: (state, action: PayloadAction<Lang>) => {
      state.data.lang = langs[action.payload] ?? langs.eng
      updateSettingsLocally(state)
    },
    changeTheme: (state, action: PayloadAction<Theme>) => {
      state.data.theme = action.payload
      updateSettingsLocally(state)
    },
    changeUnits: (state, action: PayloadAction<Unit>) => {
      state.data.units = action.payload
      updateSettingsLocally(state)
    },
    changeTimers: (state, action: PayloadAction<SettingsForm['timers']>) => {
      state.data.timers = action.payload
      updateSettingsLocally(state)
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        settingsApi.endpoints.update.matchPending,
        (state) => {
          state.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        settingsApi.endpoints.update.matchFulfilled,
        (state, { payload }) => {
          Object.assign(state.data, payload.data)
          state.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        settingsApi.endpoints.update.matchRejected,
        (state) => {
          state.status = API_STATUS.ERROR
        },
      )
      .addMatcher(
        settingsApi.endpoints.get.matchPending,
        (state) => {
          state.status = API_STATUS.LOADING
        },
      )
      .addMatcher(
        settingsApi.endpoints.get.matchFulfilled,
        (state, { payload }) => {
          Object.assign(state.data, payload.data)
          state.status = API_STATUS.LOADED
        },
      )
      .addMatcher(
        settingsApi.endpoints.get.matchRejected,
        (state) => {
          state.status = API_STATUS.ERROR
        },
      )
  },
})

export const { open, close, changeLang, changeTheme, changeUnits, changeTimers } = profileSlice.actions

export const selectIsOpen = (state: AppState) => state.settings.isOpen
export const selectSettings = (state: AppState) => state.settings.data
export const selectLang = (state: AppState) => state.settings.data.lang
export const selectTheme = (state: AppState) => state.settings.data.theme
export const selectUnits = (state: AppState) => state.settings.data.units
export const selectTimers = (state: AppState) => state.settings.data.timers

export default profileSlice.reducer
