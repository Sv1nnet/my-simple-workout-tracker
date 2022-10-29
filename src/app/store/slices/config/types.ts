import { IResponse } from 'app/constants/response_types'
import { langs } from '.'

export type ILangs = {
  ru: 'ru'
  eng: 'eng'
}

export type LangKeys = keyof typeof langs

export type Lang = typeof langs[LangKeys]

export type Config = {
  lang: Lang,
}

export type GetConfigSuccess = IResponse<Config>
export type GetConfigError = IResponse<null>

export type UpdateConfigSuccess = IResponse<Config>
export type UpdateConfigError = IResponse<null>
