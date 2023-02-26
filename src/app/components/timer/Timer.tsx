import { FC, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Button, ButtonProps } from 'antd'
import { CaretRightOutlined, PauseOutlined, RedoOutlined } from '@ant-design/icons'
import { milisecondsToTimeArray, timeArrayToMiliseconds, timeArrayToSeconds } from 'app/utils/time'
import { theme } from 'src/styles/vars'
import isFunc from 'app/utils/isFunc'
import { useRequestForNotificationPermission } from 'app/hooks'
import { defaultNotificationProps, getFinalValue, runCountingDown } from './utils'

const TimerContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 1px solid ${theme.borderColorBase};
  font-size: 16px;
  padding-left: 6.5px;
  box-shadow: ${({ $isFinished }) => $isFinished ? '0px 0px 3px red' : 'none'};
`

export interface ITimer {
  duration: number,
  notificationTitle?: string,
  notificationOptions?: NotificationOptions,
  msOn?: boolean,
  hoursOn?: boolean,
  keepPageAwake?: boolean,
  onChange?: (value: ReturnType<typeof milisecondsToTimeArray>, timeLeftInMs: number) => void,
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
  containerProps,
  timeElementProps,
  buttonProps,
  resetButtonProps,
}) => {
  const initialValue = useMemo(() => milisecondsToTimeArray(duration), [ duration ])
  
  const { permitted } = useRequestForNotificationPermission()

  const [ value, setValue ] = useState(initialValue)
  const [ isRunning, setIsRunning ] = useState(false)
  const [ isPaused, setIsPaused ] = useState(false)
  const [ isFinished, setIsFinished ] = useState(false)

  const prevRafMsRef = useRef(0)
  const msLeftFromPrevRafRef = useRef(0)
  const newTimeLeftRef = useRef(0)
  const diffRef = useRef(0)
  const valueRef = useRef([ ...value ])
  const rafIdRef = useRef(null)

  const notificationCountRef = useRef(0)
  const isNotifiedRef = useRef(false)
  const renotificationTimeoutIdRef = useRef(0 as unknown as NodeJS.Timeout)

  const resetTimer = (e) => {
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

  const buttonAttributes = useMemo(() => {
    const runTimer = (e) => {
      setIsRunning(true)
      setIsPaused(false)
      

      if (isFunc(onRunTimer)) onRunTimer(newTimeLeftRef.current)
      if (isFunc(buttonProps?.onClick)) buttonProps.onClick(true, e)
    }

    const pauseTimer = (e) => {
      setIsRunning(false)
      setIsPaused(true)

      if (isFunc(onPause)) onPause(newTimeLeftRef.current)
      if (isFunc(buttonProps?.onClick)) buttonProps.onClick(false, e)
    }

    return isRunning
      ? {
        icon: <PauseOutlined style={{ fontSize: 26 }} />,
        onClick: pauseTimer,
      }
      : isFinished
        ? resetButton
          ? {
            icon: <CaretRightOutlined style={{ fontSize: 26 }} />,
            onClick: (e) => {
              resetTimer(e)
              runTimer(e)
            },
          }
          : {
            icon: <RedoOutlined style={{ fontSize: 26 }} />,
            onClick: resetTimer,
          }
        : {
          icon: <CaretRightOutlined style={{ fontSize: 26 }} />,
          onClick: runTimer,
        }
  }, [ isRunning, isFinished, resetButton ])

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
    if (duration !== timeArrayToMiliseconds(value)) {
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
  }), [ isRunning, isPaused, msOn ])

  useEffect(() => {
    if (!isNotifiedRef.current && isFinished && permitted && navigator.serviceWorker) {
      if (isFunc(onTimeOver)) onTimeOver(duration)
      notify()
    }
  }, [ isFinished, permitted ])

  return (
    <TimerContainer {...containerProps} $isFinished={isFinished}>
      <span style={{ marginRight: 4 }} {...timeElementProps}>{getFinalValue(value, msOn, hoursOn, initialValue)}</span>
      <Button type="text" size="middle" {...buttonProps} {...buttonAttributes} />
      {resetButton && (
        <Button
          type="text"
          size="middle"
          disabled={duration === timeArrayToSeconds(valueRef.current) * 1000}
          icon={<RedoOutlined style={{ fontSize: 26 }} />}
          {...resetButtonProps}
          onClick={resetTimer}
        />
      )}
    </TimerContainer>
  )
}

export default Timer
