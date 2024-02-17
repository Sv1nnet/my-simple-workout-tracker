import styled from 'styled-components'
import { Button, Select } from 'antd'
import { changeLang, selectLang } from 'store/slices/config'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import UserMenu from 'layouts/header/user_menu/UserMenu'
import { configApi } from 'app/store/slices/config/api'
import { Lang } from 'app/store/slices/config/types'
import { LoginOutlined } from '@ant-design/icons'
import { logoutWithNoCreds, selectIsNoCredsLogin } from 'app/store/slices/auth'

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;

  .ant-select {
    margin-left: 16px;

    .ant-select-selector {
      padding-left: 2px;
      padding-right: 2px;
    }
  }
`

const StyledButton = styled(Button)`
  position: absolute;
  margin-right: 13px;
  right: 3px;
  cursor: pointer;
`

const OptionsContainer = styled.div`
  & .ant-select-item.ant-select-item-option {
    padding: 0;

    .ant-select-item-option-content {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`

const Content = () => {
  const isNoCredsLogin = useAppSelector(selectIsNoCredsLogin)
  const lang = useAppSelector(selectLang)
  const dispatch = useAppDispatch()
  const [ updateConfig ] = configApi.useLazyUpdateQuery()

  const updateLang = (_lang: Lang) => {
    dispatch(changeLang(_lang))
    updateConfig({ config: { lang: _lang } })
  }

  const logout = () => {
    dispatch(logoutWithNoCreds())
  }

  return (
    <Wrapper>
      {
        isNoCredsLogin ?
          <StyledButton shape="circle" onClick={logout} icon={<LoginOutlined />} size="large" />
          : <UserMenu />
      }
      <Select
        showArrow={false}
        value={lang}
        onChange={updateLang}
        dropdownRender={options => (
          <OptionsContainer>
            {options}
          </OptionsContainer>
        )}
        options={[
          {
            value: 'eng',
            label: <span style={{ paddingLeft: 12, paddingRight: 12 }}>EN</span>,
          },
          {
            value: 'ru',
            label: <span style={{ paddingLeft: 12, paddingRight: 12 }}>РУ</span>,
          },
        ]}
      />
    </Wrapper>
  )
}

export default Content
