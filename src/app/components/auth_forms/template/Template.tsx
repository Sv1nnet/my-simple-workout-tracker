import { Tabs, Card, Button } from 'antd'
import Login from '../login/Login'
import Signup from '../signup/Signup'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useRouterContext } from 'app/contexts/router/RouterContextProvider'
import RestorePassword from 'components/auth_forms/restore_password/RestorePassword'
import ChangeLangPanel from 'components/change_lang_panel/ChangeLangPanel'
import { Container, FormContainer, StyledTabs } from './components/styled'

const { TabPane } = Tabs

export enum AUTH_FORM_TABS {
  LOGIN = 'login',
  SIGNUP = 'signup',
  RESTORE_PASSWORD = 'restore-password',
}

const AuthTemplate = () => {
  const { intl } = useIntlContext()
  const [ tab, setTab ] = useState(AUTH_FORM_TABS.LOGIN)
  const router = useRouter()
  const { loading } = useRouterContext()

  const handleRestorePasswordLinkClick = () => setTab(AUTH_FORM_TABS.RESTORE_PASSWORD)

  const handleSuccessRestorePassword = () => setTab(AUTH_FORM_TABS.LOGIN)

  useEffect(() => {
    if (router.pathname !== '/') {
      router.push('/')
    }
  }, [])

  return (
    <Container>
      <FormContainer>
        <ChangeLangPanel />

        <Card bordered={false} size="small">
          <StyledTabs onChange={setTab as Dispatch<SetStateAction<string>>} activeKey={tab} size="large" defaultActiveKey={AUTH_FORM_TABS.LOGIN}>
            <TabPane tab={intl.auth_form.login_tab} key={AUTH_FORM_TABS.LOGIN}>
              <Login active={tab === AUTH_FORM_TABS.LOGIN} loading={loading} />
            </TabPane>
            <TabPane tab={intl.auth_form.signup_tab} key={AUTH_FORM_TABS.SIGNUP}>
              <Signup active={tab === AUTH_FORM_TABS.SIGNUP} loading={loading} />
            </TabPane>
            <TabPane tab={intl.auth_form.restore_password} key={AUTH_FORM_TABS.RESTORE_PASSWORD}>
              <RestorePassword onSuccess={handleSuccessRestorePassword} active={tab === AUTH_FORM_TABS.RESTORE_PASSWORD} loading={loading} />
            </TabPane>
          </StyledTabs>
          {tab !== AUTH_FORM_TABS.RESTORE_PASSWORD && (
            <Button block type="link" onClick={handleRestorePasswordLinkClick}>
              {intl.auth_form.restore_password}
            </Button>
          )}
        </Card>
      </FormContainer>
    </Container>
  )
}

export default AuthTemplate
