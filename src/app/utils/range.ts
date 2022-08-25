const __RANGE__ = Symbol('range')
const __START__ = Symbol('start')
const __END__ = Symbol('end')
const __RANGE_SET__ = Symbol('range_set')
const __ADD_RANGES__ = Symbol('add_ranges')

const intersects = ([ start, end ], [ _start, _end ]) => (
  (_end > start && _end < end) ||
  (_start > start && _start < end) ||
  (_start < start && _end > end) ||
  (_start === start && _end > end) ||
  (_start === start && _end < end) ||
  (_start < start && _end === end) ||
  (_start > start && _end === end) ||
  (_start === start && _end === end)
)

export class SegmentsRange {
  private _range: [number, number]

  private _start: number

  private _end: number

  private _rangeSet: number[]

  private _get: (el: any) => [number, number]

  private _set: (range: [number, number]) => void

  constructor(initial, getter = function rangeGetter(range) { return range }) {
    this.range = [ ...this._convertToArray(getter(initial)) ]
    this._addRanges(initial)
    this._get = getter
  }

  set range(value) {
    this._range = value
    this._start = value[0]
    this._end = value[1]
  }

  get range() {
    return this._range
  }

  private _addRanges(range) {
    if (!this._rangeSet) this._rangeSet = []
    this._rangeSet.push(range)
  }

  get ranges() {
    return this._rangeSet
  }

  set start(value) {
    this._range[0] = value
    this._start = value
  }

  get start() {
    return this._start
  }

  set end(value) {
    this._range[1] = value
    this._end = value
  }

  get end() {
    return this._end
  }

  intersects(segment: number | [number, number]) {
    segment = this._convertToArray(segment)
    return intersects(this.range, segment)
  }

  unite(segmentsRange: SegmentsRange) {
    if (!this.intersects([ segmentsRange.start, segmentsRange.end ])) return false

    const ranges = segmentsRange.ranges
    ranges.forEach((range) => {
      if (this.ranges.findIndex(_range => _range === range) !== -1) return
      this.add(range)
    })
    return true
  }

  add(segment: number | [number, number]) {
    const _segment = this._convertToArray(this._get(segment))

    const [ start, end ] = this.range
    const [ _start, _end ] = _segment

    if (this.intersects(_segment)) {
      if (_start < start) this.range[0] = _start
      if (_end > end) this.range[1] = _end
      this.range = this.range
      this._addRanges(segment)
    }

    return this
  }

  private _convertToArray(segment: number | [number, number]) {
    if (!Array.isArray(segment)) segment = [ segment, segment ]
    return segment
  }
}

export const recomposeSegments = (segments: [number, number][]) => {
  if (!segments.length) return []

  return segments
    .reduce((acc, segment) => {
      let rangeWithIntersection = null

      acc.forEach((_range) => {
        if (_range?.intersects(segment)) rangeWithIntersection = _range
      })

      if (rangeWithIntersection) rangeWithIntersection.add(segment)
      else acc.push(new SegmentsRange(segment))

      return acc
    }, [])
}

export const getIntersections = (segments: [number, number][] | { index: number, segment: [number, number] }[]) => {
  const intersections = {}
  segments.forEach((segment, _index) => {
    if (!segments[_index + 1]) return

    for (let i = _index + 1; i < segments.length; i++) {
      const _segment = Array.isArray(segments[i])
        ? segments[i] as [number, number]
        : (segments[i] as { index: number, segment: [number, number] }).segment
      const [ _start, _end ] = _segment
      // debugger
      const hasIntersection = intersects(segment.segment, _segment)

      if (hasIntersection) {
        if (!intersections[_index]) intersections[_index] = []
        intersections[_index].push([ i, [ _start, _end ] ])
      }
    }
  })

  return intersections
}

export const DIRECTIONS = {
  FORTH: 'forth',
  BACK: 'back',
}
let c = 0
export const spreadSegments = (segments: [number, number][], { gap = 1, dir = DIRECTIONS.FORTH } = {}) => {
  segments = [ ...segments ]
  const _segments = segments.map((segment, index) => ({ index, segment })).sort((a, b) => a.segment[0] - b.segment[0])
  let intersections = {} as { [key: string]: [number, number] }
  c = 0
  do {
    intersections = getIntersections(_segments)
    for (let indexToMoveFrom in intersections) {
      const rangeToMoveFrom: { index: number, segment: [number, number] } = _segments[indexToMoveFrom]
      const [ startOfRange, endOfRange ] = rangeToMoveFrom.segment

      for (let range of intersections[indexToMoveFrom]) {
        const [ _index, _range ] = range as unknown as [number, number]
        const newRange: [number, number] = dir === DIRECTIONS.FORTH 
          ? [
            endOfRange + gap,
            endOfRange + (_range[1] - _range[0]) + gap,
          ]
          : [
            startOfRange - (_range[1] - _range[0]) - gap,
            startOfRange - gap,
          ]
        _segments[_index].segment = newRange
      }
      break
    }
    c++

    if (c >= 500) {
      debugger
    }
    
    if (c >= 10000) {
      console.warn('endless loop')
      break
    }
  } while (Object.keys(intersections).length)

  return _segments.sort((a, b) => a.index - b.index).map(({ segment }) => segment)
}

export const shiftSegments = (
  segments,
  {
    coefficient = .5,
    low = -Infinity,
    high = Infinity,
    getter = segment => segment,
    returnResult = (range, _initial, _adjusted) => range,
  } = {},
) => segments.map((segment, index) => {
  const [ start, end ] = getter(segment)
  const bias = (end - start) * coefficient

  let startAdjusted = false
  let endAdjusted = false

  let _start = start - bias
  let _end = end - bias
  let diff = 0

  if (_start < low) {
    diff = low - _start
    _start = _start + diff
    _end = _end + diff

    startAdjusted = true
  }

  if (_end > high) {
    diff = _end - high
    _end = _end - diff
    _start = _start - diff

    startAdjusted = true
    endAdjusted = true

    if (startAdjusted && _start < low) {
      const error: Error & {
        data?: {
          originalRange: [number, number],
          shiftedRange: [number, number],
          segment: any,
          adjusted: [boolean, boolean],
        }
      } = new Error(`Segment [${segment[0]}, ${segment[1]}] with index "${index}" is larger then low and high range [${low}, ${high}]`)
      error.data = {
        originalRange: [ start, end ],
        shiftedRange: [ _start, _end ],
        segment,
        adjusted: [ startAdjusted, endAdjusted ],
      }

      throw error
    }
  }

  return returnResult([ _start, _end ], segment, [ startAdjusted, endAdjusted ])
})
