import { useEffect, useMemo, useState } from 'react'
import { Avatar, Button, Dropdown } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import style from './UserMenu.module.scss'
import { logout } from 'app/store/slices/auth'
import { useAppDispatch } from 'app/hooks'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { AnyAction } from '@reduxjs/toolkit'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from 'src/router'

const StyledAvatar = styled(Avatar)`
  position: absolute;
  right: 3px;
  cursor: pointer;
`

const UserMenu = () => {
  const [ isOpen, setIsOpen ] = useState<boolean>(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { intl, lang } = useIntlContext()
  const dispatch = useAppDispatch()

  const items = useMemo(function MenuItself() {
    const handleClick = () => {
      dispatch(logout() as unknown as AnyAction)
      navigate('/')
    }
    const closeMenu = () => setIsOpen(false)

    return [
      ...(location.pathname !== ROUTES.PROFILE
        ? [
          {
            key: 'profile',
            label: (
              <Button /* loading={profileLoading} */ type="link" block onClick={closeMenu}>
                <Link to={ROUTES.PROFILE}>{intl.header.profile}</Link>
              </Button>
            ),
          },
        ]
        : [
          {
            key: 'exercises',
            label: (
              <Button type="link" block onClick={closeMenu}>
                <Link to={ROUTES.EXERCISES}>{`${intl.header.exercises}`}</Link>
              </Button>
            ),
          },
          {
            key: 'workouts',
            label: (
              <Button type="link" block onClick={closeMenu}>
                <Link to={ROUTES.WORKOUTS}>{`${intl.header.workouts}`}</Link>
              </Button>
            ),
          },
          {
            key: 'activities',
            label: (
              <Button type="link" block onClick={closeMenu}>
                <Link to={ROUTES.ACTIVITIES}>{`${intl.header.activities}`}</Link>
              </Button>
            ),
          },
        ]),
      {
        key: 'logout',
        label: <Button type="link" onClick={handleClick} block>{intl.pages.profile.logout}</Button>,
      },
    ]
  }, [ lang, location ])

  const handleAvatarClick = (e) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleDocumentClick = ({ target }) => {
      if (!target.closest('.ant-dropdown')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleDocumentClick)
      return () => document.removeEventListener('click', handleDocumentClick)
    }
  }, [ isOpen ])

  return (
    <Dropdown
      destroyPopupOnHide
      open={isOpen}
      overlayStyle={{ width: 'calc(100% - 30px)', left: '0', right: '0', margin: 'auto', maxWidth: '475px' }}
      overlayClassName={style['user-menu-dropdown']}
      menu={{ items }}
      placement="bottomRight"
    >
      <StyledAvatar onClick={handleAvatarClick} size="large" icon={<UserOutlined />} />
    </Dropdown>
  )
}

export default UserMenu
