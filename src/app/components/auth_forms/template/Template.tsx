import Image from 'next/image'
import Link from 'next/link'
import { Tabs, Card } from 'antd'
import type { TabsProps } from 'antd'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import Login from '../login/Login'
import Signup from '../signup/Signup'
import { FC, SyntheticEvent, useContext, useLayoutEffect, useState } from 'react'
import { changeLang, selectLang } from '@/src/app/store/slices/config'
import { useRouter } from 'next/router'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'

const { TabPane } = Tabs

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

const ResetPasswordLink = styled.span`
  display: block;
  text-align: center;
`

const AuthTemplate = () => {
  const lang = useAppSelector(selectLang)
  const { intl } = useContext(IntlContext)
  const dispatch = useAppDispatch()
  const [ tab, setTab ] = useState('login')
  const router = useRouter()

  const handleChangeLang = (e: SyntheticEvent<HTMLButtonElement>) => {
    const { dataset } = e.currentTarget as HTMLButtonElement
    dispatch(changeLang(dataset.lang))
  }

  useLayoutEffect(() => {
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
          <StyledTabs onChange={setTab} size="large" defaultActiveKey="login">
            <TabPane tab={intl.auth_form.login_tab} key="login">
              <Login active={tab === 'login'} />
            </TabPane>
            <TabPane tab={intl.auth_form.signup_tab} key="signup">
              <Signup active={tab === 'signup'} />
            </TabPane>
          </StyledTabs>
          <ResetPasswordLink>
            <Link href="/">
              Reset password
            </Link>
          </ResetPasswordLink>
        </Card>
      </FormContainer>
    </Container>
  )
}

export default AuthTemplate
