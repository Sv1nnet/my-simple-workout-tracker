const intersects = ([ startA, endA ], [ startB, endB ]) => (
  (endB > startA && endB < endA) ||
  (startB > startA && startB < endA) ||
  (startB < startA && endB > endA) ||
  (startB === startA && endB > endA) ||
  (startB === startA && endB < endA) ||
  (startB < startA && endB === endA) ||
  (startB > startA && endB === endA) ||
  (startB === startA && endB === endA)
)

export type Range = [number, number]

export class SegmentsRange {
  private _range: Range

  private _start: number

  private _end: number

  private _rangeSet: number[]

  private _get: (el: any) => Range

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

  intersects(segment: number | Range) {
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

  add(segment: number | Range) {
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

  private _convertToArray(segment: number | Range) {
    if (!Array.isArray(segment)) segment = [ segment, segment ]
    return segment
  }
}

export const recomposeSegments = (segments: Range[]) => {
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

export type IndexedRange = { index: number, segment: Range }

export const getIntersections = (segments: IndexedRange[]) => {
  const intersections = {}
  segments.forEach((segment, _index) => {
    if (!segments[_index + 1]) return

    for (let i = _index + 1; i < segments.length; i++) {
      const _segment = segments[i].segment

      const [ _start, _end ] = _segment
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

export const spreadSegments = (segments: Range[], { gap = 1, dir = DIRECTIONS.FORTH } = {}) => {
  segments = [ ...segments ]
  const _segments = segments.map<IndexedRange>((segment, index) => ({ index, segment })).sort((a, b) => a.segment[0] - b.segment[0])
  let intersections = {} as { [key: string]: Range }
  let c = 0
  do {
    intersections = getIntersections(_segments)
    for (let indexToMoveFrom in intersections) {
      const rangeToMoveFrom: { index: number, segment: Range } = _segments[indexToMoveFrom]
      const [ startOfRange, endOfRange ] = rangeToMoveFrom.segment

      for (let range of intersections[indexToMoveFrom]) {
        const [ _index, _range ] = range as unknown as Range
        const newRange: Range = dir === DIRECTIONS.FORTH 
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
    
    if (c >= 10000) {
      console.warn('endless loop')
      break
    }
  } while (Object.keys(intersections).length)

  return _segments.sort((a, b) => a.index - b.index).map(({ segment }) => segment)
}

export type RangeGetter<T = Range> = (segment: T) => Range
const rangeGetter: RangeGetter = (segment: Range) => segment

// move segments by (range size * coefficient)
export const shiftSegments = <S = Range>(
  segments: S[],
  {
    coefficient = .5,
    low = -Infinity,
    high = Infinity,
    getter = rangeGetter as RangeGetter<S>,
    returnResult = (range: Range, _initial: S, _adjusted: [boolean, boolean]) => range,
  } = {},
) => segments.map((segment, index) => {
  const [ start, end ] = getter(segment)
  const bias = (end - start) * coefficient

  let startAdjusted = false
  let endAdjusted = false

  let newStart = start - bias
  let newEnd = end - bias
  let diff = 0

  if (newStart < low) {
    diff = low - newStart
    newStart = newStart + diff
    newEnd = newEnd + diff

    startAdjusted = true
  }

  if (newEnd > high) {
    diff = newEnd - high
    newEnd = newEnd - diff
    newStart = newStart - diff

    startAdjusted = true
    endAdjusted = true

    if (startAdjusted && newStart < low) {
      const error: Error & {
        data?: {
          originalRange: Range,
          shiftedRange: Range,
          segment: S,
          adjusted: [boolean, boolean],
        }
      } = new Error(`Segment [${start}, ${end}] with index "${index}" is larger then low and high range [${low}, ${high}]`)
      error.data = {
        originalRange: [ start, end ],
        shiftedRange: [ newStart, newEnd ],
        segment,
        adjusted: [ startAdjusted, endAdjusted ],
      }

      throw error
    }
  }

  return returnResult([ newStart, newEnd ], segment, [ startAdjusted, endAdjusted ])
})
