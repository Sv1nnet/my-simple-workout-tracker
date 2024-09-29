import { useEffect, useMemo, useRef } from 'react'
import { Avatar, Dropdown } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import style from './NoAuthUserMenu.module.scss'
import { useAppDispatch, useAppSelector, useToggle } from 'app/hooks'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useLocation } from 'react-router-dom'
import { ImportOptionsModal } from './components'
import getMenuItems from './utils/getMenuItems'
import { useAppLoaderContext } from 'app/contexts/loader/AppLoaderContextProvider'
import { selectPageInfo as selectExercisePageInfo } from 'app/store/slices/exercise'
import { selectPageInfo as selectWorkoutPageInfo, WORKOUT_PAGE_TYPE } from 'app/store/slices/workout'
import { ACTIVITY_PAGE_TYPE, selectPageInfo as selectActivityPageInfo } from 'app/store/slices/activity'
import { exerciseApi } from 'store/slices/exercise/api'
import { workoutApi } from 'store/slices/workout/api'
import { ACTIVITY_TAG_TYPES, activityApi } from 'store/slices/activity/api'


const StyledAvatar = styled(Avatar)`
  position: absolute;
  right: 3px;
  cursor: pointer;
`

const NoAuthUserMenu = () => {
  const { state: isOpen, toggle: toggleIsOpen, setFalse: closeMenu } = useToggle(false)
  const { state: isImportMenuOpen, setTrue: openImportMenu, setFalse: closeImportMenu } = useToggle(false)
  const { state: isMenuImmediatelyClosed, setFalse: removeMenuImmediateClosed, setTrue: closeMenuImmediately } = useToggle(false)

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

  const items = useMemo(() => getMenuItems(dispatch, {
    closeMenu,
    closeMenuImmediately,
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
            fetchActivityList({})
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
  }), [ lang, location, activityPageInfo, workoutPageInfo, exercisePageInfo ])

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

  useEffect(() => () => stopLoaderById('importData'), [])

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
