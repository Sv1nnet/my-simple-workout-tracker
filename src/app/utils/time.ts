import dayjs, { Dayjs, UnitType } from 'dayjs'

export const getTimeDateUnit = (t: number, leadingZero?: boolean) => {
  if (leadingZero) return t > 9 ? t : `0${t}`
  return `${t}`
}

export const timeArrayToDayjs = (time: [number, number, number]) => [ 'h', 'm', 's' ].reduce((d, t, i) => d.set(t as UnitType, time[i]), dayjs())

export const secondsToDayjs = (seconds: number) => {
  const h = Math.floor((seconds as number) / (60 * 60))
  const m = Math.floor(((seconds as number) - 3600 * h) / 60)
  const s = (seconds as number) - (m * 60) - (h * 60 * 60)
  return timeArrayToDayjs([ h, m, s ])
}

export const dayjsToTimeArray = (date: Dayjs) => [ date.hour(), date.minute(), date.second(), date.millisecond() ]

export const dayjsToSeconds = (date: Dayjs) => {
  const [ h, m, s ] = dayjsToTimeArray(date)
  return s + (m * 60) + (h * 60 * 60)
}

export const secondsToTimeArray = (seconds: number) => {
  const h = Math.floor(seconds / (60 * 60))
  const m = Math.floor((seconds - 3600 * h) / 60)
  const s = seconds - (m * 60) - (h * 60 * 60)
  return [ h, m, s ]
}

export const millisecondsToTimeArray = (milliseconds: number) => {
  let [ h, m, s ] = secondsToTimeArray(milliseconds / 1000)
  s = Math.floor(s)
  const ms = milliseconds - (s * 1000) - (m * 60 * 1000) - (h * 60 * 60 * 1000)
  return [ h, m, s, ms ]
}

export const SECONDS_IN_MINUTE = 60
export const MINUTES_IN_HOUR = 60
export const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * MINUTES_IN_HOUR

export const timeArrayToSeconds = (timeArray: number[]) => {
  let [ h, m, s, ms ] = [ 0, 0, 0, 0 ]

  switch (timeArray.length) {
    case 4:
      [ h, m, s, ms ] = timeArray
      break
    case 3:
      [ h, m, s ] = timeArray
      break
    case 2:
      [ m, s ] = timeArray
      break
    case 1:
      [ s ] = timeArray
      break
    default:
      console.warn(`Incorrect argument format: timeArray.length should be more then 0 and less then 4 but got ${timeArray.length}`)
      return 0
  }

  const secondsOver59 = s - SECONDS_IN_MINUTE
  if (secondsOver59 >= 0) {
    const extraMinutes = Math.ceil(secondsOver59 / SECONDS_IN_MINUTE)
    m += extraMinutes
    s -= (extraMinutes * SECONDS_IN_MINUTE)
  }

  const minutesOver59 = m - MINUTES_IN_HOUR
  if (minutesOver59 >= 0) {
    const extraHours = Math.ceil(minutesOver59 / MINUTES_IN_HOUR)
    h += extraHours
    m -= (extraHours * MINUTES_IN_HOUR)
  }

  ms = ms / 1000

  return (h * 60 * 60) + (m * 60) + s + (ms / 1000)
}

export const timeArrayToMilliseconds = (timeArray: number[]) => {
  let [ h, m, s, ms ] = [ 0, 0, 0, 0 ]

  switch (timeArray.length) {
    case 4:
      [ h, m, s, ms ] = timeArray
      break
    case 3:
      [ m, s, ms ] = timeArray
      break
    case 2:
      [ s, ms ] = timeArray
      break
    case 1:
      [ ms ] = timeArray
      break
    default:
      console.warn(`Incorrect argument format: timeArray.length should be more then 0 and less then 5 but got ${timeArray.length}`)
      return 0
  }

  const seconds = timeArrayToSeconds([ h, m, s ])


  return ms + (seconds * 1000)
}

export const timeToHms = (
  time: number | Dayjs | string | number[],
  {
    hms = [ 'h', 'm', 's' ],
    zeroIncluded = false,
    leadingZero = false,
    cutHours = false,
  }: {
    hms: [string, string, string] | ':',
    zeroIncluded?: boolean,
    leadingZero?: boolean,
    cutHours?: boolean,
  } = { hms: [ 'h', 'm', 's' ] },
): string => {
  let _time: number | Dayjs | string | number[] = time
  if (typeof time === 'object') {
    _time = dayjsToTimeArray(time as Dayjs)
  } else if (typeof time === 'number') {
    _time = secondsToTimeArray(time)
  }

  if (Array.isArray(_time)) {
    const getNonZeroTimeUnit = (t: number, postfix: string) => {
      const res = t > 0
        ? `${getTimeDateUnit(t, false)}${postfix}`
        : ''
      return res
    }

    const [ h, m, s ] = _time
    
    if (hms === ':') {
      return zeroIncluded
        ? cutHours
          ? `${getTimeDateUnit(m, leadingZero)}:${getTimeDateUnit(s, leadingZero)}`
          : `${getTimeDateUnit(h, leadingZero)}:${getTimeDateUnit(m, leadingZero)}:${getTimeDateUnit(s, leadingZero)}`
        : [ !cutHours && getNonZeroTimeUnit(h, ''), getNonZeroTimeUnit(m, ''), getNonZeroTimeUnit(s, '') ].filter(Boolean).join(':')  
    }

    return zeroIncluded
      ? cutHours
        ? `${getTimeDateUnit(m, leadingZero)}m ${getTimeDateUnit(s, leadingZero)}s`
        : `${getTimeDateUnit(h, leadingZero)}h ${getTimeDateUnit(m, leadingZero)}m ${getTimeDateUnit(s, leadingZero)}s`
      : [ !cutHours && getNonZeroTimeUnit(h, hms[0]), getNonZeroTimeUnit(m, hms[1]), getNonZeroTimeUnit(s, hms[2]) ].filter(Boolean).join(' ')
  }
  
  console.warn(`Wrong time argument format in timeToHms. Type of time: ${typeof time}`)
  return ''
}

export const timeTypes = [ 'time', 'time_distance', 'time_repeats', 'duration' ]
export const isExerciseTimeType = (type: string) => timeTypes.includes(type)