import { forwardRef, MouseEvent, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { ButtonProps } from 'antd'
import { millisecondsToTimeArray, timeArrayToMilliseconds } from 'app/utils/time'
import { defaultAppNotificationOptions, runCountingDown, AppNotificationOptions } from './utils'
import { TimerView } from 'app/components'
import { Capacitor } from '@capacitor/core'
import { TimerPlugin } from 'src/plugins'

export const DEFAULT_TIMER_ID = 'default_timer_id'

export interface ITimer {
  duration: number,
  appNotificationOptions?: AppNotificationOptions,
  id?: string,
  notificationTitle?: string,
  webNotificationOptions?: NotificationOptions,
  msOn?: boolean,
  hoursOn?: boolean,
  keepPageAwake?: boolean,
  onChange?: (value: ReturnType<typeof millisecondsToTimeArray>, timeLeftInMs: number) => void,
  onReset?: VoidFunction,
  onPause?: (timeLeftInMs: number) => void,
  onRun?: (timeLeftInMs: number) => void,
  onTimeOver?: (duration: number) => void,
  resetButton?: boolean,
  showRunPauseButton?: boolean,
  containerProps?: React.HTMLAttributes<HTMLDivElement>,
  timeElementProps?: React.HTMLAttributes<HTMLSpanElement>,
  buttonProps?: Omit<ButtonProps, 'onClick'> & {
    onClick?: (runState: boolean, e: React.MouseEvent<HTMLElement>) => void,
  },
  stopButtonProps?: Omit<ButtonProps, 'onClick'> & {
    onClick?: (runState: boolean, e: React.MouseEvent<HTMLElement>) => void,
  },
  stopOnUnmount?: boolean,
}

export type TimerRef = {
  isRunning: boolean,
  isPaused: boolean,
  isFinished: boolean,
  getTimeLeft: () => [number, number, number, number],
  pause: (e?: MouseEvent<HTMLElement>) => Promise<void>,
  run: (e?: MouseEvent<HTMLElement>) => Promise<void>,
  reset: (e?: MouseEvent<HTMLElement>) => Promise<void>,
}

const Timer = forwardRef<TimerRef, ITimer>(({
  // notificationTitle = 'Time is over!',
  appNotificationOptions = defaultAppNotificationOptions,
  id = DEFAULT_TIMER_ID,
  duration = 0,
  msOn = true,
  onChange,
  onReset,
  onPause,
  onRun,
  onTimeOver,
  hoursOn,
  resetButton,
  timeElementProps,
  buttonProps,
  showRunPauseButton = true,
  stopButtonProps,
  stopOnUnmount = true,
  ...rest
}, ref) => {
  const timerId = id === DEFAULT_TIMER_ID ? DEFAULT_TIMER_ID : id
  const initialValue = useMemo(() => millisecondsToTimeArray(duration), [ duration ])

  const [ value, setValue ] = useState(initialValue)
  const [ isRunning, setIsRunning ] = useState(false)
  const [ isPaused, setIsPaused ] = useState(false)
  const [ isFinished, setIsFinished ] = useState(false)

  const valueRef = useRef(value)
  const prevRafMsRef = useRef(0)
  const msLeftFromPrevRafRef = useRef(0)
  const newTimeLeftRef = useRef(0)
  const diffRef = useRef(0)
  const rafIdRef = useRef(null)

  const notificationCountRef = useRef(0)
  const isNotifiedRef = useRef(false)
  const renotificationTimeoutIdRef = useRef(0 as unknown as NodeJS.Timeout)

  const handleResetTimer = async (e?: MouseEvent<HTMLElement>) => {
    clearTimeout(renotificationTimeoutIdRef.current)
    
    setIsRunning(false)
    setIsFinished(false)
    setIsPaused(false)
    setValue(initialValue)
    
    cancelAnimationFrame(rafIdRef.current)
    
    isNotifiedRef.current = false
    notificationCountRef.current = 0

    valueRef.current = initialValue
    newTimeLeftRef.current = duration
    
    prevRafMsRef.current = 0
    msLeftFromPrevRafRef.current = 0
    diffRef.current = 0
    
    onChange?.([ ...initialValue ], newTimeLeftRef.current)
    onReset?.()

    await TimerPlugin.stopTimer({
      timerId,
    })

    if (e) {
      if (resetButton) stopButtonProps?.onClick?.(false, e)
      if (!resetButton) buttonProps?.onClick?.(false, e)
    }
  }

  const handleRun = async (e?: MouseEvent<HTMLElement>) => {
    try {
      if (Capacitor.isNativePlatform()) {    
        if (!isPaused && !isRunning) {
          await TimerPlugin.startTimer({
            duration: Math.floor(newTimeLeftRef.current || duration), // Cut decimal part
            timerId: timerId,
            label: appNotificationOptions.running?.label || defaultAppNotificationOptions.running.label,
            body: appNotificationOptions.running?.body || defaultAppNotificationOptions.running.body,
          })
        } else if (isPaused) {
          await TimerPlugin.resumeTimer({
            timerId: timerId,
            label: appNotificationOptions.running?.label || defaultAppNotificationOptions.running.label,
            body: appNotificationOptions.running?.body || defaultAppNotificationOptions.running.body,
          })
        }
      }
      
      setIsRunning(true)
      setIsPaused(false)
      onRun?.(newTimeLeftRef.current)
      if (e) buttonProps?.onClick?.(true, e)
    } catch (error) {
      console.error('Failed to start timer service:', error)
    }
  }

  const handlePauseTimer = async (e?: MouseEvent<HTMLElement>) => {
    setIsRunning(false)
    setIsPaused(true)

    if (Capacitor.isNativePlatform()) {
      try {
        await TimerPlugin.pauseTimer({
          timerId: timerId,
          label: appNotificationOptions.paused?.label || defaultAppNotificationOptions.paused.label,
          body: appNotificationOptions.paused?.body || defaultAppNotificationOptions.paused.body,
        })
      } catch (error) {
        console.error('Failed to stop timer service:', error)
      }
    }

    onPause?.(newTimeLeftRef.current)
    if (e) buttonProps?.onClick?.(false, e)
  }

  useImperativeHandle(ref, () => ({
    isRunning,
    isPaused,
    isFinished,
    getTimeLeft: () => valueRef.current,
    run: handleRun,
    pause: handlePauseTimer,
    reset: handleResetTimer,
  }), [ isRunning, isPaused, isFinished, handleRun, handlePauseTimer, handleResetTimer ])

  useEffect(() => {
    if (duration !== timeArrayToMilliseconds(value)) {
      valueRef.current = initialValue
      newTimeLeftRef.current = duration
      prevRafMsRef.current = 0
      msLeftFromPrevRafRef.current = 0
      diffRef.current = 0

      setValue(valueRef.current)
      onChange?.([ ...valueRef.current ], newTimeLeftRef.current)
    }
  }, [ duration ])

  useEffect(() => runCountingDown({
    msOn,
    isRunning,
    isPaused,
    valueRef,
    newTimeLeftRef,
    duration,
    isNotifiedRef,
    setIsRunning,
    setIsFinished,
    setValue,
    prevRafMsRef,
    diffRef,
    msLeftFromPrevRafRef,
    onChange,
    rafIdRef,
  }), [ isRunning, isPaused, isFinished, duration, msOn ])

  useEffect(() => {
    if (isFinished) onTimeOver?.(duration)
  }, [ isFinished ])

  useEffect(() => () => {
    if (stopOnUnmount) handleResetTimer()
  }, [ stopOnUnmount ])

  return (
    <TimerView
      onRun={handleRun}
      onPause={handlePauseTimer}
      onReset={handleResetTimer}
      isRunning={isRunning}
      isFinished={isFinished}
      showRunPauseButton={showRunPauseButton}
      initialValue={initialValue}
      value={value}
      duration={duration}
      msOn={msOn}
      hoursOn={hoursOn}
      showStopButton={resetButton}
      stopButtonProps={stopButtonProps}
      buttonProps={buttonProps}
      timeElementProps={timeElementProps}
      {...rest}
    />
  )
})

export default Timer
