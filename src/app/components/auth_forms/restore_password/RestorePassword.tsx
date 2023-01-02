import Form from '../form/Form'
import { FC, useEffect } from 'react'
import { authApi } from 'store/slices/auth/api'
import { SignupError } from 'store/slices/auth/types'
import { useIntlContext } from '@/src/app/contexts/intl/IntContextProvider'
import { AUTH_FORM_TABS } from '../template/Template'
import { notification } from 'antd'

interface IProps {
  active: boolean;
  loading: boolean;
  onSuccess: Function;
}

export type SignupQueryResult = ReturnType<typeof authApi.useLazySignupQuery>
export type ApiSignupError = {
  data: SignupError
  status: number
}

const RestorePassword: FC<IProps> = ({ active, loading, onSuccess }) => {
  const { intl } = useIntlContext()
  const [ restorePassword, stateResult ] = authApi.useLazyRestorePasswordQuery()

  const handleSubmit = async (values) => {
    const { confirm_password: _, ...formData } = values
    
    return restorePassword(formData)
  }
  
  useEffect(() => {
    if (!stateResult.isUninitialized && !stateResult.isFetching && !stateResult.error) {
      notification.success({
        message: 'Password restored!',
        description: 'You can login with your new password now.',
      })
      onSuccess()
    }
  }, [ stateResult.isFetching, stateResult.error ])

  return (
    <Form
      data={stateResult.data}
      loading={loading}
      isFetching={stateResult.isFetching}
      isError={stateResult.isError}
      error={stateResult.error as ApiSignupError}
      active={active}
      type={AUTH_FORM_TABS.RESTORE_PASSWORD}
      onSubmit={handleSubmit}
      submitLabel={intl.auth_form.signup_submit_label}
    />
  )
}

export default RestorePassword
