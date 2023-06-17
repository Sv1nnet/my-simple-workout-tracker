import { authApi } from 'app/store/slices/auth/api'
import { SignupError } from 'app/store/slices/auth/types'

export interface IProps {
  active: boolean;
  onSuccess: Function;
}

export type SignupQueryResult = ReturnType<typeof authApi.useLazySignupQuery>
export type ApiSignupError = {
  data: SignupError
  status: number
}
