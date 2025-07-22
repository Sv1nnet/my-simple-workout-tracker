import styled from 'styled-components'
import { Select } from 'antd'
import { changeLang, selectLang } from 'store/slices/config'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import UserMenu from 'layouts/header/user_menu/UserMenu'
import { configApi } from 'app/store/slices/config/api'
import { Lang } from 'app/store/slices/config/types'
import { selectIsNoAuthLogin } from 'app/store/slices/auth'
import NoAuthUserMenu from '../no_auth_user_menu/NoAuthUserMenu'

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

      background-color: var(--background-color);
      color: var(--textColor);
      border-color: var(--border-color-base);
    }
  }
`

const Label = styled.span`
  color: var(--text-color);
  padding-left: 12px;
  padding-right: 12px;
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
  const isNoAuthLogin = useAppSelector(selectIsNoAuthLogin)
  const lang = useAppSelector(selectLang)
  const dispatch = useAppDispatch()
  const [ updateConfig ] = configApi.useLazyUpdateQuery()

  const updateLang = (_lang: Lang) => {
    dispatch(changeLang(_lang))
    updateConfig({ config: { lang: _lang } })
  }

  return (
    <Wrapper>
      {
        isNoAuthLogin
          ? <NoAuthUserMenu />
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
            label: <Label>EN</Label>,
          },
          {
            value: 'ru',
            label: <Label>РУ</Label>,
          },
        ]}
      />
    </Wrapper>
  )
}

export default Content
