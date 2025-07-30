import { useEffect, useMemo, useRef } from 'react'
import { Avatar, Dropdown } from 'antd'
import { CloseOutlined, MenuOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import style from './NoAuthUserMenu.module.scss'
import { useAppDispatch, useAppSelector, useToggle } from 'app/hooks'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useLocation, useNavigate } from 'react-router-dom'
import { ImportOptionsModal } from './components'
import getMenuItems from './utils/getMenuItems'
import { useAppLoaderContext } from 'app/contexts/loader/AppLoaderContextProvider'
import { selectPageInfo as selectExercisePageInfo } from 'app/store/slices/exercise'
import { selectPageInfo as selectWorkoutPageInfo, WORKOUT_PAGE_TYPE } from 'app/store/slices/workout'
import { ACTIVITY_PAGE_TYPE, selectPageInfo as selectActivityPageInfo } from 'app/store/slices/activity'
import { exerciseApi } from 'store/slices/exercise/api'
import { workoutApi } from 'store/slices/workout/api'
import { ACTIVITY_TAG_TYPES, activityApi } from 'store/slices/activity/api'
import { useThemeContext } from 'app/contexts/theme/ThemeContextProvider'


const StyledAvatar = styled(Avatar)`
  position: absolute;
  left: 15px;
  cursor: pointer;
  background: transparent;
`

const NoAuthUserMenu = () => {
  const navigate = useNavigate()
  const { theme, changeTheme } = useThemeContext()

  const { state: isOpen, toggle: toggleIsOpen, setFalse: closeMenu } = useToggle(false)
  const { state: isImportMenuOpen, setTrue: openImportMenu, setFalse: closeImportMenu } = useToggle(false)
  const { state: isMenuImmediatelyClosed, setFalse: removeMenuImmediateClosed } = useToggle(false)

  const exercisePageInfo = useAppSelector(selectExercisePageInfo)
  const workoutPageInfo = useAppSelector(selectWorkoutPageInfo)
  const activityPageInfo = useAppSelector(selectActivityPageInfo)

  const [ fetchExerciseList ] = exerciseApi.useLazyListQuery()
  const [ fetchWorkoutList ] = workoutApi.useLazyListQuery()
  const [ fetchActivityList ] = activityApi.useLazyListQuery()

  const { runLoader, stopLoaderById } = useAppLoaderContext()
  const location = useLocation()
  const { intl, lang } = useIntlContext()
  const dispatch = useAppDispatch()
  const loaderPromiseRef = useRef<Promise<void>>()

  const items = useMemo(() => getMenuItems({
    navigate,
    closeMenu,
    openImportMenu,
    intl,
    onFileChange: () => {
      runLoader('importData')

      loaderPromiseRef.current = new Promise((resolve) => {
        setTimeout(resolve, 1500)
      })
    },
    onImportFinished: () => {
      loaderPromiseRef.current.then(() => {
        stopLoaderById('importData')
        loaderPromiseRef.current = null

        switch (true) {
          case exercisePageInfo.isOpen:
            fetchExerciseList()
            break
          case workoutPageInfo.isOpen:
            fetchWorkoutList()
            if (workoutPageInfo.pageType !== WORKOUT_PAGE_TYPE.LIST) {
              fetchExerciseList()
            }
            break
          case activityPageInfo.isOpen:
            fetchActivityList()
            if (activityPageInfo.pageType !== ACTIVITY_PAGE_TYPE.LIST) {
              fetchWorkoutList()
              dispatch(activityApi.util.invalidateTags([ ACTIVITY_TAG_TYPES.HISTORY ]))
            }
            break
          default:
            break
        }
      })
    },
    onThemeSwitch: (checked) => {
      changeTheme(checked ? 'light' : 'dark')
    },
    isLightTheme: theme === 'light',
  }), [ lang, location, activityPageInfo, workoutPageInfo, theme, changeTheme, exercisePageInfo ])

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
      document.body.querySelector('#root').addEventListener('click', handleDocumentClick)
      return () => document.body.querySelector('#root').removeEventListener('click', handleDocumentClick)
    }
  }, [ isOpen ])

  useEffect(() => () => stopLoaderById('importData'), [])

  return (
    <>
      <Dropdown
        destroyPopupOnHide
        open={isOpen}
        overlayStyle={{ display: isMenuImmediatelyClosed ? 'none' : '', width: '100%', top: '74px', left: '0', right: '0', bottom: '0', margin: 'auto' }}
        overlayClassName={style['user-menu-dropdown']}
        menu={{ items }}
        placement="bottomRight"
      >
        <StyledAvatar onClick={handleAvatarClick} size="large" icon={isOpen ? <CloseOutlined /> : <MenuOutlined />} />
      </Dropdown>
      {isImportMenuOpen && <ImportOptionsModal isOpen={isImportMenuOpen} close={closeImportMenu} />}
    </>
  )
}

export default NoAuthUserMenu
