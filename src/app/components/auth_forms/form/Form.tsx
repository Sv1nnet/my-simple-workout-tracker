import { FC, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form as AntForm, Input, Button, notification } from 'antd'
import int from 'constants/int.json'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import styled from 'styled-components'
import { Login, LoginSuccess, Signup, SignupSuccess } from 'store/slices/auth/types'
import { useForm } from 'antd/lib/form/Form'
import { Rule } from 'antd/lib/form'
import { updateToken } from 'store/slices/auth'
import { ApiSignupError } from '../signup/Signup'
import { ApiLoginError } from '../login/Login'

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
  const { lang }  = useAppSelector(state => state.config)
  const dispatch = useAppDispatch()
  const [ form ] = useForm()
  const { data } = resData

  const validate = ({ getFieldValue }) => ({
    validator: async ({ field }, value) => {
      const isFieldName = name => name === field

      if (isFieldName('confirm-password')) {
        if (!value || getFieldValue('password') === value) return
        throw new Error('Passwords do not match!')
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
      dispatch(updateToken(data?.token))
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
      <AntForm.Item label={int.auth_form.email[lang]} name="email" rules={[
        { required: true, message: int.auth_form.error_message.email.required[lang] },
        validate as Rule,
      ]}>
        <Input size="large" type="email" name="email" />
      </AntForm.Item>

      <AntForm.Item 
        label={int.auth_form.password[lang]}
        name="password"
        rules={[
          { min: 6, message: int.auth_form.error_message.password.len[lang] },
          { required: true, message: int.auth_form.error_message.password.required[lang] },
        ]}
      >
        <Input.Password size="large" type="password" name="password" />
      </AntForm.Item>

      {type === 'signup' && (
        <AntForm.Item
          label={int.auth_form.confirm_password[lang]}
          name="confirm_password"
          rules={[
            { required: true, message: int.auth_form.error_message.confirm_password.required[lang] },
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
