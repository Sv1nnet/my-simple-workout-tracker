import PropTypes from 'prop-types'
import Form from '../form/Form'
import { FC, useState } from 'react'
import { authApi } from 'store/slices/auth/api'
import { SignupError } from 'store/slices/auth/types'
import { useIntlContext } from '@/src/app/contexts/intl/IntContextProvider'
import SignupByCodeForm from '../signup_by_code_form/SignupByCodeForm'

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
  const { intl } = useIntlContext()
  const [ codeVerifySuccess, setCodeVerifySuccess ] = useState(false)
  const [ signupCode, setSignupCode ] = useState(null)
  const [ signup, stateResult ] = authApi.useLazySignupQuery()

  const handleCodeVerifySuccess = ({ signup_code }) => {
    setCodeVerifySuccess(true)
    setSignupCode(signup_code)
  }

  const handleSubmit = (values) => {
    const { confirm_password: _, ...formData } = values
    return signup(formData)
  }

  return !codeVerifySuccess
    ? <SignupByCodeForm onVerifySuccess={handleCodeVerifySuccess} />
    : (
      <Form
        data={stateResult.data}
        loading={loading}
        isFetching={stateResult.isFetching}
        isError={stateResult.isError}
        error={stateResult.error as ApiSignupError}
        active={active}
        type="signup"
        signupCode={signupCode}
        onSubmit={handleSubmit}
        submitLabel={intl.auth_form.signup_submit_label}
      />
    )
}

Signup.propTypes = {
  active: PropTypes.bool.isRequired,
}

export default Signup
