import { useAppLoaderContext } from 'app/contexts/loader/AppLoaderContextProvider'
import { useMounted } from 'app/hooks'
import { activityApi } from 'app/store/slices/activity/api'
import { configApi } from 'app/store/slices/config/api'
import { exerciseApi } from 'app/store/slices/exercise/api'
import { muscleGroupApi } from 'app/store/slices/muscleGroup/api'
import { settingsApi } from 'app/store/slices/settings/api'
import { workoutApi } from 'app/store/slices/workout/api'
import { useEffect, useState } from 'react'

const loaderId = 'initial-data-loading'

const InitialDataLoader = ({ children }) => {
  const [ isDataLoaded, setIsDataLoaded ] = useState(false)

  const { isMounted, useHandleMounted } = useMounted()
  const { forceRunLoader, stopLoaderById } = useAppLoaderContext()

  const { isLoading: isSettingsLoading } = settingsApi.useGetQuery()
  const { isLoading: isConfigLoading } = configApi.useGetQuery()
  const { isLoading: isExercisesLoading } = exerciseApi.useListQuery()
  const { isLoading: isWorkoutsLoading } = workoutApi.useListQuery()
  const { isLoading: isActivitiesLoading } = activityApi.useListQuery()
  const { isLoading: isMuscleGroupsLoading } = muscleGroupApi.useListQuery()

  const isLoading = isSettingsLoading || isConfigLoading || isExercisesLoading || isWorkoutsLoading || isActivitiesLoading || isMuscleGroupsLoading

  useEffect(() => {
    forceRunLoader(loaderId, {
      containerProps: {
        style: {
          position: 'fixed',
          top: 0,
          opacity: 1,
        },
      },
    })

    return () => stopLoaderById(loaderId)
  }, [])

  useEffect(() => {
    if (isMounted() && !isDataLoaded && !isLoading) {
      stopLoaderById(loaderId)
      setIsDataLoaded(true)
    }
  }, [ isDataLoaded, isLoading ])

  useHandleMounted()

  if (!isDataLoaded && (!isMounted() || isLoading)) {
    return null
  }

  return children
}

export default InitialDataLoader