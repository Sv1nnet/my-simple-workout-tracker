import { authApi } from '@/src/app/store/slices/auth/api'
import { SignupError } from '@/src/app/store/slices/auth/types'

export interface IProps {
  active: boolean;
  loading: boolean;
  onSuccess: Function;
}

export type SignupQueryResult = ReturnType<typeof authApi.useLazySignupQuery>
export type ApiSignupError = {
  data: SignupError
  status: number
}
