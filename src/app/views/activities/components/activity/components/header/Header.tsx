import { Stopwatch, TimePicker } from 'app/components'
import { PageHeaderTitle } from 'app/contexts/header_title/HeaderTItleContextProvider'
import { Button, Form } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { StopwatchContainer } from '../styled'
import { useToggle } from 'app/hooks'
import styled from 'styled-components'
import { RefObject, useEffect, useRef, useState } from 'react'
import './Header.scss'
import { dayjsToSeconds, dayjsToTimeArray, timeArrayToSeconds } from 'app/utils/time'
import dayjs, { Dayjs } from 'dayjs'
import { StopwatchRef } from 'app/components/stopwatch/Stopwatch'
import { WorkoutForm } from 'app/store/slices/workout/types'
import { ActivityForm } from 'app/store/slices/activity/types'
import { Optional } from 'utility-types'

const StyledButton = styled(Button)`
  margin-top:1px;
  color: white;
  &:focus, &:hover, &:active {
    color: white;
    background-color: #00ffb542;
  }
`

const StyledTimePicker = styled(TimePicker)`
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  padding: 0;
  margin: 0;
  pointer-events: none;
  opacity: 0;
  outline: none;
  overflow: hidden;
`

export type HeaderProps = {
  disabled: boolean
  initialValues: Optional<ActivityForm, 'workout_id'>
  isEdit: boolean
  selectedWorkout: WorkoutForm['id']
  durationTimerRef: RefObject<StopwatchRef>
  updateDurationInForm: (ms: number) => void
  resetDuration: () => void
  handleDurationChange: (ms: number) => void
}

const createDate = (duration: number) => dayjs.tz(duration, 'UTC')

const Header = ({
  disabled,
  initialValues,
  isEdit,
  selectedWorkout,
  durationTimerRef,
  updateDurationInForm,
  resetDuration,
  handleDurationChange,
}: HeaderProps) => {
  const [ time, setTime ] = useState(() => createDate(initialValues.duration))
  const abortController = useRef<AbortController | null>(null)
  const isTimerRunningOnInputOpenRef = useRef(false)
  const { state: isTimerInputOpen, setTrue: setIsTimerInputOpen, setFalse: setIsTimerInputClose } = useToggle(false)

  const handleOpenTimerInput = () => {
    abortController.current?.abort()
    abortController.current = new AbortController()

    if (isTimerInputOpen) {
      setIsTimerInputClose()
      if (isTimerRunningOnInputOpenRef.current) durationTimerRef.current?.runTimer()
    } else {
      if (Array.isArray(durationTimerRef.current?.value)) {
        const ms = timeArrayToSeconds(durationTimerRef.current?.value) * 1000
        handleDurationChange(ms)
        setTime(createDate(ms))
      }

      setIsTimerInputOpen()

      isTimerRunningOnInputOpenRef.current = durationTimerRef.current?.isRunning
      if (isTimerRunningOnInputOpenRef.current) durationTimerRef.current?.pauseTimer()
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

  const handleOk = (date: Dayjs) => {
    handleDurationChange(dayjsToSeconds(date))
    setTime(date)
    setIsTimerInputClose()
    durationTimerRef.current?.setTime(dayjsToTimeArray(date))
  }

  useEffect(() => () => isTimerInputOpen && abortController.current?.abort(), [ isTimerInputOpen ])

  return (
    <PageHeaderTitle>
      <Form.Item noStyle name="duration">
        <StopwatchContainer className="activity-timer-container">
          <Stopwatch
            key={`${selectedWorkout}`}
            ref={durationTimerRef}
            hoursOn
            showResetButton
            disabled={isEdit || !selectedWorkout}
            className="activity-timer"
            initialValue={initialValues.duration}
            msOn={false}
            onPause={updateDurationInForm}
            onReset={resetDuration}
            onChange={handleDurationChange}
          />
          <StyledButton type="text" icon={<EditOutlined />} disabled={disabled} onClick={handleOpenTimerInput} />
          <StyledTimePicker
            open={isTimerInputOpen}
            value={time}
            inputReadOnly
            showNow={false}
            onOk={handleOk}
            name="duration"
            popupClassName="activity-timer-input-dropdown"
            size="large"
            allowClear={false}
            placeholder=""
          />
        </StopwatchContainer>
      </Form.Item>
    </PageHeaderTitle>
  )
}

export default Header
