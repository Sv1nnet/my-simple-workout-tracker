import { ArrowRightOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useActivityInProgressContext } from 'app/contexts/activity/ActivityInProgressContextProvider'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useAppSelector } from 'app/hooks'
import { ACTIVITY_PAGE_TYPE, selectPageInfo } from 'app/store/slices/activity'
import { selectIsNoAuthLogin } from 'app/store/slices/auth'
import { routes } from 'src/router'
import UserMenu from 'layouts/header/user_menu/UserMenu'
import NoAuthUserMenu from '../no_auth_user_menu/NoAuthUserMenu'

const Wrapper = styled.div<{ $isNoAuthLogin?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;

  .header-continue-button {
    right: ${({ $isNoAuthLogin }) => $isNoAuthLogin ? '3px' : '48px'};
  }

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

const ContinueLink = styled(Link)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  display: inline-flex;
  color: white;

  &:hover,
  &:focus {
    color: white;
  }
`

const ContinueButton = styled(Button)`
  width: 40px;
  height: 40px;
  padding: 0;
  color: #fff !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;

  &:focus,
  &:hover,
  &:active {
    color: #fff !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  .anticon,
  .anticon svg {
    font-size: 22px;
    color: #fff;
    fill: #fff;
  }
`

const HeaderContinueButton = () => {
  const { activity } = useActivityInProgressContext()
  const { pageType } = useAppSelector(selectPageInfo)
  const { intl } = useIntlContext()
  const showContinue = Boolean(activity) && pageType !== ACTIVITY_PAGE_TYPE.CREATE

  if (!showContinue) return null

  return (
    <ContinueLink
      className="header-continue-button"
      to={routes.activities.create()}
      aria-label={intl.pages.activities.list_buttons.continue}
    >
      <ContinueButton type="text" icon={<ArrowRightOutlined />} />
    </ContinueLink>
  )
}

const Content = () => {
  const isNoAuthLogin = useAppSelector(selectIsNoAuthLogin)

  return (
    <Wrapper $isNoAuthLogin={isNoAuthLogin}>
      <HeaderContinueButton />
      {
        isNoAuthLogin
          ? <NoAuthUserMenu />
          : <UserMenu />
      }
    </Wrapper>
  )
}

export default Content
