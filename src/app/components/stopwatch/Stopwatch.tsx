import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { ButtonProps } from 'antd'
import { millisecondsToTimeArray, timeArrayToMilliseconds } from 'app/utils/time'
import isFunc from 'app/utils/isFunc'
import { TimerView } from 'app/components'
import { runCountingUp } from './utils'

export interface IStopwatch {
  // milliseconds
  className?: string,
  initialValue?: number,
  notificationTitle?: string,
  notificationOptions?: NotificationOptions,
  disabled?: boolean,
  msOn?: boolean,
  hoursOn?: boolean,
  keepPageAwake?: boolean,
  onChange?: (value: number) => void,
  onReset?: VoidFunction,
  onPause?: (timeLeftInMs: number) => void,
  onRunTimer?: (timeLeftInMs: number) => void,
  onTimeOver?: (duration: number) => void,
  showResetButton?: boolean,
  containerProps?: React.HTMLAttributes<HTMLDivElement>,
  timeElementProps?: React.HTMLAttributes<HTMLSpanElement>,
  buttonProps?: Omit<ButtonProps, 'onClick'> & {
    onClick?: (runState: boolean, e: React.MouseEvent<HTMLElement>) => void,
  },
  resetButtonProps?: Omit<ButtonProps, 'onClick'> & {
    onClick?: (runState: boolean, e: React.MouseEvent<HTMLElement>) => void,
  }
}

const Stopwatch: FC<IStopwatch> = ({
  msOn = true,
  initialValue = 0,
  disabled,
  onChange,
  onReset,
  onPause,
  onRunTimer,
  hoursOn,
  showResetButton,
  timeElementProps,
  buttonProps,
  resetButtonProps,
  ...rest
}) => {
  const initialValuesTimeArray = useMemo(() => millisecondsToTimeArray(initialValue), [ initialValue ])
  const [ value, setValue ] = useState(initialValuesTimeArray)
  const [ isRunning, setIsRunning ] = useState(false)
  const [ isPaused, setIsPaused ] = useState(false)

  const timePassedRef = useRef(initialValue)
  const prevTimeoutMsRef = useRef(0)
  const diffRef = useRef(0)
  const timeoutIdRef = useRef(null)

  const valueRef = useRef(value)

  const resetTimerValues = () => {
    prevTimeoutMsRef.current = 0
    diffRef.current = 0
    valueRef.current = millisecondsToTimeArray(0)
    return valueRef.current
  }

  const handleResetTimer = (e: React.MouseEvent<HTMLElement>) => {
    setIsRunning(false)
    setIsPaused(false)

    const newValue = resetTimerValues()
    setValue(newValue)
    
    clearTimeout(timeoutIdRef.current)

    timePassedRef.current = 0
    
    if (isFunc(onChange)) onChange(timeArrayToMilliseconds(value))
    if (isFunc(onReset)) onReset()
    if (showResetButton && isFunc(resetButtonProps?.onClick)) resetButtonProps.onClick(false, e)
    if (!showResetButton && isFunc(buttonProps?.onClick)) buttonProps.onClick(false, e)
  }

  const handleRunTimer = (e: React.MouseEvent<HTMLElement>) => {
    setIsRunning(true)
    setIsPaused(false)
    
    if (isFunc(onRunTimer)) onRunTimer(timeArrayToMilliseconds(value))
    if (isFunc(buttonProps?.onClick)) buttonProps.onClick(true, e)
  }

  const handlePauseTimer = (e: React.MouseEvent<HTMLElement>) => {
    setIsRunning(false)
    setIsPaused(true)

    if (isFunc(onPause)) onPause(timeArrayToMilliseconds(value))
    if (isFunc(buttonProps?.onClick)) buttonProps.onClick(false, e)
  }

  useEffect(() => {
    if (initialValue !== timeArrayToMilliseconds(value)) {
      const newValue = resetTimerValues()
      setValue(newValue)
      if (isFunc(onChange)) onChange(initialValue)
    }
  }, [ initialValue ])

  useEffect(() => runCountingUp({
    msOn,
    timePassedRef,
    isRunning,
    isPaused,
    valueRef,
    setValue,
    prevTimeoutMsRef,
    diffRef,
    timeoutIdRef,
    onChange,
  }), [ isRunning, isPaused, msOn ])

  return (
    <TimerView
      onRunTimer={handleRunTimer}
      onPause={handlePauseTimer}
      onReset={handleResetTimer}
      isRunning={isRunning}
      isPaused={isPaused}
      initialValue={initialValuesTimeArray}
      value={value}
      msOn={msOn}
      hoursOn={hoursOn}
      disabled={disabled}
      showResetButton={showResetButton}
      resetButtonProps={resetButtonProps}
      buttonProps={buttonProps}
      timeElementProps={timeElementProps}
      {...rest}
    />
  )
}

export default Stopwatch