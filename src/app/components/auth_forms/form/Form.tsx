import { FC, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form as AntForm, Input, Button, notification } from 'antd'
import { useAppDispatch } from 'app/hooks'
import styled from 'styled-components'
import { Login, LoginSuccess, Signup, SignupSuccess } from 'store/slices/auth/types'
import { useForm } from 'antd/lib/form/Form'
import { Rule } from 'antd/lib/form'
import { updateToken } from 'store/slices/auth'
import { ApiLoginError } from '../login/Login'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useAppLoaderContext } from '@/src/app/contexts/loader/AppLoaderContextProvider'
import { AUTH_FORM_TABS } from '../template/Template'
import { changeLang } from '@/src/app/store/slices/config'
import { ApiSignupError } from '../signup/types'

const StyledButton = styled(Button)`
  margin-top: 1em;
`

interface IFormProps {
  type: string;
  signupCode?: string;
  onSubmit: (values: Login | Signup) => void;
  submitLabel: string;
  active: boolean;
  data?: SignupSuccess | LoginSuccess;
  loading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiSignupError | ApiLoginError | null;
}

const Form: FC<IFormProps> = ({ signupCode, type, active, loading, submitLabel, onSubmit, data: resData = { data: null }, isFetching, isError, error }) => {
  const { intl: { auth_form, signup_by_code, restore_password, modal }, lang } = useIntlContext()
  const { runLoader, stopLoaderById, forceStopLoader } = useAppLoaderContext()
  const dispatch = useAppDispatch()
  const [ form ] = useForm()
  const { data } = resData

  const validate = ({ getFieldValue }) => ({
    validator: async ({ field }, value) => {
      const isFieldName = name => name === field

      if (isFieldName('confirm_password')) {
        if (!value || getFieldValue('password') === value) return
        throw new Error(auth_form.error_message.confirm_password.password_matching)
      }
    },
  })

  const handleSubmit = values => onSubmit({ ...values, signup_code: values.signup_code ?? signupCode, settings: { lang } })
  
  useEffect(() => {
    if (isError && error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: modal.common.title.error, description: error?.data?.error?.message?.text?.[lang || 'eng'] })
    }
  }, [ isError ])

  useEffect(() => {
    if (!isError && data?.token) {
      dispatch(updateToken(data.token))
      if (data.lang) dispatch(changeLang(data.lang))
    }
  }, [ data?.token ])

  useEffect(() => {
    if (!active) form.resetFields()
  }, [ active ])

  useEffect(() => {
    if (loading) runLoader('auth', { tip: auth_form.loading, style: { top: '-72px' } })
    else stopLoaderById('auth')

    return forceStopLoader
  }, [ loading ])

  return (
    <AntForm
      form={form}
      name={type}
      onFinish={handleSubmit}
      layout="vertical"
    >
      {type !== AUTH_FORM_TABS.RESTORE_PASSWORD && (
        <AntForm.Item label={auth_form.email} name="email" rules={[
          { required: true, message: auth_form.error_message.email.required },
          validate as Rule,
        ]}>
          <Input size="large" type="email" name="email" />
        </AntForm.Item>
      )}

      {type === AUTH_FORM_TABS.RESTORE_PASSWORD && (
        <AntForm.Item label={restore_password.code_label} name="signup_code" rules={[
          { required: true, message: signup_by_code.error_message.code },
          validate as Rule,
        ]}>
          <Input size="large" type="text" name="signup_code" />
        </AntForm.Item>
      )}

      <AntForm.Item 
        label={auth_form.password}
        name="password"
        rules={[
          { min: 6, message: auth_form.error_message.password.len },
          { required: true, message: auth_form.error_message.password.required },
        ]}
      >
        <Input.Password size="large" type="password" name="password" />
      </AntForm.Item>

      {(type === AUTH_FORM_TABS.SIGNUP || type === AUTH_FORM_TABS.RESTORE_PASSWORD) && (
        <AntForm.Item
          label={auth_form.confirm_password}
          name="confirm_password"
          rules={[
            { required: true, message: auth_form.error_message.confirm_password.required },
            validate as Rule,
          ]}
        >
          <Input.Password size="large" type="password" name="confirm_password" />
        </AntForm.Item>
      )}

      <AntForm.Item>
        <StyledButton size="large" type="primary" htmlType="submit" block loading={isFetching}>
          {type === AUTH_FORM_TABS.RESTORE_PASSWORD
            ? restore_password.submit_label
            : submitLabel}
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
