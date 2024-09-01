import { useEffect, useMemo } from 'react'
import { Avatar, Button, Dropdown } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import style from './NoAuthUserMenu.module.scss'
import { useAppDispatch, useToggle } from 'app/hooks'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useLocation } from 'react-router-dom'
import { resetListState as resetExerciseListState } from 'app/store/slices/exercise'
import { resetListState as resetWorkoutListState } from 'app/store/slices/workout'
import { resetListState as resetActivityListState } from 'app/store/slices/activity'
import { logoutWithNoAuth } from 'app/store/slices/auth'
import { ImportOptionsModal, LogoutButton } from './components'
import browserDBLoader from 'app/store/utils/BrowserDB/browserDB.loader'

const StyledAvatar = styled(Avatar)`
  position: absolute;
  right: 3px;
  cursor: pointer;
`

const NoAuthUserMenu = () => {
  const { state: isOpen, toggle: toggleIsOpen, setFalse: closeMenu } = useToggle(false)
  const { state: isImportMenuOpen, setTrue: openImportMenu, setFalse: closeImportMenu } = useToggle(false)
  const location = useLocation()
  const { intl, lang } = useIntlContext()
  const dispatch = useAppDispatch()
  const { state: isMenuImmediatelyClosed, setFalse: removeMenuImmediateClosed, setTrue: closeMenuImmediately } = useToggle(false)

  const items = useMemo(function MenuItself() {
    const navigateToLoginPage = async () => {
      const db = await browserDBLoader.get()
      db.disconnect()

      dispatch(logoutWithNoAuth())
      dispatch(resetExerciseListState())
      dispatch(resetWorkoutListState())
      dispatch(resetActivityListState())
    }

    const importData = () => {
      closeMenu()
      closeMenuImmediately()
    }

    const exportData = () => {
      closeMenu()
      openImportMenu()
      closeMenuImmediately()
    }

    return [
      {
        key: 'login',
        label: (
          <Button type="link" block onClick={navigateToLoginPage}>
            {intl.header.login}
          </Button>
        ),
      },
      {
        key: 'import',
        label: (
          <Button type="link" block onClick={importData}>
            {intl.header.import}
          </Button>
        ),
      },
      {
        key: 'export',
        label: (
          <Button type="link" block onClick={exportData}>
            {intl.header.export}
          </Button>
        ),
      },
      {
        key: 'logout',
        label: <LogoutButton onClick={closeMenu} />,
      },
    ]
  }, [ lang, location ])

  const handleAvatarClick = (e) => {
    e.stopPropagation()
    
    toggleIsOpen()

    if (!isOpen) removeMenuImmediateClosed()
  }

  useEffect(() => {
    const handleDocumentClick = ({ target }) => {
      if (!target.closest('.ant-dropdown')) {
        closeMenu()
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleDocumentClick)
      return () => document.removeEventListener('click', handleDocumentClick)
    }
  }, [ isOpen ])

  return (
    <>
      <Dropdown
        destroyPopupOnHide
        open={isOpen}
        overlayStyle={{ display: isMenuImmediatelyClosed ? 'none' : '', width: 'calc(100% - 30px)', left: '0', right: '0', margin: 'auto', maxWidth: '475px' }}
        overlayClassName={style['user-menu-dropdown']}
        menu={{ items }}
        placement="bottomRight"
      >
        <StyledAvatar onClick={handleAvatarClick} size="large" icon={<UserOutlined />} />
      </Dropdown>
      {isImportMenuOpen && <ImportOptionsModal isOpen={isImportMenuOpen} close={closeImportMenu} />}
    </>
  )
}

export default NoAuthUserMenu
