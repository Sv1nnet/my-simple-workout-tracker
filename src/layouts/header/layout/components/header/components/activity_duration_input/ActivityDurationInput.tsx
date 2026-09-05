import { Form } from 'antd'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ActivityStopwatch } from 'app/components'
import dayjs, { Dayjs } from 'dayjs'
import { useAppSelector, useToggle } from 'app/hooks'
import { selectList } from 'app/store/slices/workout'
import { useActivityInProgressContext } from 'app/contexts/activity/ActivityInProgressContextProvider'
import { dayjsToSeconds, timeArrayToMilliseconds, timeArrayToSeconds } from 'app/utils/time'
import { ActivityPlugin } from 'src/plugins'
import { WorkoutForm } from 'app/store/slices/workout/types'

const createDate = (duration: number) => dayjs.tz(duration, 'UTC')

const ActivityDurationInput = () => {
  const {
    activity,
    onRun,
    onPause,
    onStop,
    onDurationChange,
    durationTimerRef,
    runStopwatch,
    pauseStopwatch,
    getCurrentDuration,
    setTime: setStopwatchTime,
  } = useActivityInProgressContext()

  const { workout_id: workoutId } = activity || {}

  const initialDuration = useMemo(() => activity?.duration ?? 0, [])

  const [ time, setTime ] = useState(() => createDate(activity?.duration ?? 0))
  const abortController = useRef<AbortController | null>(null)
  const isTimerRunningOnInputOpenRef = useRef(false)
  const { state: isTimerInputOpen, setTrue: setIsTimerInputOpen, setFalse: setIsTimerInputClose } = useToggle(false)
  const { data: workoutList } = useAppSelector(selectList)

  const title = useMemo(() => workoutList.find(workout => workout.id === activity?.workout_id)?.title || '', [ activity?.workout_id, workoutList ])

  const handleOpenTimerInput = () => {
    abortController.current?.abort()
    abortController.current = new AbortController()

    if (isTimerInputOpen) {
      setIsTimerInputClose()
      if (isTimerRunningOnInputOpenRef.current) runStopwatch()
    } else {
      if (Array.isArray(durationTimerRef.current?.getValue())) {
        const ms = timeArrayToSeconds(durationTimerRef.current?.getValue()) * 1000
        onDurationChange(ms)
        setTime(createDate(ms))
      }

      setIsTimerInputOpen()

      isTimerRunningOnInputOpenRef.current = durationTimerRef.current?.isRunning
      if (isTimerRunningOnInputOpenRef.current) pauseStopwatch()
    }

    // without raf the new click event listener is fired immediately and the input is closed
    requestAnimationFrame(() => {
      document.addEventListener('click', (e) => {
        if (!(e.target instanceof HTMLElement && e.target.closest('.activity-timer-input-dropdown'))) {
          setIsTimerInputClose()
        }
      }, 
      { signal: abortController.current.signal })
    })
  }

  // const handleTimePickerOpen = () => {
  //   setIsTimerInputOpen()
  // }

  // const handleTimePickerClose = () => {
  //   setIsTimerInputClose()
  // }

  const syncNotificationElapsed = async (elapsedMs: number) => {
    if (!workoutId) return

    const isPaused = Boolean(activity?.isPaused || durationTimerRef.current?.isPaused)
    const isRunning = Boolean(activity?.isRunning || durationTimerRef.current?.isRunning)

    if (!isPaused && !isRunning) return

    try {
      if (isPaused) {
        await ActivityPlugin.pauseActivity({
          id: workoutId,
          elapsedMs,
        })
        return
      }

      await ActivityPlugin.startActivity({
        id: workoutId,
        title,
        startTime: Date.now() - elapsedMs,
        elapsedMs,
      })
    } catch (error) {
      console.error('Error syncing activity duration', error)
    }
  }

  const handleOk = (date: Dayjs) => {
    const elapsedMs = dayjsToSeconds(date) * 1000
    onDurationChange(elapsedMs)
    setTime(date)
    setIsTimerInputClose()
    setStopwatchTime(date)
    syncNotificationElapsed(elapsedMs)
  }

  const getElapsedMs = (timeElapsedInMs?: number) => {
    if (typeof timeElapsedInMs === 'number' && !Number.isNaN(timeElapsedInMs)) {
      return Math.floor(timeElapsedInMs)
    }

    const fromStopwatch = timeArrayToMilliseconds(getCurrentDuration())
    if (fromStopwatch > 0) return Math.floor(fromStopwatch)

    return Math.floor(activity?.duration ?? 0)
  }

  const handleRun = async (timeElapsedInMs?: number) => {
    const currentStopwatchMs = getElapsedMs(timeElapsedInMs)
    const startTime = Date.now() - currentStopwatchMs

    try {
      if (durationTimerRef.current?.isPaused) {
        await ActivityPlugin.resumeActivity({
          id: workoutId,
          title,
          resumeTime: Date.now(),
          elapsedMs: currentStopwatchMs,
        })
      } else {
        await ActivityPlugin.startActivity({
          id: workoutId,
          title,
          startTime,
          elapsedMs: currentStopwatchMs,
        })
      }
    } catch (error) {
      console.error('Error starting activity', error)
    } finally {
      onRun()
    }
  }

  const handlePause = async (timePassedInMs: number) => {
    try {
      await ActivityPlugin.pauseActivity({
        id: workoutId,
        elapsedMs: Math.floor(timePassedInMs),
      })
    } catch (error) {
      console.error('Error pausing activity', error)
    } finally {
      onPause()
      // pauseStopwatch()
    }
  }

  const handleStop = useCallback(async (_workoutId?: WorkoutForm['id']) => {
    try {
      await ActivityPlugin.stopActivity({
        id: _workoutId ?? workoutId,
      })
    } catch (error) {
      console.error('Error stopping activity', error)
    } finally {
      onStop()
      // resetStopwatch()
    }
  }, [ workoutId ])

  useEffect(() => () => isTimerInputOpen && abortController.current?.abort(), [ isTimerInputOpen ])

  // const stopStopwatch = useCallback(([ prevWorkoutId ], [ currentWorkoutId ]) => {
  //   if (prevWorkoutId && prevWorkoutId !== currentWorkoutId) {
  //     handleStop(prevWorkoutId)
  //   }
  // }, [])

  // useOnPreviousChange(stopStopwatch, [ workoutId ], { callInUseEffect: true })

  useLayoutEffect(() => {
    if (activity?.isRunning) runStopwatch()
  }, [])

  return (
    <div style={{ marginLeft: 32 }}>
      <Form.Item noStyle name="duration">
        <ActivityStopwatch
          durationTimerRef={durationTimerRef}
          initialDuration={initialDuration}
          isDisabled={!workoutId}
          onRun={handleRun}
          onPause={handlePause}
          onStop={handleStop}
          onDurationChange={onDurationChange}
          onOpenTimerInput={handleOpenTimerInput}
          isTimerInputOpen={isTimerInputOpen}
          time={time}
          onOk={handleOk}
          stopwatchProps={{
            stopButtonProps: {
              disabled: !(activity?.isRunning || activity?.isPaused || (activity?.duration ?? 0) > 0),
            },
          }}
        />
      </Form.Item>
    </div>
  )
}

export default ActivityDurationInput