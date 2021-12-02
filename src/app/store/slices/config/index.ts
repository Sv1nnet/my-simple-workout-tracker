import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from 'app/store'

export interface IConfig {
  lang: 'eng' | 'ru'
}

interface ILangs {
  ru: 'ru'
  eng: 'eng'
}
const langs: ILangs = {
  ru: 'ru',
  eng: 'eng',
}

let lang: 'ru' | 'eng' = langs.eng

try {
  if (localStorage) {
    const rawConfig = localStorage.getItem('config')
    if (rawConfig) {
      const config = JSON.parse(rawConfig) as IConfig
      lang = config.lang
    }
  }
} catch {}

const initialState: IConfig = {
  lang,
}

export const authSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    changeLang: (state, action: PayloadAction<string>) => {
      state.lang = langs[action.payload] ?? 'eng'
      if (localStorage) {
        localStorage.setItem('config', JSON.stringify(state))
      }
    },
  },
})

export const { changeLang } = authSlice.actions

export const selectLang = (state: AppState) => state.config.lang

export default authSlice.reducer
