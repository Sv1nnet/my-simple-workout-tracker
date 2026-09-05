import { RefObject, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
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
  secOn?: boolean,
  hoursOn?: boolean,
  keepPageAwake?: boolean,
  onChange?: (value: number) => void,
  onReset?: VoidFunction,
  onPause?: (timeElapsedInMs: number) => void,
  onRun?: (timeElapsedInMs: number) => void,
  onTimeOver?: (duration: number) => void,
  showRunPauseButton?: boolean,
  showStopButton?: boolean,
  containerProps?: React.HTMLAttributes<HTMLDivElement>,
  timeElementProps?: React.HTMLAttributes<HTMLSpanElement>,
  buttonProps?: Omit<ButtonProps, 'onClick'> & {
    onClick?: (runState: boolean, e: React.MouseEvent<HTMLElement>) => void,
  },
  stopButtonProps?: Omit<ButtonProps, 'onClick'> & {
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
  getValue: () => [number, number, number, number],
  valueRef: RefObject<number[]>
}

const Stopwatch = forwardRef<StopwatchRef, IStopwatch>(
  function Stopwatch({
    msOn = true,
    secOn = true,
    initialValue = 0,
    disabled,
    onChange,
    onReset,
    onPause,
    onRun,
    hoursOn,
    showRunPauseButton = true,
    showStopButton = true,
    timeElementProps,
    buttonProps,
    stopButtonProps,
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

    const resetTimerValues = useCallback((newTimeArray?: number[]) => {
      const newTimeMs = newTimeArray ? timeArrayToMilliseconds(newTimeArray) : 0

      if (!newTimeMs) {
        prevTimeoutMsRef.current = newTimeMs
        diffRef.current = newTimeMs
      }

      valueRef.current = millisecondsToTimeArray(newTimeMs)
      return valueRef.current
    }, [])

    const setTime = (newTimeArray?: number[]) => {
      const newValue = resetTimerValues(newTimeArray)

      setValue(newValue)
      timePassedRef.current = timeArrayToMilliseconds(newValue)
      valueRef.current = newValue
      onChange?.(timeArrayToMilliseconds(newValue))
      return newValue
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

      if (showStopButton) stopButtonProps?.onClick?.(false, e)
      if (!showStopButton) buttonProps?.onClick?.(false, e)
    }

    const handleRunTimer = (e?: React.MouseEvent<HTMLElement>) => {
      setIsRunning(true)
      setIsPaused(false)

      onRun?.(timePassedRef.current)
      buttonProps?.onClick?.(true, e)
    }

    const handlePauseTimer = (e?: React.MouseEvent<HTMLElement>) => {
      setIsRunning(false)
      setIsPaused(true)

      setTime(millisecondsToTimeArray(timePassedRef.current))
      onPause?.(timePassedRef.current)
      buttonProps?.onClick?.(false, e)
    }

    const getValue = useCallback(() => millisecondsToTimeArray(timePassedRef.current), [])

    useImperativeHandle(ref, () => ({
      runTimer: handleRunTimer,
      pauseTimer: handlePauseTimer,
      resetTimer: handleResetTimer,
      setTime,
      isRunning,
      isPaused,
      getValue,
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
    }), [ isRunning, isPaused, msOn, onChange ])

    return (
      <TimerView
        onRun={handleRunTimer}
        onPause={handlePauseTimer}
        onReset={handleResetTimer}
        isRunning={isRunning}
        initialValue={initialValuesTimeArray}
        value={value}
        msOn={msOn}
        secOn={secOn}
        hoursOn={hoursOn}
        disabled={disabled}
        showRunPauseButton={showRunPauseButton}
        showStopButton={showStopButton}
        stopButtonProps={stopButtonProps}
        buttonProps={buttonProps}
        timeElementProps={timeElementProps}
        {...rest}
      />
    )
  },
)

export default Stopwatch
