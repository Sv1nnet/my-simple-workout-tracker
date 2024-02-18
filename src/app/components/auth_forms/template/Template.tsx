import { Card, Button } from 'antd'
import Login from '../login/Login'
import Signup from '../signup/Signup'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import RestorePassword from 'components/auth_forms/restore_password/RestorePassword'
import ChangeLangPanel from 'components/change_lang_panel/ChangeLangPanel'
import { Container, FormContainer, StyledTabs } from './components/styled'
import { useAppDispatch } from 'app/hooks'
import { loginWithNoAuth } from 'app/store/slices/auth'
import browserDB from 'app/store/BrowserDB'

export enum AUTH_FORM_TABS {
  LOGIN = 'login',
  SIGNUP = 'signup',
  RESTORE_PASSWORD = 'restore-password',
}

const AuthTemplate = () => {
  const { intl } = useIntlContext()
  const [ tab, setTab ] = useState(AUTH_FORM_TABS.LOGIN)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const handleRestorePasswordLinkClick = () => setTab(AUTH_FORM_TABS.RESTORE_PASSWORD)

  const handleSuccessRestorePassword = () => setTab(AUTH_FORM_TABS.LOGIN)

  const handleLoginWithoutCreds = () => {
    browserDB.initNoAuthDB(() => {
      dispatch(loginWithNoAuth())
    })
  }

  const items = useMemo(() => (
    [
      {
        key: AUTH_FORM_TABS.LOGIN,
        label: intl.auth_form.login_tab,
        children: <Login active={tab === AUTH_FORM_TABS.LOGIN} />,
      },
      {
        key: AUTH_FORM_TABS.SIGNUP,
        label: intl.auth_form.signup_tab,
        children: <Signup active={tab === AUTH_FORM_TABS.SIGNUP} />,
      },
      {
        key: AUTH_FORM_TABS.RESTORE_PASSWORD,
        label: intl.auth_form.restore_password,
        children: <RestorePassword onSuccess={handleSuccessRestorePassword} active={tab === AUTH_FORM_TABS.RESTORE_PASSWORD} />,
      },
    ]
  ), [ tab ])

  useEffect(() => {
    if (location.pathname !== '/') {
      navigate('/')
    }
  }, [])

  return (
    <Container>
      <FormContainer>
        <ChangeLangPanel />

        <Card bordered={false} size="small">
          <StyledTabs
            onChange={setTab as Dispatch<SetStateAction<string>>}
            activeKey={tab}
            size="large"
            defaultActiveKey={AUTH_FORM_TABS.LOGIN}
            items={items}
          />
          <Button block type="link" onClick={handleLoginWithoutCreds}>
            {intl.auth_form.continue_without_login}
          </Button>
          {tab !== AUTH_FORM_TABS.RESTORE_PASSWORD && (
            <Button block style={{ marginTop: 8 }} type="link" onClick={handleRestorePasswordLinkClick}>
              {intl.auth_form.restore_password}
            </Button>
          )}
        </Card>
      </FormContainer>
    </Container>
  )
}

export default AuthTemplate
