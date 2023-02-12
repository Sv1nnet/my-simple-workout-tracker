/** @format */

import { FC, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Button, ButtonProps } from 'antd'
import { CaretRightOutlined, PauseOutlined, RedoOutlined } from '@ant-design/icons'
import { getTimeDateUnit, milisecondsToTimeArray, timeArrayToMiliseconds, timeArrayToSeconds } from '../../utils/time'
import { theme } from 'src/styles/vars'
import isFunc from '../../utils/isFunc'

const TimerContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 1px solid ${theme.borderColorBase};
  font-size: 16px;
  padding-left: 6.5px;
  box-shadow: ${({ $isFinished }) => $isFinished ? '0px 0px 3px red' : 'none'};
`

const MS_TO_SET_STATE_WHEN_MS_OFF = 980
const MS_TO_SET_STATE_WHEN_MS_ON = 33
const TIME_IS_OVER_VALUE = milisecondsToTimeArray(0)

export interface ITimer {
  duration: number,
  msOn?: boolean,
  hoursOn?: boolean,
  keepPageAwake?: boolean,
  onChange?: (value: ReturnType<typeof milisecondsToTimeArray>, timeLeftInMs: number) => void,
  onReset?: VoidFunction,
  onPause?: (timeLeftInMs: number) => void,
  onRunTimer?: (timeLeftInMs: number) => void,
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

const Timer: FC<ITimer> = ({ duration = 0, msOn = true, onChange, onReset, onPause, onRunTimer, hoursOn, resetButton, containerProps, timeElementProps, buttonProps, resetButtonProps }) => {
  const initialValue = useMemo(() => milisecondsToTimeArray(duration), [ duration ])
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

  const resetTimer = (e) => {
    setIsRunning(false)
    setIsFinished(false)
    setIsPaused(false)
    setValue(initialValue)

    cancelAnimationFrame(rafIdRef.current)

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

  useEffect(() => {
    const msToSetState = msOn ? MS_TO_SET_STATE_WHEN_MS_ON : MS_TO_SET_STATE_WHEN_MS_OFF
    const diffStep = msOn ? 16 : 1000

    let _isRunning = isRunning
    let _isPaused = isPaused
    newTimeLeftRef.current = timeArrayToMiliseconds(valueRef.current)

    const rafFn: FrameRequestCallback = (ms) => {
      if (!prevRafMsRef.current) {
        prevRafMsRef.current = ms - diffRef.current
        msLeftFromPrevRafRef.current = diffRef.current
      } else {
        msLeftFromPrevRafRef.current = ms - prevRafMsRef.current
      }

      const prevTimeLeft = newTimeLeftRef.current
      newTimeLeftRef.current -= msLeftFromPrevRafRef.current
      diffRef.current += prevTimeLeft - newTimeLeftRef.current
      prevRafMsRef.current = ms

      if (_isRunning && newTimeLeftRef.current > 0) {
        diffRef.current += diffStep

        if (msLeftFromPrevRafRef.current >= 0 && diffRef.current >= msToSetState) {
          diffRef.current = 0
          valueRef.current = milisecondsToTimeArray(newTimeLeftRef.current)
          setValue(valueRef.current)
          if (isFunc(onChange)) onChange([ ...valueRef.current ], newTimeLeftRef.current)
        }

        rafIdRef.current = requestAnimationFrame(rafFn)
      } else if (!_isPaused && newTimeLeftRef.current <= 0) {
        setIsRunning(false)
        setIsFinished(true)
        setValue(TIME_IS_OVER_VALUE)

        if (isFunc(onChange)) onChange([ ...TIME_IS_OVER_VALUE ], 0)
      } else if (_isPaused) {
        prevRafMsRef.current = 0
      }
    }

    if (isRunning) {
      rafIdRef.current = requestAnimationFrame(rafFn)
    } else {
      prevRafMsRef.current = 0
      cancelAnimationFrame(rafIdRef.current)
    }

    return () => {
      _isRunning = false
      _isPaused = true
      cancelAnimationFrame(rafIdRef.current)
    }
  }, [ isRunning, isPaused, msOn ])

  const getFinalValue = (_value: number[]) => {
    let [ h, m, s, ms ] = _value

    // if displaying ms is off then we shoutl show ceil seconds
    // and only do it if time to display is not initial
    // and time is not over
    if (!msOn && !_value.every(time => time === 0) && _value.some((time, index) => time !== initialValue[index])) {
      ms = ms < 100 ? 900 + ms : ms
      s = s === 0 && ms === 0 ? 0 : ((s * 1000) + ms) / 1000
    }

    const result = (hoursOn ? [ h, m, s ] : [ m, s ]).map(time => getTimeDateUnit(Math.ceil(time), true)).join(':')
    if (msOn) return `${result}.${getTimeDateUnit(Math.floor(ms / 10), true)}`
    return result
  }

  return (
    <TimerContainer {...containerProps} $isFinished={isFinished}>
      <span style={{ marginRight: 4 }} {...timeElementProps}>{getFinalValue(value)}</span>
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
