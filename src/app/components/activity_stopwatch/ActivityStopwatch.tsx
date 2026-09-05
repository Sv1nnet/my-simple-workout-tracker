import { Stopwatch } from 'app/components'
import { StopwatchContainer, StyledButton, StyledTimePicker } from './components/styled'
import { EditOutlined } from '@ant-design/icons'
import { RefObject, useEffect, useRef } from 'react'
import { Dayjs } from 'dayjs'
import { IStopwatch, StopwatchRef } from 'app/components/stopwatch/Stopwatch'
import { useToggle } from 'app/hooks'

export type ActivityStopWatchProps = {
  durationTimerRef?: RefObject<StopwatchRef>
  isDisabled?: boolean
  initialDuration?: number
  hideEditButton?: boolean
  onRun?: (msElapsed: number) => void
  onPause?: (msElapsed: number) => void
  onStop?: () => void
  onDurationChange?: (ms: number) => void
  onOpenTimerInput?: () => void
  onTimePickerOpen?: () => void
  onTimePickerClose?: () => void
  isTimerInputOpen?: boolean
  time: Dayjs
  onOk?: (date: Dayjs) => void
  stopwatchProps?: Omit<IStopwatch, 'ref' | 'hoursOn' | 'disabled' | 'msOn' | 'onRun' | 'onPause' | 'onReset' | 'onChange'>
}

const ActivityStopwatch = ({
  durationTimerRef,
  isDisabled,
  initialDuration = 0,
  onRun,
  onPause,
  onStop,
  onDurationChange,
  onOpenTimerInput: _onOpenTimerInput,
  // isTimerInputOpen,
  onTimePickerOpen,
  onTimePickerClose,
  hideEditButton,
  time,
  onOk,
  stopwatchProps,
}: ActivityStopWatchProps) => {
  const abortController = useRef<AbortController | null>(null)
  /** if the timer is running when the time picker is opened */
  const isTimerRunningOnInputOpenRef = useRef(false)
  const { state: isTimerInputOpen, setTrue: setIsTimerInputOpen, setFalse: setIsTimerInputClose } = useToggle(false)
  
  const handleOpenTimerInput = () => {
    abortController.current?.abort()
    abortController.current = new AbortController()

    if (isTimerInputOpen) {
      setIsTimerInputClose()
      if (isTimerRunningOnInputOpenRef.current) onTimePickerClose()
    } else {
      // if (Array.isArray(durationTimerRef.current?.getValue())) {
      //   const ms = timeArrayToSeconds(durationTimerRef.current?.getValue()) * 1000
      //   onDurationChange(ms)
      //   setTime(createDate(ms))
      // }
      
      setIsTimerInputOpen()
      
      
      isTimerRunningOnInputOpenRef.current = durationTimerRef.current?.isRunning
      if (isTimerRunningOnInputOpenRef.current) onTimePickerOpen()
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
    abortController.current?.abort()
    setIsTimerInputClose()
    if (isTimerRunningOnInputOpenRef.current) onTimePickerClose?.()
    onOk?.(date)
  }

  useEffect(() => () => isTimerInputOpen && abortController.current?.abort(), [ isTimerInputOpen ])
  useEffect(() => () => abortController.current?.abort(), [])

  return (
    <StopwatchContainer className="activity-timer-container">
      <Stopwatch
        ref={durationTimerRef}
        hoursOn
        showStopButton
        disabled={isDisabled}
        className="activity-timer"
        initialValue={initialDuration}
        msOn={false}
        onRun={onRun}
        onPause={onPause}
        onReset={onStop}
        onChange={onDurationChange}
        {...stopwatchProps}
      />
      {!hideEditButton && <StyledButton type="text" disabled={isDisabled} icon={<EditOutlined />} onClick={handleOpenTimerInput} />}
      <StyledTimePicker
        open={isTimerInputOpen}
        value={time}
        inputReadOnly
        showNow={false}
        onOk={handleOk}
        onOpenChange={(open) => {
          if (!open) {
            abortController.current?.abort()
            setIsTimerInputClose()
          }
        }}
        name="duration"
        popupClassName="activity-timer-input-dropdown"
        size="large"
        allowClear={false}
        placeholder=""
      />
    </StopwatchContainer>
  )
}


export default ActivityStopwatch