import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { ButtonProps } from 'antd'
import { millisecondsToTimeArray, timeArrayToMilliseconds } from 'app/utils/time'
import isFunc from 'app/utils/isFunc'
import { useRequestForNotificationPermission } from 'app/hooks'
import { defaultNotificationProps, runCountingDown } from './utils'
import { TimerView } from 'app/components'

export interface ITimer {
  duration: number,
  notificationTitle?: string,
  notificationOptions?: NotificationOptions,
  msOn?: boolean,
  hoursOn?: boolean,
  keepPageAwake?: boolean,
  onChange?: (value: ReturnType<typeof millisecondsToTimeArray>, timeLeftInMs: number) => void,
  onReset?: VoidFunction,
  onPause?: (timeLeftInMs: number) => void,
  onRunTimer?: (timeLeftInMs: number) => void,
  onTimeOver?: (duration: number) => void,
  resetButton?: boolean,
  containerProps?: React.HTMLAttributes<HTMLDivElement>,
  timeElementProps?: React.HTMLAttributes<HTMLSpanElement>,
  buttonProps?: Omit<ButtonProps, 'onClick'> & {
    onClick?: (runState: boolean, e: React.MouseEvent<HTMLElement>) => void,
  },
  resetButtonProps?: Omit<ButtonProps, 'onClick'> & {
    onClick?: (runState: boolean, e: React.MouseEvent<HTMLElement>) => void,
  }
}

const Timer: FC<ITimer> = ({
  notificationTitle = 'Time is over!',
  notificationOptions = defaultNotificationProps,
  duration = 0,
  msOn = true,
  onChange,
  onReset,
  onPause,
  onRunTimer,
  onTimeOver,
  hoursOn,
  resetButton,
  timeElementProps,
  buttonProps,
  resetButtonProps,
  ...rest
}) => {
  const initialValue = useMemo(() => millisecondsToTimeArray(duration), [ duration ])
  
  const { permitted } = useRequestForNotificationPermission()

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


  const handleResetTimer = (e) => {
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
    
    if (isFunc(onChange)) onChange([ ...initialValue ], newTimeLeftRef.current)
    if (isFunc(onReset)) onReset()
    if (resetButton && isFunc(resetButtonProps?.onClick)) resetButtonProps.onClick(false, e)
    if (!resetButton && isFunc(buttonProps?.onClick)) buttonProps.onClick(false, e)
  }

  const handleRunTimer = (e) => {
    setIsRunning(true)
    setIsPaused(false)
    
    if (isFunc(onRunTimer)) onRunTimer(newTimeLeftRef.current)
    if (isFunc(buttonProps?.onClick)) buttonProps.onClick(true, e)
  }

  const handlePauseTimer = (e) => {
    setIsRunning(false)
    setIsPaused(true)

    if (isFunc(onPause)) onPause(newTimeLeftRef.current)
    if (isFunc(buttonProps?.onClick)) buttonProps.onClick(false, e)
  }

  const notify = () => {
    navigator.serviceWorker.ready.then(async (registration) => {
      await registration.showNotification(notificationTitle, notificationOptions)

      isNotifiedRef.current = true
      notificationCountRef.current++

      if (notificationCountRef.current < 3 ) {
        renotificationTimeoutIdRef.current = setTimeout(notify, 1500)
      } else {
        notificationCountRef.current = 0
      }

      return registration
    })
  }

  useEffect(() => {
    if (duration !== timeArrayToMilliseconds(value)) {
      valueRef.current = initialValue
      newTimeLeftRef.current = duration
      prevRafMsRef.current = 0
      msLeftFromPrevRafRef.current = 0
      diffRef.current = 0

      setValue(valueRef.current)
      if (isFunc(onChange)) onChange([ ...valueRef.current ], newTimeLeftRef.current)
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
    onTimeOver,
    notify,
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
    if (!isNotifiedRef.current && isFinished && permitted && navigator.serviceWorker) {
      if (isFunc(onTimeOver)) onTimeOver(duration)
      notify()
    }
  }, [ isFinished, permitted ])

  return (
    <TimerView
      onRunTimer={handleRunTimer}
      onPause={handlePauseTimer}
      onReset={handleResetTimer}
      isRunning={isRunning}
      isPaused={isPaused}
      isFinished={isFinished}
      initialValue={initialValue}
      value={value}
      duration={duration}
      msOn={msOn}
      hoursOn={hoursOn}
      showResetButton={resetButton}
      resetButtonProps={resetButtonProps}
      buttonProps={buttonProps}
      timeElementProps={timeElementProps}
      {...rest}
    />
  )
}

export default Timer
