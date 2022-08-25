import { useMemo, useRef } from 'react'
import styled from 'styled-components'
import { SegmentsRange, spreadSegments, DIRECTIONS } from 'app/utils/range'
import { timeToHms } from '@/src/app/utils/time'

const TextShadow = styled.text`
  filter: url(#shadow);
  fill: white;
  font-weight: 600;
`

export const TEXT_HEIGHT = 10

export const ResultTexts = ({ dataToRender: _dataToRender, left, right, minY, xScale, yScale, colors, onFocus, opacities, isTimeType, hours, sideLabels }) => {
  const cachedDataToRender = useRef([])
  const dataToRender = useMemo(() => {
    const getter = segment => segment.range

    const bothSides = left && right ? [ ...right, ...left ] : _dataToRender

    const startIndex = _dataToRender?.[0]?.[0]?.index ?? 0
    const endIndex = _dataToRender?.[0]?.[(_dataToRender[0]?.length ?? 1) - 1]?.index ?? 0

    const isDataCached = !!(cachedDataToRender.current[startIndex] && cachedDataToRender.current[endIndex])

    const uniteIntersections = rawSegments => rawSegments.reduce((acc, res) => {
      if (!acc) return [ new SegmentsRange(res, getter) ]
      const indexOfIntersectingSegment = acc.findIndex(_seg => _seg.intersects(res.range))

      if (indexOfIntersectingSegment === -1) {
        acc.push(new SegmentsRange(res, getter))
      } else {
        acc[indexOfIntersectingSegment].add(res)
      }
      
      return acc
    }, null)

    const adjustText = dir => (rawSegments) => {
      // converting data to segments and uniting
      rawSegments = uniteIntersections(rawSegments)

      let rawRanges = rawSegments.map(_sr => _sr.ranges).flat(1)
      let spreaded = spreadSegments(rawRanges.map(range => range.range), { dir, gap: 3 })
        .sort((a, b) => a[0] - b[0])

      rawRanges = rawRanges.sort((a, b) => b.results - a.results)
      rawSegments = spreaded.map((range, i) => ({ ...rawRanges[i], range }))

      const shiftedRawSegments = rawSegments.map((segment) => {
        const [ start, end ] = segment.range
        const diff = minY - (end - TEXT_HEIGHT)

        if (diff < 0) {
          segment.range[0] = start + diff
          segment.range[1] = end + diff
        }
        return segment
      })
      return shiftedRawSegments.sort((a, b) => a.round - b.round)
    }

    /*
    [ 1, 2, 3]     [ 1, 4, 7 ]
    [ 4, 5, 6] --> [ 2, 5, 8 ]
    [ 7, 8, 9]     [ 3, 6, 9 ]
    */
    const textMatrixTransposition = matrix => matrix.reduce((prev, next) => next.map((_, i) => (prev[i] || []).concat(next[i])), [])

    if (isDataCached) {
      return textMatrixTransposition(cachedDataToRender.current.slice(startIndex, endIndex + 1))
    }

    let result = bothSides
      .map((d, round) => d.map(({ results, index, side }) => {
        const y = yScale({ results })
        return {
          y,
          x: xScale({ index }),
          results,
          index,
          round,
          side,
        }
      }))
      .reduce((acc, d, round, arr) => {
        d.forEach((res, i) => {
          if (!acc[i]) acc[i] = []
          acc[i].push({
            ...res,
            range: [ arr[round][i].y, arr[round][i].y + TEXT_HEIGHT ],
          })
        })
        return acc
      }, [])
      .map(adjustText(DIRECTIONS.FORTH))
      .map(adjustText(DIRECTIONS.BACK))
      
    if (isTimeType) {
      result = result.map(res => res.map(r => ({
        ...r,
        results: timeToHms(r.results, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours }),
      })))
    }

    result.forEach(res => cachedDataToRender.current[res[0].index] = res)
    return textMatrixTransposition(result)
  }, [ _dataToRender ])

  return dataToRender.map((d, round) => {
    const _round = left || right ? round % _dataToRender.length : round

    return d.map(({ results, range, x, index, side }) => {
      const [ y ] = range
      const prefix = side ? sideLabels[side].short : null
      return (
        <g key={`text_${_round}_${index}`} transform={`translate(${x}, ${y})`}>
          <TextShadow
            data-index={_round}
            onClick={onFocus}
            y="-4"
            opacity={opacities[_round]}
            textAnchor="middle"
            fill={colors[_round].text}
          >
            {prefix ? `${prefix}: ${results}` : results}
          </TextShadow>
          <text
            data-index={_round}
            onClick={onFocus}
            fontWeight={600}
            y="-4"
            opacity={opacities[_round]}
            textAnchor="middle"
            fill={colors[_round].text}
          >
            {prefix ? `${prefix}: ${results}` : results}
          </text>
        </g>
      )
    })
  })
}

export const ResultDots = ({ dataToRender, xScale, yScale, colors, onFocus, opacities }) => dataToRender.map((d, i) => d.map(({ results, index }) => (
  <g key={`circle_${i}_${index}`} transform={`translate(${xScale({ index })}, ${yScale({ results })})`}>
    <circle data-index={i} onClick={onFocus} fill={colors[i].line} cx={0} cy={0} r="2" opacity={opacities[i]} stroke={colors[i].line} strokeWidth={2} />
  </g>
)))
