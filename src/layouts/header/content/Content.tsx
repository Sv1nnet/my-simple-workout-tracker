import styled from 'styled-components'
import { useAppSelector } from 'app/hooks'
import UserMenu from 'layouts/header/user_menu/UserMenu'
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

const Content = () => {
  const isNoAuthLogin = useAppSelector(selectIsNoAuthLogin)

  return (
    <Wrapper>
      {
        isNoAuthLogin
          ? <NoAuthUserMenu />
          : <UserMenu />
      }
    </Wrapper>
  )
}

export default Content
