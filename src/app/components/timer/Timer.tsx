import { forwardRef, MouseEvent, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { ButtonProps } from 'antd'
import { millisecondsToTimeArray, timeArrayToMilliseconds } from 'app/utils/time'
import { defaultAppNotificationOptions, runCountingDown, AppNotificationOptions } from './utils'
import { timerSessions } from './timerSessions'
import { TimerView } from 'app/components'
import { Capacitor } from '@capacitor/core'
import { TimerPlugin } from 'src/plugins'
import type { TimerType } from 'src/plugins'

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
  type?: TimerType,
  groupId?: string,
  exerciseTitle?: string,
  side?: 'left' | 'right' | '',
  sideLabel?: string,
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
  type,
  groupId,
  exerciseTitle,
  side,
  sideLabel,
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
  const [ isHydrated, setIsHydrated ] = useState(false)

  const valueRef = useRef(value)
  const prevRafMsRef = useRef(0)
  const msLeftFromPrevRafRef = useRef(0)
  const newTimeLeftRef = useRef(duration)
  const diffRef = useRef(0)
  const rafIdRef = useRef(null)

  const isRunningRef = useRef(false)
  const isPausedRef = useRef(false)

  const notificationCountRef = useRef(0)
  const isNotifiedRef = useRef(false)
  const renotificationTimeoutIdRef = useRef(0 as unknown as NodeJS.Timeout)

  const nativeMeta = {
    type,
    groupId,
    exerciseTitle,
    side,
    sideLabel,
  }

  const applyRestoredState = (remainingMs: number, running: boolean, paused: boolean) => {
    const clamped = Math.max(0, remainingMs)
    const timeValue = millisecondsToTimeArray(clamped)
    valueRef.current = timeValue
    newTimeLeftRef.current = clamped
    prevRafMsRef.current = 0
    msLeftFromPrevRafRef.current = 0
    diffRef.current = 0
    setValue(timeValue)

    if (clamped <= 0) {
      setIsRunning(false)
      setIsPaused(false)
      setIsFinished(true)
      isRunningRef.current = false
      isPausedRef.current = false
      timerSessions.remove(timerId)
      return
    }

    setIsFinished(false)
    setIsRunning(running)
    setIsPaused(paused)
    isRunningRef.current = running
    isPausedRef.current = paused

    if (running) {
      timerSessions.markRunning(timerId, duration, clamped)
    } else if (paused) {
      timerSessions.markPaused(timerId, duration, clamped)
    }
  }

  const handleResetTimer = async (e?: MouseEvent<HTMLElement>) => {
    clearTimeout(renotificationTimeoutIdRef.current)
    
    setIsRunning(false)
    setIsFinished(false)
    setIsPaused(false)
    setValue(initialValue)
    isRunningRef.current = false
    isPausedRef.current = false
    
    cancelAnimationFrame(rafIdRef.current)
    
    isNotifiedRef.current = false
    notificationCountRef.current = 0

    valueRef.current = initialValue
    newTimeLeftRef.current = duration
    
    prevRafMsRef.current = 0
    msLeftFromPrevRafRef.current = 0
    diffRef.current = 0

    timerSessions.remove(timerId)
    
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
      const remaining = Math.floor(newTimeLeftRef.current || duration)

      if (Capacitor.isNativePlatform()) {    
        if (!isPaused && !isRunning) {
          await TimerPlugin.startTimer({
            duration: remaining,
            timerId: timerId,
            label: appNotificationOptions.running?.label || defaultAppNotificationOptions.running.label,
            body: appNotificationOptions.running?.body || defaultAppNotificationOptions.running.body,
            ...nativeMeta,
          })
        } else if (isPaused) {
          await TimerPlugin.resumeTimer({
            timerId: timerId,
            label: appNotificationOptions.running?.label || defaultAppNotificationOptions.running.label,
            body: appNotificationOptions.running?.body || defaultAppNotificationOptions.running.body,
            ...nativeMeta,
          })
        }
      }

      timerSessions.markRunning(timerId, duration, remaining)
      setIsRunning(true)
      setIsPaused(false)
      isRunningRef.current = true
      isPausedRef.current = false
      onRun?.(newTimeLeftRef.current)
      if (e) buttonProps?.onClick?.(true, e)
    } catch (error) {
      console.error('Failed to start timer service:', error)
    }
  }

  const handlePauseTimer = async (e?: MouseEvent<HTMLElement>) => {
    setIsRunning(false)
    setIsPaused(true)
    isRunningRef.current = false
    isPausedRef.current = true
    timerSessions.markPaused(timerId, duration, newTimeLeftRef.current)

    if (Capacitor.isNativePlatform()) {
      try {
        await TimerPlugin.pauseTimer({
          timerId: timerId,
          label: appNotificationOptions.paused?.label || defaultAppNotificationOptions.paused.label,
          body: appNotificationOptions.paused?.body || defaultAppNotificationOptions.paused.body,
          ...nativeMeta,
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

  // Restore session / native timer after remount (e.g. tab navigation)
  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const native = await TimerPlugin.getTimer({ timerId })
          if (cancelled) return

          if (native.exists) {
            applyRestoredState(
              Math.floor(native.remainingMs ?? 0),
              !native.isPaused,
              !!native.isPaused,
            )
            setIsHydrated(true)
            return
          }

          // Native timer gone — drop stale session
          const session = timerSessions.get(timerId)
          if (session?.isRunning || session?.isPaused) {
            timerSessions.remove(timerId)
          }
          setIsHydrated(true)
          return
        }

        const remaining = timerSessions.getRemainingMs(timerId)
        const session = timerSessions.get(timerId)
        if (session && remaining != null) {
          applyRestoredState(remaining, session.isRunning, session.isPaused)
        }
      } catch (error) {
        console.error('Failed to restore timer session:', error)
      } finally {
        if (!cancelled) setIsHydrated(true)
      }
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [ timerId ])

  useEffect(() => {
    if (!isHydrated) return
    if (duration !== timeArrayToMilliseconds(value) && !isRunning && !isPaused && !isFinished) {
      valueRef.current = initialValue
      newTimeLeftRef.current = duration
      prevRafMsRef.current = 0
      msLeftFromPrevRafRef.current = 0
      diffRef.current = 0

      setValue(valueRef.current)
      onChange?.([ ...valueRef.current ], newTimeLeftRef.current)
    }
  }, [ duration, isHydrated ])

  useEffect(() => {
    if (!isHydrated) return undefined
    return runCountingDown({
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
    })
  }, [ isRunning, isPaused, isFinished, duration, msOn, isHydrated ])

  useEffect(() => {
    isRunningRef.current = isRunning
    isPausedRef.current = isPaused
  }, [ isRunning, isPaused ])

  // Keep session endAt in sync while counting down
  useEffect(() => {
    if (!isHydrated || !isRunning || isPaused) return undefined
    const intervalId = window.setInterval(() => {
      timerSessions.markRunning(timerId, duration, newTimeLeftRef.current)
    }, 1000)
    return () => clearInterval(intervalId)
  }, [ isRunning, isPaused, isHydrated, timerId, duration ])

  useEffect(() => {
    if (isFinished) {
      timerSessions.remove(timerId)
      onTimeOver?.(duration)
    }
  }, [ isFinished ])

  useEffect(() => () => {
    if (stopOnUnmount) {
      handleResetTimer()
      return
    }

    // Persist UI session so remount can restore; keep native service running
    if (isRunningRef.current) {
      timerSessions.markRunning(timerId, duration, newTimeLeftRef.current)
    } else if (isPausedRef.current) {
      timerSessions.markPaused(timerId, duration, newTimeLeftRef.current)
    }
  }, [ stopOnUnmount, timerId, duration ])

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
