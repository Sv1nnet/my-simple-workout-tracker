import Form from '../form/Form'
import { FC } from 'react'
import { authApi } from 'store/slices/auth/api'
import { LoginError } from 'store/slices/auth/types'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

interface IProps {
  active: boolean;
}

export type ApiLoginError = {
  data: LoginError
  status: number
}

const Login: FC<IProps> = ({ active }) => {
  const { intl } = useIntlContext()
  const [ login, stateResult ] = authApi.useLazyLoginQuery()

  return (
    <Form
      data={stateResult.data}
      isFetching={stateResult.isFetching}
      isError={stateResult.isError}
      error={stateResult.error as ApiLoginError}
      active={active}
      type="login"
      onSubmit={login}
      submitLabel={intl.auth_form.login_submit_label as string}
    />
  )
}

export default Login
