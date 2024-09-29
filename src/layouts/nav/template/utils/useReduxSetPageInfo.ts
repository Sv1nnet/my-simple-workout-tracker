import { useOnPreviousChange, useAppDispatch } from 'app/hooks'
import { useCallback, useEffect } from 'react'
import { open as openExercise, close as closeExercise, EXERCISE_PAGE_TYPE } from 'app/store/slices/exercise'
import { open as openProfile, close as closeProfile } from 'app/store/slices/profile'
import { open as openWorkout, close as closeWorkout, WORKOUT_PAGE_TYPE } from 'app/store/slices/workout'
import { open as openActivity, close as closeActivity, ACTIVITY_PAGE_TYPE } from 'app/store/slices/activity'
import { TabRoutes } from '../NavTemplate'

const pageHandlers = {
  exercises: {
    open: openExercise,
    close: closeExercise,
    getType: (isOpen: boolean, isAddType: boolean) => isOpen ? (isAddType ? EXERCISE_PAGE_TYPE.CREATE : EXERCISE_PAGE_TYPE.EDIT) : EXERCISE_PAGE_TYPE.LIST,
  },
  workouts: {
    open: openWorkout,
    close: closeWorkout,
    getType: (isOpen: boolean, isAddType: boolean) => isOpen ? (isAddType ? WORKOUT_PAGE_TYPE.CREATE : WORKOUT_PAGE_TYPE.EDIT) : WORKOUT_PAGE_TYPE.LIST,
  },
  activities: {
    open: openActivity,
    close: closeActivity,
    getType: (isOpen: boolean, isAddType: boolean) => isOpen ? (isAddType ? ACTIVITY_PAGE_TYPE.CREATE : ACTIVITY_PAGE_TYPE.EDIT) : ACTIVITY_PAGE_TYPE.LIST,
  },
  profile: {
    open: openProfile,
    close: closeProfile,
    getType: () => null,
  },
}

const useReduxSetPageInfo = (pageInfo: {
  activeTab: TabRoutes;
  formInfo: {
    isFormOpen: boolean;
    isEditType: boolean;
    isAddType: boolean;
  };
}) => {
  const dispatch = useAppDispatch()

  const { activeTab, formInfo } = pageInfo

  useOnPreviousChange(
    [ pageInfo ],
    useCallback(([ prev ], [ curr ]) => {
      const currHandler = pageHandlers[curr.activeTab]
      dispatch(currHandler
        .open({
          pageType: currHandler.getType(curr.formInfo.isFormOpen, curr.formInfo.isAddType),
        }))

      if (prev.activeTab !== curr.activeTab) {
        dispatch(pageHandlers[prev.activeTab].close())
      }
    }, []),
    {
      callInUseEffect: true,
    },
  )

  const setOpenPageInfo = useCallback((_, [ currentActiveTab, currentFormInfo ]: [ typeof activeTab, typeof formInfo ]) => {
    const currHandler = pageHandlers[currentActiveTab]
    dispatch(currHandler
      .open({
        pageType: currHandler.getType(currentFormInfo.isFormOpen, currentFormInfo.isAddType),
      }))
  }, [])

  useEffect(() => {
    setOpenPageInfo(null, [ activeTab, formInfo ])
  }, [])
}

export default useReduxSetPageInfo
