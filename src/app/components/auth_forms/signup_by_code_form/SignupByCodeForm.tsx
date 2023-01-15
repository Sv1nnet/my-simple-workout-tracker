import { FC, useContext, useEffect } from 'react'
import { Form as AntForm, Input, Button, notification, Typography } from 'antd'
import styled from 'styled-components'
import { useForm } from 'antd/lib/form/Form'
import { VerifySignupCodeError } from 'store/slices/auth/types'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { AppLoaderContext } from 'app/contexts/loader/AppLoaderContextProvider'
import { authApi } from 'app/store/slices/auth/api'

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
  const { intl, lang } = useIntlContext()
  const { signup_by_code, modal } = intl
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
      openNotification({ message: modal.common.title.error, description: (error as ApiVerifySignupCodeError)?.data?.error?.message?.text?.[lang || 'eng'] })
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
        { required: true, message: signup_by_code.error_message.code },
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
