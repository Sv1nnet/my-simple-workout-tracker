import { IResponse } from 'app/constants/response_types'

export type Timers = 'vibration' | 'sound'
export type Units = {
  kg: 'kg'
  lb: 'lb'
}

export type Themes = {
  light: 'light'
  dark: 'dark'
  system: 'system'
}

export type Theme = keyof Themes
export type Unit = keyof Units

export type Langs = {
  ru: 'ru'
  eng: 'eng'
}
export type Lang = keyof Langs

export type SettingsForm = {
  lang: Lang;
  theme: Theme;
  units: Unit;
  timers: {
    vibration: boolean;
    sound: boolean;
  };
}

export type SettingsUpdateSuccess = IResponse<SettingsForm>
export type GetSettingsSuccess = IResponse<SettingsForm>
export type GetSettingsError = IResponse<null, { lang?: string, theme?: string, units?: string }>

export type SettingsError = IResponse
