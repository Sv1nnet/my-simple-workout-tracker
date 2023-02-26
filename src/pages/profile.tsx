import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { HeaderWithoutNav } from 'layouts/header'
import { Form, Input, Button, notification } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { Rule } from 'antd/lib/form'
import { useAppSelector } from 'app/hooks'
import { profileApi } from 'store/slices/profile/api'
import { selectCredentials } from 'store/slices/profile'
import { CustomBaseQueryError } from 'store/utils/baseQueryWithReauth'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { ChangeLangPanel } from 'app/components'
import { configApi } from 'store/slices/config/api'
import { Lang } from 'store/slices/config/types'

const StyledButton = styled(Button)`
  margin-top: 1em;
`

const FormWrapper = styled(Form)`
  padding: 12px;
`

const StyledChangeLangPanel = styled(ChangeLangPanel)`
  position: static;
  justify-content: center;
  margin-top: 15px;
  margin-bottom: 5px;
`

const Profile = () => {
  const { intl, lang } = useIntlContext()
  const prevLangRef = useRef(lang)
  const credentials = useAppSelector(selectCredentials)
  const [ form ] = useForm()

  const [ updateConfig ] = configApi.useLazyUpdateQuery()
  const [ updateProfile, { isLoading: isUpdatingProfile, isError: isUpdateProfileError, error: updateProfileError, isSuccess: isUpdateProfileSuccess } ] = profileApi.useLazyUpdateQuery()

  const { isLoading: isProfileLoading, isFetching: isFetchingProfile } = profileApi.useGetQuery()
  configApi.useGetQuery()

  const validate = ({ getFieldValue }) => ({
    async validator({ field }, value) {
      if (field === 'new_password' && value) {
        if (getFieldValue('confirm_password') === value) return
        throw new Error(intl.pages.profile.validation_error.password_matching)
      }
      if (field === 'confirm_password') {
        if (!value && getFieldValue('new_password')) throw new Error(intl.pages.profile.validation_error.confirm_password)
        if (getFieldValue('new_password') === value) return
        throw new Error(intl.pages.profile.validation_error.password_matching)
      }
    },
  })

  const handleSubmit = async ({ email, password, new_password, signup_code }) => {
    try {
      updateProfile({ profile: { email, password, new_password, signup_code: signup_code || undefined } })
    } catch (err) {
      console.warn('Changing profile info error', err.message)
    }
  }

  const updateLang = (_lang: Lang) => {
    updateConfig({ config: { lang: _lang } })
  }

  useEffect(() => {
    if (isUpdateProfileError && updateProfileError) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: intl.modal.common.title.error, description: intl.pages.profile.error.message })

      const errorMessages = Object
        .entries<string>((updateProfileError as CustomBaseQueryError)?.data?.error?.message.validation)
        .map<{ name: string, errors: string[] }>(([ field, message ]) => ({ name: field, errors: [ message ] }))
      
      form.setFields(errorMessages)
    }
  }, [
    isUpdateProfileError,
    (updateProfileError as CustomBaseQueryError)?.data?.error?.message?.validation,
  ])

  useEffect(() => {
    form.setFieldsValue({ ...credentials })
  }, [ credentials.email ])

  useEffect(() => {
    if (!isUpdatingProfile && isUpdateProfileSuccess) {
      const openNotification = ({ message, description }) => {
        notification.success({
          message,
          description,
        })
      }
      openNotification({ message: intl.pages.profile.success.message, description: intl.pages.profile.success.description })
      form.setFieldsValue({ password: '', new_password: '', confirm_password: '' })
    }
  }, [ isUpdatingProfile, isUpdateProfileError ])

  return (
    <FormWrapper
      initialValues={credentials}
      form={form}
      name="profile"
      onFinish={handleSubmit}
      layout="vertical"
      scrollToFirstError
    >
      <Form.Item
        label={intl.auth_form.email}
        name="email"
        rules={[
          { required: true, message: intl.auth_form.error_message.email.required },
        ]}
      >
        <Input size="large" type="email" />
      </Form.Item>

      <Form.Item
        label={intl.auth_form.password}
        name="password"
        shouldUpdate={() => lang !== prevLangRef.current}
        rules={[
          { min: 6, message: intl.auth_form.error_message.password.len },
          { required: true, message: intl.auth_form.error_message.password.required },
        ]}
      >
        <Input.Password size="large" />
      </Form.Item>

      <Form.Item
        label={intl.auth_form.new_password}
        name="new_password"
        dependencies={[ 'confirm_password' ]}
        rules={[
          { min: 6, message: intl.auth_form.error_message.password.len },
          validate as Rule,
        ]}
        validateFirst
      >
        <Input.Password size="large" />
      </Form.Item>

      <Form.Item 
        label={intl.auth_form.confirm_password}
        name="confirm_password"
        dependencies={[ 'new_password' ]}
        rules={[
          validate as Rule,
        ]}
        validateFirst
      >
        <Input.Password size="large" />
      </Form.Item>

      <Form.Item
        label={intl.pages.profile.new_signup_code}
        name="signup_code"
        extra={intl.pages.profile.signup_code_tip}
        rules={[
          { min: 6, message: intl.auth_form.error_message.signup_code.len },
          validate as Rule,
        ]}
      >
        <Input type="text" size="large" />
      </Form.Item>

      <Form.Item style={{ marginBottom: '0px' }}>
        <StyledButton
          size="large"
          type="primary"
          htmlType="submit"
          block
          loading={isProfileLoading || isFetchingProfile || isUpdatingProfile}
        >
          {intl.pages.profile.save_button}
        </StyledButton>
      </Form.Item>

      <StyledChangeLangPanel onChange={updateLang} />
    </FormWrapper>
  )
}

Profile.Layout = HeaderWithoutNav

export default Profile

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    return {
      props: {
        token: ctx.req.session.token,
      },
    }
  }
  return ({ props: {} })
})
