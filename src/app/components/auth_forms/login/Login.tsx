import PropTypes from 'prop-types'
import Form from '../form/Form'
import { FC, useContext } from 'react'
import { authApi } from 'store/slices/auth/api'
import { LoginError } from 'store/slices/auth/types'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'

interface IProps {
  active: boolean;
  loading: boolean;
}

export type ApiLoginError = {
  data: LoginError
  status: number
}

const Login: FC<IProps> = ({ active, loading }) => {
  const { intl } = useContext(IntlContext)
  const [ login, stateResult ] = authApi.useLazyLoginQuery()

  return (
    <Form
      data={stateResult.data}
      loading={loading}
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

Login.propTypes = {
  active: PropTypes.bool.isRequired,
}

export default Login
