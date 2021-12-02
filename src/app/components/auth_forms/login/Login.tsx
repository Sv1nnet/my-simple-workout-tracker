import int from 'constants/int.json'
import PropTypes from 'prop-types'
import { useAppSelector } from 'app/hooks'
import Form from '../form/Form'
import { FC } from 'react'
import { authApi } from 'store/slices/auth/api'
import { LoginError } from 'store/slices/auth/types'

interface IProps {
  active: boolean
}

export type ApiLoginError = {
  data: LoginError
  status: number
}

const Login: FC<IProps> = ({ active }) => {
  const { lang } = useAppSelector(state => state.config)
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
      submitLabel={int.auth_form.login_submit_label[lang]}
    />
  )
}

Login.propTypes = {
  active: PropTypes.bool.isRequired,
}

export default Login
