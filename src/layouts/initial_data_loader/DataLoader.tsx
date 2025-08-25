import { useAppLoaderContext } from 'app/contexts/loader/AppLoaderContextProvider'
import { useAppSelector, useMounted } from 'app/hooks'
import { activityApi } from 'app/store/slices/activity/api'
import { configApi } from 'app/store/slices/config/api'
import { exerciseApi } from 'app/store/slices/exercise/api'
import { muscleGroupApi } from 'app/store/slices/muscleGroup/api'
import { selectSettings } from 'app/store/slices/settings'
import { settingsApi } from 'app/store/slices/settings/api'
import { workoutApi } from 'app/store/slices/workout/api'
import { useEffect, useState } from 'react'
import { SettingsPlugin } from 'src/plugins'

const loaderId = 'initial-data-loading'

const InitialDataLoader = ({ children }) => {
  const [ isDataLoaded, setIsDataLoaded ] = useState(false)
  const [ isSettingsInited, setIsSettingsInited ] = useState(false)

  const { isMounted, useHandleMounted } = useMounted()
  const { forceRunLoader, stopLoaderById } = useAppLoaderContext()

  const { isLoading: isSettingsLoading } = settingsApi.useGetQuery()
  const { isLoading: isConfigLoading } = configApi.useGetQuery()
  const { isLoading: isExercisesLoading } = exerciseApi.useListQuery()
  const { isLoading: isWorkoutsLoading } = workoutApi.useListQuery()
  const { isLoading: isActivitiesLoading } = activityApi.useListQuery()
  const { isLoading: isMuscleGroupsLoading } = muscleGroupApi.useListQuery()

  const settings = useAppSelector(selectSettings)

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

  useEffect(() => {
    if (isDataLoaded && !isSettingsInited) {
      SettingsPlugin.initSettings({
        isVibration: settings.timers.isVibration,
        isSound: settings.timers.isSound,
        lang: settings.lang,
      }).then(() => {
        setIsSettingsInited(true)
      })
    }
  }, [ isDataLoaded ])

  useHandleMounted()

  if (!isDataLoaded && (!isMounted() || isLoading || !isSettingsInited)) {
    return null
  }

  return children
}

export default InitialDataLoader