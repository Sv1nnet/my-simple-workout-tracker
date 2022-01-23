import { FC, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form as AntForm, Input, Button, notification } from 'antd'
import { useAppDispatch } from 'app/hooks'
import styled from 'styled-components'
import { Login, LoginSuccess, Signup, SignupSuccess } from 'store/slices/auth/types'
import { useForm } from 'antd/lib/form/Form'
import { Rule } from 'antd/lib/form'
import { updateToken } from 'store/slices/auth'
import { ApiSignupError } from '../signup/Signup'
import { ApiLoginError } from '../login/Login'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'

const StyledButton = styled(Button)`
  margin-top: 1em;
`

interface IFormProps {
  type: string
  onSubmit: (values: Login | Signup) => void
  submitLabel: string
  active: boolean
  data?: SignupSuccess | LoginSuccess
  isFetching: boolean
  isError: boolean
  error: ApiSignupError | ApiLoginError | null
}

const Form: FC<IFormProps> = ({ type, active, submitLabel, onSubmit, data: resData = {}, isFetching, isError, error }) => {
  const { intl } = useContext(IntlContext)
  const dispatch = useAppDispatch()
  const [ form ] = useForm()
  const { data } = resData

  const validate = ({ getFieldValue }) => ({
    validator: async ({ field }, value) => {
      const isFieldName = name => name === field

      if (isFieldName('confirm_password')) {
        if (!value || getFieldValue('password') === value) return
        throw new Error(intl.auth_form.error_message.confirm_password.password_matching)
      }
    },
  })
  
  useEffect(() => {
    if (isError && error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: 'Error!', description: error?.data?.error.message })
    }
  }, [ isError ])

  useEffect(() => {
    if (!isError && data?.token) {
      dispatch(updateToken(data.token))
    }
  }, [ data?.token ])

  useEffect(() => {
    if (!active) form.resetFields()
  }, [ active ])

  return (
    <AntForm
      form={form}
      name={type}
      onFinish={onSubmit}
      layout="vertical"
    >
      <AntForm.Item label={intl.auth_form.email} name="email" rules={[
        { required: true, message: intl.auth_form.error_message.email.required },
        validate as Rule,
      ]}>
        <Input size="large" type="email" name="email" />
      </AntForm.Item>

      <AntForm.Item 
        label={intl.auth_form.password}
        name="password"
        rules={[
          { min: 6, message: intl.auth_form.error_message.password.len },
          { required: true, message: intl.auth_form.error_message.password.required },
        ]}
      >
        <Input.Password size="large" type="password" name="password" />
      </AntForm.Item>

      {type === 'signup' && (
        <AntForm.Item
          label={intl.auth_form.confirm_password}
          name="confirm_password"
          rules={[
            { required: true, message: intl.auth_form.error_message.confirm_password.required },
            validate as Rule,
          ]}
        >
          <Input.Password size="large" type="password" name="confirm_password" />
        </AntForm.Item>
      )}

      <AntForm.Item>
        <StyledButton size="large" type="primary" htmlType="submit" block loading={isFetching}>
          {submitLabel}
        </StyledButton>
      </AntForm.Item>
    </AntForm>
  )
}

Form.propTypes = {
  type: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
}

export default Form
