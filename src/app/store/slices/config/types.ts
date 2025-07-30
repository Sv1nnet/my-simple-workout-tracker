import { IResponse } from 'app/constants/response_types'

export type Config = {
  isLoggedIn: boolean
}

export type GetConfigSuccess = IResponse<Config>
export type GetConfigError = IResponse<null>

export type UpdateConfigSuccess = IResponse<Config>
export type UpdateConfigError = IResponse<null>
