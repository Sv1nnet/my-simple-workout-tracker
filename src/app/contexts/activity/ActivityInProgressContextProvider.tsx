import { StopwatchRef } from 'app/components/stopwatch/Stopwatch'
import { useAppDispatch, useAppSelector, useLocalStorage } from 'app/hooks'
import { selectCachedActivity, setCachedActivity, removeCachedActivity as removeCachedActivityAction } from 'app/store/slices/activity'
import { ActivityForm, CachedActivity } from 'app/store/slices/activity/types'
import { WorkoutForm } from 'app/store/slices/workout/types'
import { dayjsToTimeArray } from 'app/utils/time'
import dayjs, { Dayjs, isDayjs } from 'dayjs'
import { createContext, RefObject, useCallback, useContext, useMemo, useRef } from 'react'

export type ActivityContextType = {
  activity: CachedActivity | null
  onSelectedWorkoutChange: (workoutId: WorkoutForm['id']) => void
  cacheActivity: (activity: CachedActivity | null) => void
  getActivity: () => CachedActivity | null
  removeActivity: () => void
  onStop: () => void
  onPause: () => void
  onRun: () => void
  onDurationChange: (ms: number) => void
  durationTimerRef: RefObject<StopwatchRef>
  getCurrentDuration: () => number[]
  runStopwatch: () => void
  pauseStopwatch: () => void
  resetStopwatch: () => void
  setTime: (newTime: Dayjs) => void
}

export type InitialValues<T = Dayjs> = Omit<ActivityForm<T>, '_id' | 'workout_id'> & {
  _id?: string,
  workout_id?: WorkoutForm['id'],
  isRunning?: boolean,
  isPaused?: boolean,
  isStopped?: boolean,
}

const defaultCurrentDuration = [ 0, 0, 0, 0 ]

const initialContextValue: ActivityContextType = {
  activity: null,
  onSelectedWorkoutChange: () => {},
  cacheActivity: () => {},
  getActivity: () => null,
  removeActivity: () => {},
  onStop: () => {},
  onPause: () => {},
  onRun: () => {},
  onDurationChange: () => {},
  durationTimerRef: { current: null },
  getCurrentDuration: () => defaultCurrentDuration,
  runStopwatch: () => {},
  pauseStopwatch: () => {},
  resetStopwatch: () => {},
  setTime: () => {},
}

const ActivityContext = createContext<ActivityContextType>(initialContextValue)

const ActivityInProgressContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [ ,,, getCachedActivity ] = useLocalStorage<CachedActivity<string> | null>('cached_activity', null)
  const { data: cachedActivity } = useAppSelector(selectCachedActivity)
  const durationTimerRef = useRef<StopwatchRef>(null)

  const dispatch = useAppDispatch()

  const removeCachedActivity = useCallback(() => {
    dispatch(removeCachedActivityAction({ shouldRemoveFromLocalStorage: true }))
  }, [])

  const saveActivity = useCallback((activity: CachedActivity | null) => {
    if (!activity) {
      dispatch(setCachedActivity({ data: null, shouldSaveToLocalStorage: true }))
      return
    }

    const activityToCache: CachedActivity = { ...activity }
    if (isDayjs(activityToCache.date)) {
      activityToCache.date = activityToCache.date.toISOString()
    }
    dispatch(setCachedActivity({ data: activityToCache as CachedActivity<string>, shouldSaveToLocalStorage: true }))
  }, [])

  const onSelectedWorkoutChange = useCallback((workoutId: WorkoutForm['id']) => {
    let newCachedActivity = getCachedActivity()
    if (!newCachedActivity) {
      newCachedActivity = {
        date: dayjs().toISOString(),
        workout_id: workoutId,
        duration: 0,
        isRunning: false,
        isPaused: false,
        isStopped: false,
        results: [],
        description: '',
      }
    }
    saveActivity({ ...newCachedActivity, workout_id: workoutId })
  }, [])

  const onDurationChange = useCallback((ms: number) => {
    const newCachedActivity = getCachedActivity()
    if (newCachedActivity) {
      saveActivity({ ...newCachedActivity, duration: ms })
    }
  }, [])

  const onStop = useCallback(() => {
    const newCachedActivity = getCachedActivity()
    if (newCachedActivity) {
      saveActivity({ ...newCachedActivity, isStopped: true, isPaused: false, isRunning: false, duration: 0 })
    }
  }, [])  

  const onPause = useCallback(() => {
    const newCachedActivity = getCachedActivity()
    if (newCachedActivity) {
      saveActivity({ ...newCachedActivity, isPaused: true, isRunning: false, isStopped: false })
    }
  }, [])

  const onRun = useCallback(() => {
    const newCachedActivity = getCachedActivity()
    if (newCachedActivity) {
      saveActivity({ ...newCachedActivity, isRunning: true, isPaused: false, isStopped: false })
    }
  }, [])

  const runStopwatch = useCallback(() => {
    durationTimerRef.current?.runTimer()
  }, [])

  const pauseStopwatch = useCallback(() => {
    durationTimerRef.current?.pauseTimer()
  }, [])

  const resetStopwatch = useCallback(() => {
    durationTimerRef.current?.resetTimer()
  }, [])

  const setTime = useCallback((newTime: Dayjs) => {
    durationTimerRef.current?.setTime(dayjsToTimeArray(newTime))
  }, [])

  const getCurrentDuration = useCallback(() => durationTimerRef.current?.valueRef?.current ?? defaultCurrentDuration, [])

  const value = useMemo(() => ({
    activity: cachedActivity,
    cacheActivity: saveActivity,
    onSelectedWorkoutChange,
    getActivity: getCachedActivity,
    removeActivity: removeCachedActivity,
    onStop,
    onPause,
    onRun,
    onDurationChange,
    getCurrentDuration,
    durationTimerRef,
    runStopwatch,
    pauseStopwatch,
    resetStopwatch,
    setTime,
  }), [ cachedActivity, setCachedActivity, removeCachedActivity, getCachedActivity ])

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}

export const useActivityInProgressContext = (): ActivityContextType => {
  const context = useContext(ActivityContext)

  if (!context) {
    console.warn('useActivityContext must be used within an ActivityContextProvider')
    return initialContextValue
  }

  return context
}

export default ActivityInProgressContextProvider