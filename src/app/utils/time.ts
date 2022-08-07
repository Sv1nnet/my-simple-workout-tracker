import dayjs, { Dayjs, UnitType } from 'dayjs'

export const getTimeDateUnit = (t: number, leadingZero?: boolean) => {
  if (leadingZero) return t > 9 ? t : `0${t}`
  return `${t}`
}

export const timeArrayToDayjs = (time: [number, number, number]) => [ 'h', 'm', 's' ].reduce((d, t, i) => d.set(t as UnitType, time[i]), dayjs())

export const timeToDayjs = (time: number) => {
  const h = Math.floor((time as number) / (60 * 60))
  const m = Math.floor(((time as number) - 3600 * h) / 60)
  const s = (time as number) - (m * 60) - (h * 60 * 60)
  return timeArrayToDayjs([ h, m, s ])
}

export const dayjsToTimeArray = (date: Dayjs) => [ date.hour(), date.minute(), date.second() ]

export const dayjsToSeconds = (date: Dayjs) => {
  const [ h, m, s ] = [ date.hour(), date.minute(), date.second() ]
  return s + (m * 60) + (h * 60 * 60)
}

export const secondsToTimeArray = (seconds: number) => {
  const h = Math.floor(seconds / (60 * 60))
  const m = Math.floor((seconds - 3600 * h) / 60)
  const s = seconds - (m * 60) - (h * 60 * 60)
  return [ h, m, s ]
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
