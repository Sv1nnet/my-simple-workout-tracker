import { FC, useContext, useEffect } from 'react'
import { Form as AntForm, Input, Button, notification, Typography } from 'antd'
import styled from 'styled-components'
import { useForm } from 'antd/lib/form/Form'
import { VerifySignupCodeError } from 'store/slices/auth/types'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'
import { AppLoaderContext } from '@/src/app/contexts/loader/AppLoaderContextProvider'
import { authApi } from '@/src/app/store/slices/auth/api'

const StyledButton = styled(Button)`
  margin-top: 1em;
`

export type ApiVerifySignupCodeError = {
  data: VerifySignupCodeError;
  status: number;
}

interface IFormProps {
  onVerifySuccess: Function;
}

const SignupByCodeForm: FC<IFormProps> = ({ onVerifySuccess }) => {
  const { intl } = useContext(IntlContext)
  const { signup_by_code } = intl
  const [ verify, { data, isLoading, error, isError } ] = authApi.useLazyVerifySignupCodeQuery()

  const { runLoader, stopLoaderById, forceStopLoader } = useContext(AppLoaderContext)
  const [ form ] = useForm()

  const handleSubmit = ({ code }) => verify(code)
  
  useEffect(() => {
    if (isError && error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: 'Error!', description: (error as ApiVerifySignupCodeError)?.data?.error.message.text })
    }
  }, [ isError ])

  useEffect(() => {
    if (isLoading) runLoader('code_verify', { tip: signup_by_code.loading, style: { top: '-72px' } })
    else stopLoaderById('code_verify')

    return forceStopLoader
  }, [ isLoading ])

  useEffect(() => {
    if (data?.success) {
      onVerifySuccess(data.data)
    }
  }, [ data ])

  return (
    <AntForm
      form={form}
      name="verify"
      onFinish={handleSubmit}
      layout="vertical"
    >
      <AntForm.Item label={signup_by_code.code_label} name="code" rules={[
        { required: true, message: signup_by_code.error_message.code.required },
      ]}>
        <Input size="large" type="text" name="code" />
      </AntForm.Item>

      <Typography.Text>{signup_by_code.signup_code_tip}</Typography.Text>

      <AntForm.Item>
        <StyledButton size="large" type="primary" htmlType="submit" block loading={isLoading}>
          {signup_by_code.submit_label}
        </StyledButton>
      </AntForm.Item>
    </AntForm>
  )
}

export default SignupByCodeForm
