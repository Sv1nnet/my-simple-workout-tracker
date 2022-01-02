import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Avatar, Button, Dropdown, Menu } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { authApi } from 'store/slices/auth/api'
import style from './UserMenu.module.scss'
import { RouterContext } from 'app/contexts/router/RouterContextProvider'


const StyledAvatar = styled(Avatar)`
  position: absolute;
  right: 3px;
`

const UserMenu = () => {
  const [ logout ] = authApi.useLazyLogoutQuery()
  const [ isOpen, setIsOpen ] = useState<boolean>(false)
  const { loading, loadingRoute } = useContext(RouterContext)
  const { route } = useRouter()
  const avatarFirstClicked = useRef(false)

  const profileLoading = loading && loadingRoute === '/profile'
  const mainLoading = loading && loadingRoute === '/'

  const menu = useMemo(function MenuItself() {
    const handleClick = () => logout()
    const closeMenu = () => setIsOpen(false)

    return (
      <Menu style={{ width: '100%' }}>
        {route !== '/profile' 
          ? (
            <Menu.Item key="profile">
              <Button loading={profileLoading} type="link" block>
                <Link href="/profile">Profile</Link>
              </Button>
            </Menu.Item>
          )
          : (
            <Menu.Item key="main">
              <Button loading={mainLoading} type="link" block>
                <Link href="/">Main</Link>
              </Button>
            </Menu.Item>
          )}
        <Menu.Item key="logout" onClick={closeMenu}>
          <Button type="link" onClick={handleClick} block>Logout</Button>
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
