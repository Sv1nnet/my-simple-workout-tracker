import { Tabs, Card, Button } from 'antd'
import type { TabsProps } from 'antd'
import styled from 'styled-components'
import Login from '../login/Login'
import Signup from '../signup/Signup'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useRouterContext } from 'app/contexts/router/RouterContextProvider'
import RestorePassword from 'components/auth_forms/restore_password/RestorePassword'
import ChangeLangPanel from 'components/change_lang_panel/ChangeLangPanel'

const { TabPane } = Tabs

export enum AUTH_FORM_TABS {
  LOGIN = 'login',
  SIGNUP = 'signup',
  RESTORE_PASSWORD = 'restore-password',
}

const Container = styled.div`
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
`

const FormContainer = styled.div`
  width: 100%;
  max-width: 425px;
  margin: 10vh auto 0;
`

const StyledTabs: FC<TabsProps> = styled(Tabs)`
  .ant-tabs-nav {
    .ant-tabs-nav-operations {
      display: none;
    }

    &-list {
      width: 100%;
      .ant-tabs-tab {
        width: 50%;
        justify-content: center;
        &:nth-child(3) {
          overflow: hidden;
          width: 0;
          padding: 0;
          margin: 0;
        }
      }
    }
  }
`

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
