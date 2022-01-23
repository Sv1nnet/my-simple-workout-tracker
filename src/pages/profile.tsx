import { useEffect } from 'react'
import styled from 'styled-components'
import { HeaderWithoutNav } from 'layouts/header'
import { Form, Input, Button, notification } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import int from 'constants/int.json'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { Rule } from 'antd/lib/form'
import { useAppSelector } from 'app/hooks'
import { profileApi } from 'store/slices/profile/api'
import { selectToken } from 'store/slices/auth'
import { selectLang } from 'store/slices/config'
import { selectCredentials } from 'store/slices/profile'
import { CustomBaseQueryError } from '../app/store/utils/baseQueryWithReauth'

const StyledButton = styled(Button)`
  margin-top: 1em;
`

const FormWrapper = styled(Form)`
  padding: 12px;
`

const Profile = () => {
  const lang = useAppSelector(selectLang)
  const token = useAppSelector(selectToken)
  const credentials = useAppSelector(selectCredentials)
  const [ form ] = useForm()
  const [ fetchProfile, { isLoading, isFetching } ] = profileApi.useLazyGetQuery()
  const [ updateProfile, { isLoading: isUpdating, isError, error } ] = profileApi.useLazyUpdateQuery()

  const validate = ({ getFieldValue }) => ({
    async validator({ field }, value) {
      if (field === 'new_password' && value) {
        if (getFieldValue('confirm_password') === value) return
        throw new Error('Passwords do not match')
      }
      if (field === 'confirm_password') {
        if (!value && getFieldValue('new_password')) throw new Error('Please confirm your password')
        if (getFieldValue('new_password') === value) return
        throw new Error('Passwords do not match')
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
      openNotification({ message: 'Error!', description: int.pages.profile.error.message[lang] })
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
        label={int.auth_form.email[lang]}
        name="email"
        rules={[
          { required: true, message: int.auth_form.error_message.email.required[lang] },
        ]}
      >
        <Input size="large" type="email" />
      </Form.Item>

      <Form.Item 
        label={int.auth_form.password[lang]}
        name="password"
        rules={[
          { min: 6, message: int.auth_form.error_message.password.len[lang] },
          { required: true, message: int.auth_form.error_message.password.required[lang] },
        ]}
      >
        <Input.Password size="large" />
      </Form.Item>

      <Form.Item 
        label={int.auth_form.new_password[lang]}
        name="new_password"
        dependencies={[ 'confirm_password' ]}
        rules={[
          { min: 6, message: int.auth_form.error_message.password.len[lang] },
          validate as Rule,
        ]}
        validateFirst
      >
        <Input.Password size="large" />
      </Form.Item>

      <Form.Item 
        label={int.auth_form.confirm_password[lang]}
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
          {int.pages.profile.save_button[lang]}
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
