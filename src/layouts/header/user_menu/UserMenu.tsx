import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Avatar, Button, Dropdown, Menu } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import style from './UserMenu.module.scss'
import { RouterContext } from 'app/contexts/router/RouterContextProvider'
import { logout } from '@/src/app/store/slices/auth'
import { useAppDispatch } from '@/src/app/hooks'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'


const StyledAvatar = styled(Avatar)`
  position: absolute;
  right: 3px;
`

const UserMenu = () => {
  const [ isOpen, setIsOpen ] = useState<boolean>(false)
  const { loading, loadingRoute } = useContext(RouterContext)
  const { intl } = useContext(IntlContext)
  const { route } = useRouter()
  const dispatch = useAppDispatch()
  const avatarFirstClicked = useRef(false)

  const profileLoading = loading && loadingRoute === '/profile'
  const mainLoading = loading && loadingRoute === '/'

  const menu = useMemo(function MenuItself() {
    const handleClick = () => dispatch(logout())
    const closeMenu = () => setIsOpen(false)

    return (
      <Menu style={{ width: '100%' }}>
        {route !== '/profile' 
          ? (
            <Menu.Item key="profile">
              <Button loading={profileLoading} type="link" block>
                <Link href="/profile">{intl.pages.profile.profile}</Link>
              </Button>
            </Menu.Item>
          )
          : (
            <Menu.Item key="main">
              <Button loading={mainLoading} type="link" block>
                <Link href="/">{intl.pages.profile.main}</Link>
              </Button>
            </Menu.Item>
          )}
        <Menu.Item key="logout" onClick={closeMenu}>
          <Button type="link" onClick={handleClick} block>{intl.pages.profile.logout}</Button>
        </Menu.Item>
      </Menu>
    )
  }, [ profileLoading, mainLoading ])

  const handleAvatarClick = () => !isOpen && setIsOpen(true)

  useEffect(() => {
    const handleDocumentClick = ({ target }) => {
      if (avatarFirstClicked.current && !target.closest('.ant-dropdown')) setIsOpen(false)
      if (!avatarFirstClicked.current) avatarFirstClicked.current = true
    }

    if (isOpen) {
      document.addEventListener('click', handleDocumentClick)
      return () => document.removeEventListener('click', handleDocumentClick)
    }
  }, [ isOpen ])

  // Here is a bug (or "feature", yea sure):
  // on first Avatar click for some reason
  // it calls handleDocumentClick as well.
  // That's why we need avatarFirstClicked.
  // So that we check if it was the first time
  // we clicked avatar
  useEffect(() => () => { avatarFirstClicked.current = false }, [])

  return (
    <Dropdown
      visible={isOpen}
      overlayStyle={{ width: 'calc(100% - 30px)', left: '0', right: '0', margin: 'auto', maxWidth: '768px' }}
      overlayClassName={style['user-menu-dropdown']}
      overlay={menu}
      placement="bottomRight"
    >
      <StyledAvatar onClick={handleAvatarClick} size="large" icon={<UserOutlined />} />
    </Dropdown>
  )
}

export default UserMenu
