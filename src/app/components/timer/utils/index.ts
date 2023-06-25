import { millisecondsToTimeArray, timeArrayToMilliseconds } from 'app/utils/time'
import { MS_TO_SET_STATE_WHEN_MS_OFF, MS_TO_SET_STATE_WHEN_MS_ON } from 'app/components/timer_view/utils'

const TIME_IS_OVER_VALUE = millisecondsToTimeArray(0)
const SECOND = 1000

export const runCountingDown = ({
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
}) => {
  const msToSetState = msOn ? MS_TO_SET_STATE_WHEN_MS_ON : MS_TO_SET_STATE_WHEN_MS_OFF
  const diffStep = msOn ? 16 : SECOND

  let _isRunning = isRunning
  let _isPaused = isPaused
  newTimeLeftRef.current = timeArrayToMilliseconds(valueRef.current)

  let isDocumentVisible = true
  let timeLeftInMs = 0
  let prevTimeoutTimestamp = Date.now()
  let timeoutId: NodeJS.Timeout = 0 as unknown as NodeJS.Timeout

  const runTimeout = () => {
    if (!_isRunning || _isPaused || isDocumentVisible) return

    const now = Date.now()
    timeLeftInMs += now - prevTimeoutTimestamp
    prevTimeoutTimestamp = now

    if (timeLeftInMs >= duration && !isNotifiedRef.current) {
      setIsRunning(false)
      setIsFinished(true)
      setValue(TIME_IS_OVER_VALUE)
      clearTimeout(timeoutId)
    } else {
      timeoutId = setTimeout(runTimeout)
    }
  }

  const runBackgroundTimer = () => {
    if (!_isRunning || _isPaused) return
    setTimeout(runTimeout, 16)
  }
  
  const rafFn: FrameRequestCallback = () => {
    const now = Date.now()

    if (!prevRafMsRef.current) {
      prevRafMsRef.current = now - diffRef.current
      msLeftFromPrevRafRef.current = diffRef.current
    } else {
      msLeftFromPrevRafRef.current = now - prevRafMsRef.current
    }

    const prevTimeLeft = newTimeLeftRef.current
    newTimeLeftRef.current -= msLeftFromPrevRafRef.current
    diffRef.current += prevTimeLeft - newTimeLeftRef.current
    prevRafMsRef.current = now

    if (_isRunning && newTimeLeftRef.current > 0) {
      diffRef.current += diffStep

      if (msLeftFromPrevRafRef.current >= 0 && diffRef.current >= msToSetState) {
        diffRef.current = 0
        valueRef.current = millisecondsToTimeArray(newTimeLeftRef.current)

        setValue(valueRef.current)
        onChange?.([ ...valueRef.current ], newTimeLeftRef.current)
      }

      rafIdRef.current = requestAnimationFrame(rafFn)
    } else if (!_isPaused && newTimeLeftRef.current <= 0) {
      setIsRunning(false)
      setIsFinished(true)
      setValue(TIME_IS_OVER_VALUE)
      clearTimeout(timeoutId)

      onChange?.([ ...TIME_IS_OVER_VALUE ], 0)
    } else if (_isPaused) {
      prevRafMsRef.current = 0
    }
  }

  if (isRunning) {
    rafIdRef.current = requestAnimationFrame(rafFn)
  } else {
    prevRafMsRef.current = 0
    cancelAnimationFrame(rafIdRef.current)
    clearTimeout(timeoutId)
  }

  const documentVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      isDocumentVisible = true
      clearTimeout(timeoutId)
      return
    }

    const now = Date.now()
    diffRef.current = now
    prevRafMsRef.current = now
    isDocumentVisible = false
    runBackgroundTimer()
  }

  document.addEventListener('visibilitychange', documentVisibilityChange)

  return () => {
    _isRunning = false
    _isPaused = true
    document.removeEventListener('visibilitychange', documentVisibilityChange)
    cancelAnimationFrame(rafIdRef.current)
  }
}

export const defaultNotificationProps: NotificationOptions = {
  tag: 'timer',
  body: 'Get back to work!',
  renotify: true,
}
