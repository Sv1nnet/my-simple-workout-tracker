import PropTypes from 'prop-types'
import Form from '../form/Form'
import { FC, useContext } from 'react'
import { authApi } from 'store/slices/auth/api'
import { SignupError } from 'store/slices/auth/types'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'

interface IProps {
  active: boolean;
  loading: boolean;
}

export type SignupQueryResult = ReturnType<typeof authApi.useLazySignupQuery>
export type ApiSignupError = {
  data: SignupError
  status: number
}

const Signup: FC<IProps> = ({ active, loading }) => {
  const { intl } = useContext(IntlContext)
  const [ signup, stateResult ] = authApi.useLazySignupQuery()

  const handleSubmit = (values) => {
    const { confirm_password: _, ...formData } = values
    return signup(formData)
  }

  return (
    <Form
      data={stateResult.data}
      loading={loading}
      isFetching={stateResult.isFetching}
      isError={stateResult.isError}
      error={stateResult.error as ApiSignupError}
      active={active}
      type="signup"
      onSubmit={handleSubmit}
      submitLabel={intl.auth_form.signup_submit_label}
    />
  )
}

Signup.propTypes = {
  active: PropTypes.bool.isRequired,
}

export default Signup
