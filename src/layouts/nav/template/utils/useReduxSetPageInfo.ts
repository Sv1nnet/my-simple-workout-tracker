import { useOnPreviousChange, useAppDispatch } from 'app/hooks'
import { useCallback, useEffect } from 'react'
import { open as openExercise, close as closeExercise, EXERCISE_PAGE_TYPE } from 'app/store/slices/exercise'
import { open as openProfile, close as closeProfile } from 'app/store/slices/profile'
import { open as openSettings, close as closeSettings } from 'app/store/slices/settings'
import { open as openWorkout, close as closeWorkout, WORKOUT_PAGE_TYPE } from 'app/store/slices/workout'
import { open as openActivity, close as closeActivity, ACTIVITY_PAGE_TYPE } from 'app/store/slices/activity'
import { TabRoutes } from '../NavTemplate'

type PageHandlerKey = 'exercises' | 'workouts' | 'activities' | 'profile' | 'settings'

const pageHandlerKeys: PageHandlerKey[] = [ 'exercises', 'workouts', 'activities', 'profile', 'settings' ]

type FormInfo = {
  isFormOpen: boolean
  isEditType: boolean
  isAddType: boolean
}

const isPageHandlerKey = (tab?: string): tab is PageHandlerKey =>
  pageHandlerKeys.some(key => key === tab)

const getOpenAction = (tab: string | undefined, formInfo: FormInfo) => {
  const { isFormOpen, isAddType } = formInfo
  const resolvedTab = isPageHandlerKey(tab) ? tab : 'activities'

  switch (resolvedTab) {
    case 'exercises':
      return openExercise({
        pageType: isFormOpen
          ? (isAddType ? EXERCISE_PAGE_TYPE.CREATE : EXERCISE_PAGE_TYPE.EDIT)
          : EXERCISE_PAGE_TYPE.LIST,
      })
    case 'workouts':
      return openWorkout({
        pageType: isFormOpen
          ? (isAddType ? WORKOUT_PAGE_TYPE.CREATE : WORKOUT_PAGE_TYPE.EDIT)
          : WORKOUT_PAGE_TYPE.LIST,
      })
    case 'profile':
      return openProfile(true)
    case 'settings':
      return openSettings()
    case 'activities':
    default:
      return openActivity({
        pageType: isFormOpen
          ? (isAddType ? ACTIVITY_PAGE_TYPE.CREATE : ACTIVITY_PAGE_TYPE.EDIT)
          : ACTIVITY_PAGE_TYPE.LIST,
      })
  }
}

const getCloseAction = (tab: string) => {
  if (!isPageHandlerKey(tab)) return null

  switch (tab) {
    case 'exercises':
      return closeExercise()
    case 'workouts':
      return closeWorkout()
    case 'activities':
      return closeActivity()
    case 'profile':
      return closeProfile()
    case 'settings':
      return closeSettings()
  }
}

const useReduxSetPageInfo = (pageInfo: {
  activeTab: TabRoutes | string
  formInfo: FormInfo
}) => {
  const dispatch = useAppDispatch()

  const { activeTab, formInfo } = pageInfo

  useOnPreviousChange<[typeof pageInfo]>(
    useCallback(([ prev ], [ curr ]) => {
      dispatch(getOpenAction(curr.activeTab, curr.formInfo))

      if (prev.activeTab && prev.activeTab !== curr.activeTab) {
        const closeAction = getCloseAction(prev.activeTab)
        if (closeAction) dispatch(closeAction)
      }
    }, []),
    [ pageInfo ],
    {
      callInUseEffect: true,
    },
  )

  const setOpenPageInfo = useCallback((currentActiveTab: typeof activeTab, currentFormInfo: FormInfo) => {
    dispatch(getOpenAction(currentActiveTab, currentFormInfo))
  }, [ dispatch ])

  useEffect(() => {
    setOpenPageInfo(activeTab, formInfo)
  }, [])
}

export default useReduxSetPageInfo
