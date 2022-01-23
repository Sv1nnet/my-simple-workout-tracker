import int from 'constants/int.json'
import PropTypes from 'prop-types'
import { useAppSelector } from '@/src/app/hooks'
import Form from '../form/Form'
import { FC } from 'react'
import { authApi } from 'store/slices/auth/api'
import { SignupError } from 'store/slices/auth/types'
import { selectLang } from '@/src/app/store/slices/config'

interface IProps {
  active: boolean
}

export type SignupQueryResult = ReturnType<typeof authApi.useLazySignupQuery>
export type ApiSignupError = {
  data: SignupError
  status: number
}

const Signup: FC<IProps> = ({ active }) => {
  const lang = useAppSelector(selectLang)
  const [ signup, stateResult ] = authApi.useLazySignupQuery()

  const handleSubmit = (values) => {
    const { confirm_password: _, ...formData } = values
    return signup(formData)
  }

  return (
    <Form
      data={stateResult.data}
      isFetching={stateResult.isFetching}
      isError={stateResult.isError}
      error={stateResult.error as ApiSignupError}
      active={active}
      type="signup"
      onSubmit={handleSubmit}
      submitLabel={int.auth_form.signup_submit_label[lang]}
    />
  )
}

Signup.propTypes = {
  active: PropTypes.bool.isRequired,
}

export default Signup
