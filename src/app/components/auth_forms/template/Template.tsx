import Image from 'next/image'
import { Tabs, Card, Button } from 'antd'
import type { TabsProps } from 'antd'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import Login from '../login/Login'
import Signup from '../signup/Signup'
import { Dispatch, FC, SetStateAction, SyntheticEvent, useContext, useEffect, useState } from 'react'
import { changeLang, selectLang } from '@/src/app/store/slices/config'
import { useRouter } from 'next/router'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'
import { RouterContext } from '@/src/app/contexts/router/RouterContextProvider'
import RestorePassword from '../restore_password/RestorePassword'

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
  .ant-tabs-nav-list {
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
`

const FlagsContainer = styled.div`
  display: flex;
  position: absolute;
  right: 15px;
  top: 15px;
`

const LangButton = styled.button`
  width: 42px;
  height: 30px;
  font-size: 40px;
  line-height: 0px;
  padding: 0;
  margin-left: 10px;
  border: none;
  background-color: ${({ active }) => (active ? 'skyblue' : 'transparent')};
  &:focus {
    outline: 1px skyblue solid;
  }
`

const AuthTemplate = () => {
  const lang = useAppSelector(selectLang)
  const { intl } = useContext(IntlContext)
  const dispatch = useAppDispatch()
  const [ tab, setTab ] = useState(AUTH_FORM_TABS.LOGIN)
  const router = useRouter()
  const { loading } = useContext(RouterContext)

  const handleChangeLang = (e: SyntheticEvent<HTMLButtonElement>) => {
    const { dataset } = e.currentTarget as HTMLButtonElement
    dispatch(changeLang(dataset.lang))
  }

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
        <FlagsContainer>
          <LangButton active={lang === 'eng'} data-lang="eng" onClick={handleChangeLang}>
            <Image src="/icons/usa_flag.svg" width="38px" height="26px" />
          </LangButton>
          <LangButton active={lang === 'ru'} data-lang="ru" onClick={handleChangeLang}>
            <Image src="/icons/ru_flag.svg" width="38px" height="26px" />
          </LangButton>
        </FlagsContainer>

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
