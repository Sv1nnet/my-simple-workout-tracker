import { IResponse } from 'app/constants/response_types'

export type Units = {
  kg: 'kg'
  lb: 'lb'
}
export type Unit = keyof Units

export type Langs = {
  ru: 'ru'
  eng: 'eng'
}
export type Lang = keyof Langs
  
export type Themes = {
  light: 'light'
  dark: 'dark'
  system: 'system'
}
export type Theme = keyof Themes

export type Config = {
  lang: Lang,
  theme: Theme,
  units: Unit,
}

export type GetConfigSuccess = IResponse<Config>
export type GetConfigError = IResponse<null>

export type UpdateConfigSuccess = IResponse<Config>
export type UpdateConfigError = IResponse<null>
