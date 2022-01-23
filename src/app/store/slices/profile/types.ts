import { IResponse } from '@/src/app/constants/response_types'

export type ProfileForm = {
  email: string;
  password: string;
  new_password?: string;
}

export type Password = string

export type Profile = Pick<ProfileForm, 'email'>
export type Email = Pick<ProfileForm, 'email'>

export type ProfileUpdateSuccess = IResponse<Email>
export type GetProfileSuccess = IResponse<Email>
export type GetProfileError = IResponse<null, { email?: string, password?: string }>

export type ProfileError = IResponse
