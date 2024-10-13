import { RefObject, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { ButtonProps } from 'antd'
import { millisecondsToTimeArray, timeArrayToMilliseconds } from 'app/utils/time'
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

export type StopwatchRef = {
  runTimer: (e?: React.MouseEvent<HTMLElement>) => void,
  pauseTimer: (e?: React.MouseEvent<HTMLElement>) => void,
  resetTimer: (e?: React.MouseEvent<HTMLElement>) => void,
  setTime: (newTimeArray?: number[]) => number[],
  isRunning: boolean,
  isPaused: boolean,
  value: number[]
  valueRef: RefObject<number[]>
}

const Stopwatch = forwardRef<StopwatchRef, IStopwatch>(
  function Stopwatch({
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
  }, ref) {
    const initialValuesTimeArray = useMemo(() => millisecondsToTimeArray(initialValue), [ initialValue ])
    const [ value, setValue ] = useState(initialValuesTimeArray)
    const [ isRunning, setIsRunning ] = useState(false)
    const [ isPaused, setIsPaused ] = useState(false)

    const timePassedRef = useRef(initialValue)
    const prevTimeoutMsRef = useRef(0)
    const diffRef = useRef(0)
    const timeoutIdRef = useRef(null)

    const valueRef = useRef(value)

    const resetTimerValues = (newTimeArray?: number[]) => {
      const newTimeMs = newTimeArray ? timeArrayToMilliseconds(newTimeArray) : 0

      if (!newTimeMs) {
        prevTimeoutMsRef.current = newTimeMs
        diffRef.current = newTimeMs
      }

      valueRef.current = millisecondsToTimeArray(newTimeMs)
      return valueRef.current
    }

    const handleResetTimer = (e?: React.MouseEvent<HTMLElement>) => {
      setIsRunning(false)
      setIsPaused(false)

      const newValue = resetTimerValues()
      setValue(newValue)
    
      clearTimeout(timeoutIdRef.current)

      timePassedRef.current = 0
    
      onChange?.(timeArrayToMilliseconds(value))
      onReset?.()

      if (showResetButton) resetButtonProps?.onClick?.(false, e)
      if (!showResetButton) buttonProps?.onClick?.(false, e)
    }

    const handleRunTimer = (e?: React.MouseEvent<HTMLElement>) => {
      setIsRunning(true)
      setIsPaused(false)
    
      onRunTimer?.(timeArrayToMilliseconds(value))
      buttonProps?.onClick?.(true, e)
    }

    const handlePauseTimer = (e?: React.MouseEvent<HTMLElement>) => {
      setIsRunning(false)
      setIsPaused(true)

      onPause?.(timeArrayToMilliseconds(value))
      buttonProps?.onClick?.(false, e)
    }

    const setTime = (newTimeArray?: number[]) => {
      const newValue = resetTimerValues(newTimeArray)
      
      setValue(newValue)
      timePassedRef.current = timeArrayToMilliseconds(newValue)
      valueRef.current = newValue
      onChange?.(timeArrayToMilliseconds(newValue))
      return newValue
    }

    useImperativeHandle(ref, () => ({
      runTimer: handleRunTimer,
      pauseTimer: handlePauseTimer,
      resetTimer: handleResetTimer,
      setTime,
      isRunning,
      isPaused,
      value,
      valueRef,
    }), [ value, isRunning, isPaused, handleRunTimer, handlePauseTimer, handleResetTimer, setTime ])

    useEffect(() => {
      if (initialValue !== timeArrayToMilliseconds(value)) {
        const newValue = resetTimerValues()

        setValue(newValue)
        onChange?.(initialValue)
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
  },
)

export default Stopwatch
