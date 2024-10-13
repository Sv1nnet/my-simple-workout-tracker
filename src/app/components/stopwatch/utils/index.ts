import { millisecondsToTimeArray, timeArrayToMilliseconds } from 'app/utils/time'
import { MS_TO_SET_STATE_WHEN_MS_ON } from 'app/components/timer_view/utils'
import { MutableRefObject } from 'react'

const SECOND = 1000

export const calcDiff = (diffRef: MutableRefObject<number>, prevTimeoutMsRef: MutableRefObject<number | null>) => {
  const now = Date.now()

  let prevTimeoutMs = prevTimeoutMsRef.current
  if (!prevTimeoutMs) {
    prevTimeoutMs = now
  }

  let newDiff = diffRef.current
  newDiff += now - prevTimeoutMs


  return [ newDiff, prevTimeoutMs, now ]
}

export const runCountingUp = ({
  msOn,
  isRunning,
  isPaused,
  valueRef,
  setValue,
  prevTimeoutMsRef,
  diffRef,
  timePassedRef,
  onChange,
  timeoutIdRef,
}) => {
  const msToSetState = msOn ? MS_TO_SET_STATE_WHEN_MS_ON : SECOND

  let _isRunning = isRunning
  let _isPaused = isPaused
  let isDocumentVisible = true
  
  const timeoutFn = () => {
    if (!_isRunning || _isPaused) return

    if (_isRunning) {
      const [ newDiff, prevTimeoutMs, now ] = calcDiff(diffRef, prevTimeoutMsRef)
      prevTimeoutMsRef.current = prevTimeoutMs
      diffRef.current = newDiff
      
      if (isDocumentVisible) {
        timePassedRef.current += Math.ceil((now - prevTimeoutMsRef.current) * SECOND) / SECOND
        prevTimeoutMsRef.current = now

        if (diffRef.current >= msToSetState) {
          valueRef.current = millisecondsToTimeArray(timePassedRef.current)
          setValue(valueRef.current)
          diffRef.current = 0
          onChange?.(timeArrayToMilliseconds(valueRef.current))
        }
      }    

      timeoutIdRef.current = setTimeout(timeoutFn)
    } else if (_isPaused) {
      prevTimeoutMsRef.current = null
    }
  }

  if (isRunning) {
    timeoutIdRef.current = setTimeout(timeoutFn)
  } else {
    prevTimeoutMsRef.current = null
    clearTimeout(timeoutIdRef.current)
  }

  const documentVisibilityChange = () => {
    if (document.visibilityState === 'visible') isDocumentVisible = true
    else isDocumentVisible = false
  }

  document.addEventListener('visibilitychange', documentVisibilityChange)

  return () => {
    _isRunning = false
    _isPaused = true
    document.removeEventListener('visibilitychange', documentVisibilityChange)
    clearTimeout(timeoutIdRef.current)
  }
}