import { IResponse } from '@/src/app/constants/response_types'

export type Token = {
  token: string
}

export type UserForm = {
  email: string;
  password: string;
}

export type Password = string

export type User = Pick<UserForm, 'email'>
export type Reset = Pick<UserForm, 'email'>
export type Restore = Pick<UserForm, 'email'>
export type Refresh = Pick<UserForm, 'email'>
export type Login = Pick<UserForm, 'email' | 'password'>
export type Signup = Pick<UserForm, 'email' | 'password'>

export type LoginSuccess = IResponse<Token>
export type LoginError = IResponse

export type SignupSuccess = IResponse<Token>
export type SignupError = IResponse<null, { email?: string, password?: string }>

export type ResetSuccess = IResponse
export type ResetError = IResponse<null, { email?: string }>

export type RestoreSuccess = IResponse
export type RestoreError = IResponse<null, { password?: string }>

export type RefreshSuccess = IResponse<Token>
export type RefreshError = IResponse

export type LogoutSuccess = IResponse
export type LogoutError = IResponse
