import { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { HeaderWithoutNav } from 'layouts/header'
import { Form, Input, Button, notification } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { Rule } from 'antd/lib/form'
import { useAppSelector } from 'app/hooks'
import { profileApi } from 'store/slices/profile/api'
import { selectToken } from 'store/slices/auth'
import { selectCredentials } from 'store/slices/profile'
import { CustomBaseQueryError } from '../app/store/utils/baseQueryWithReauth'
import { IntlContext } from '../app/contexts/intl/IntContextProvider'

const StyledButton = styled(Button)`
  margin-top: 1em;
`

const FormWrapper = styled(Form)`
  padding: 12px;
`

const Profile = () => {
  const { intl } = useContext(IntlContext)
  const token = useAppSelector(selectToken)
  const credentials = useAppSelector(selectCredentials)
  const [ form ] = useForm()
  const [ fetchProfile, { isLoading, isFetching } ] = profileApi.useLazyGetQuery()
  const [ updateProfile, { isLoading: isUpdating, isError, error } ] = profileApi.useLazyUpdateQuery()

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

  const handleSubmit = async ({ email, password, new_password }) => {
    try {
      await updateProfile({ profile: { email, password, new_password }, token })
      form.setFieldsValue({ email, password: '', new_password: '', confirm_password: '' })
    } catch {}
  }

  useEffect(() => {
    if (isError && error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: 'Error!', description: intl.pages.profile.error.message })
      form.setFields([
        {
          name: 'password',
          errors: [ (error as CustomBaseQueryError)?.data?.error?.message.validation.password ],
        },
      ])
    }
  }, [ isError, (error as CustomBaseQueryError)?.data?.error?.message, (error as CustomBaseQueryError)?.data?.error?.message.validation ])

  useEffect(() => {
    form.setFieldsValue({ ...credentials })
  }, [ credentials.email ])

  useEffect(() => {
    fetchProfile(token)
  }, [])

  return (
    <FormWrapper
      initialValues={credentials}
      form={form}
      name="profile"
      onFinish={handleSubmit}
      layout="vertical"
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

      <Form.Item>
        <StyledButton
          size="large"
          type="primary"
          htmlType="submit"
          block
          loading={isLoading || isFetching || isUpdating}
        >
          {intl.pages.profile.save_button}
        </StyledButton>
      </Form.Item>
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
