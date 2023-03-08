import { getTimeDateUnit } from 'app/utils/time'

export const MS_TO_SET_STATE_WHEN_MS_OFF = 980
export const MS_TO_SET_STATE_WHEN_MS_ON = 33

export const getFinalValue = (value: number[], msOn: boolean, hoursOn: boolean, initialValue: number[], direction: number = 1) => {
  let [ h, m, s, ms ] = value

  // if displaying ms is off then we should show ceil seconds
  // and only do it if time to display is not initial
  // and time is not over
  if (!msOn && !value.every(time => time === 0) && value.some((time, index) => time !== initialValue[index])) {
    ms = ms < 100 ? 900 + ms : ms
    s = s === 0 && ms === 0 ? 0 : ((s * 1000) + ms) / 1000
  }

  const result = (hoursOn ? [ h, m, s ] : [ m, s ]).map(time => getTimeDateUnit(Math[direction < 0 ? 'ceil' : 'floor'](time), true)).join(':')
  if (msOn) return `${result}.${getTimeDateUnit(Math.floor(ms / 10), true)}`
  return result
}
