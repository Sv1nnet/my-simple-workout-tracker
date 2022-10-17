import { IResponse } from '@/src/app/constants/response_types'

export type Token = string

export type UserForm = {
  email: string;
  password: string;
}

export type Password = string

export type User = Pick<UserForm, 'email'>
export type Reset = Pick<UserForm, 'email'>
export type Restore = { signup_code: string, password: Pick<UserForm, 'password'> }
export type Refresh = Pick<UserForm, 'email'>
export type Login = Pick<UserForm, 'email' | 'password'>
export type Signup = Pick<UserForm, 'email' | 'password'>

export type LoginSuccess = IResponse<{ token: Token }>
export type LoginError = IResponse

export type SignupSuccess = IResponse<{ token: Token }>
export type SignupError = IResponse<null, { email?: string, password?: string }>

export type VerifySignupCodeSuccess = IResponse
export type VerifySignupCodeError = IResponse<null, { code?: string }>

export type ResetSuccess = IResponse
export type ResetError = IResponse<null, { email?: string }>

export type RestoreSuccess = IResponse
export type RestoreError = IResponse<null, { signup_code?: string, password?: string }>

export type RefreshSuccess = IResponse<{ token: Token }>
export type RefreshError = IResponse

export type LogoutSuccess = IResponse
export type LogoutError = IResponse
