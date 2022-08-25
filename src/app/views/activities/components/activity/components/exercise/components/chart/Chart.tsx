import styled from 'styled-components'
import * as d3 from 'd3'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ResultTexts, ResultDots } from './components'
import { HEADER_HEIGHT } from '../history/History'
const { curveMonotoneX } = d3

const SVGChart = styled.svg`
  position: absolute;
  left: 0;
  top: 23px;
`

export const COUNT_CELL_WIDTH = 50
export const COUNT_IN_CELL_OFFSET = COUNT_CELL_WIDTH / 2
export const EACH_SIDE_COUNT_CELL_WIDTH = 65
export const EACH_SIDE_COUNT_IN_CELL_OFFSET = EACH_SIDE_COUNT_CELL_WIDTH / 2
export const TIME_WITH_HOUR_CELL_WIDTH = 85
export const TIME_WITH_HOUR_IN_CELL_OFFSET = TIME_WITH_HOUR_CELL_WIDTH / 2
export const EACH_SIDE_TIME_WITH_HOUR_CELL_WIDTH = 105
export const EACH_SIDE_TIME_WITH_HOUR_IN_CELL_OFFSET = EACH_SIDE_TIME_WITH_HOUR_CELL_WIDTH / 2
export const EACH_SIDE_TIME_WITHOUT_HOUR_CELL_WIDTH = 85
export const EACH_SIDE_TIME_WITHOUT_HOUR_IN_CELL_OFFSET = EACH_SIDE_TIME_WITHOUT_HOUR_CELL_WIDTH / 2
export const TIME_WITHOUT_HOUR_CELL_WIDTH = 65
export const TIME_WITHOUT_HOUR_IN_CELL_OFFSET = TIME_WITHOUT_HOUR_CELL_WIDTH / 2

export const colors = [
  {
    line: '#5cbb5c',
    text: 'green',
  },
  {
    line: '#ff6565',
    text: 'red',
  },
  {
    line: '#7c7cff',
    text: 'blue',
  },
  {
    line: '#ff4bff',
    text: 'purple',
  },
  {
    line: '#abff00',
    text: '#8acd00',
  },
  {
    line: '#a5c5ff',
    text: '#2d78ff',
  },
  {
    line: '#ffb988',
    text: 'chocolate',
  },
  {
    line: '#41fcff',
    text: 'darkturquoise',
  },
  {
    line: '#c95f7b',
    text: '#d00037',
  },
  {
    line: '#7d7d7d',
    text: 'black',
  },
]

const DEFAULT_OPACITY = 1
const TEXT_GAP_BETWEEN_LOWEST_DOT_POINT_AND_BOTTOM_OF_CHART = 6.5
// If all the history values === 0 then the max value is 0
// and we need to set max any value (100 as exemple) to correctly
// display all zero values. Otherwise it would set chart height as 0
// and display all the values on the top of the chart and user would not see
// any value
const DEFAULT_MAX_HISTORY_VALUE = 100
export const TEXT_FONT_SIZE = 14

const renderLine = ({ dataToRender, handleFocus, opacities, eachSide, line, left, right }) => eachSide
  ? dataToRender.map((_, i) => (
    <React.Fragment key={'path_' + i}>
      <path
        data-index={i}
        onClick={handleFocus}
        fill="none"
        opacity={opacities[i]}
        stroke={colors[i].line}
        strokeWidth={2}
        d={line(right[i])} />
      <path
        data-index={i}
        onClick={handleFocus}
        fill="none"
        opacity={opacities[i]}
        stroke={colors[i].line}
        strokeWidth={2}
        d={line(left[i])}
      />
    </React.Fragment>
  ))
  : dataToRender.map((d, i) => (
    <path
      key={'path_' + i}
      data-index={i}
      onClick={handleFocus}
      fill="none"
      opacity={opacities[i]}
      stroke={colors[i].line}
      strokeWidth={2}
      d={line(d)}
    />
  ))

const renderDots = ({ dataToRender, handleFocus, opacities, eachSide, xScale, yScale, left, right }) => eachSide
  ? (
    <React.Fragment>
      <ResultDots
        dataToRender={right}
        xScale={xScale}
        yScale={yScale}
        colors={colors}
        onFocus={handleFocus}
        opacities={opacities}
      />
      <ResultDots
        dataToRender={left}
        xScale={xScale}
        yScale={yScale}
        colors={colors}
        onFocus={handleFocus}
        opacities={opacities}
      />
    </React.Fragment>
  )
  : (
    <ResultDots
      dataToRender={dataToRender}
      xScale={xScale}
      yScale={yScale}
      colors={colors}
      onFocus={handleFocus}
      opacities={opacities}
    />
  )

const renderTexts = ({ dataToRender, handleFocus, opacities, xScale, yScale, minY, hours, right, left, sideLabels, isTimeType }) => (
  <ResultTexts
    isTimeType={isTimeType}
    hours={hours}
    minY={minY}
    dataToRender={dataToRender}
    right={right}
    left={left}
    xScale={xScale}
    yScale={yScale}
    colors={colors}
    onFocus={handleFocus}
    opacities={opacities}
    sideLabels={sideLabels}
  />
) 

const Chart = ({ style, data, startIndex, endIndex, height, type, hours, eachSide, sideLabels, isTimeType, ...props }) => {
  const [ opacities, setOpacities ] = useState(() => new Array((data?.[0]?.results?.length ?? 0)).fill(DEFAULT_OPACITY))
  const [ fullOpacity, setFullOpacity ] = useState(null)

  const prevData = useRef(data)

  const [ , line, xScale, yScale, minY ] = useMemo(() => {
    const _data = eachSide 
      ? data.reduce((acc, d) => {
        acc.push({ ...d, results: d.results.map(r => r.right) })
        acc.push({ ...d, results: d.results.map(r => r.left) })
        return acc
      }, [])
      : data

    const _chartHeight = height - HEADER_HEIGHT - (TEXT_FONT_SIZE) - 3
    const _maxResult = (d3.max(_data.map(d => d3.max(d.results))) || DEFAULT_MAX_HISTORY_VALUE)
    const _minResult = d3.min(_data.map(d => d3.min(d.results)))
    const _minMaxDiff = (_maxResult - _minResult)

    const bringToPercent = value => 1 - ((value - _minResult) / (_minMaxDiff))

    const [ cellWidth, inCellOffset ] = isTimeType
      ? hours
        ? eachSide
          ? [ EACH_SIDE_TIME_WITH_HOUR_CELL_WIDTH, EACH_SIDE_TIME_WITH_HOUR_IN_CELL_OFFSET ]
          : [ TIME_WITH_HOUR_CELL_WIDTH, TIME_WITH_HOUR_IN_CELL_OFFSET ]
        : eachSide
          ? [ EACH_SIDE_TIME_WITHOUT_HOUR_CELL_WIDTH, EACH_SIDE_TIME_WITHOUT_HOUR_IN_CELL_OFFSET ]
          : [ TIME_WITHOUT_HOUR_CELL_WIDTH, TIME_WITHOUT_HOUR_IN_CELL_OFFSET ]
      : eachSide
        ? [ EACH_SIDE_COUNT_CELL_WIDTH, EACH_SIDE_COUNT_IN_CELL_OFFSET ]
        : [ COUNT_CELL_WIDTH, COUNT_IN_CELL_OFFSET ]
    
    const _xScale = ({ index }) => index * cellWidth + inCellOffset
    const _yScale = ({ results }) => (_chartHeight * bringToPercent(results)) + (TEXT_FONT_SIZE)

    const _minY = height - TEXT_GAP_BETWEEN_LOWEST_DOT_POINT_AND_BOTTOM_OF_CHART - TEXT_FONT_SIZE
  
    const _line = d3.line()
      .curve(curveMonotoneX)
      .x(_xScale)
      .y(_yScale)
    return [ _data, _line, _xScale, _yScale, _minY, _chartHeight, _minResult, _maxResult, _minMaxDiff ]
  }, [ data, type, hours ])

  const svgDefs = useMemo(() => (
    <defs>
      <filter id="shadow" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1 1" result="shadow"/>
        <feOffset dx="0" dy="0"/>
      </filter>
    </defs>
  ), [])

  const transpositionatedResults = useMemo(() => data.reduce(
    (prev, { results: next }) => next.map((_, i) => (prev[i] || []).concat(next[i])), [],
  ), [])

  const dataToRender = useMemo(() => transpositionatedResults
    .map(results => results
      .slice(startIndex, endIndex)
      .map((_results, _index) => ({ results: _results, index: startIndex + _index })))
    .reduce((acc, results, i) => {
      if (!acc[i]) acc[i] = []
      results.forEach(res => acc[i].push(res))
      return acc
    }, []), [ data, startIndex, endIndex ])

  const [ right, left ] = useMemo(() => eachSide
    ? [
      dataToRender.map(d => d.map(_d => ({ ..._d, results: _d.results.right, side: 'right' }))), 
      dataToRender.map(d => d.map(_d => ({ ..._d, results: _d.results.left, side: 'left' }))),
    ]
    : [ null, null ], [ eachSide, dataToRender ])

  const handleFocus = (e) => {
    setOpacities(() => {
      const turnAllOpacities = fullOpacity === e.target.dataset.index
      setFullOpacity(turnAllOpacities ? null : e.target.dataset.index)

      if (turnAllOpacities) {
        const _opacities = opacities.map(() => DEFAULT_OPACITY)
        return _opacities
      }

      const _opacities = opacities.map(() => .1)
      _opacities[e.target.dataset.index] = DEFAULT_OPACITY
      return _opacities
    })
  }

  useEffect(() => {
    if (!prevData.current) {
      setOpacities(new Array((data?.[0]?.results?.length ?? 0)).fill(DEFAULT_OPACITY))
    }
    prevData.current = data
  }, [ data ])
 
  return (
    <SVGChart xmlns="http://www.w3.org/2000/svg" key="svg-container" {...props} width={style.width} height={`calc(100% - ${HEADER_HEIGHT}px)`} viewBox={`0 0 ${style.width} ${height - HEADER_HEIGHT}`}>
      {svgDefs}
      {renderLine({ dataToRender, handleFocus, opacities, eachSide, line, left, right })}
      {renderDots({ dataToRender, handleFocus, opacities, eachSide, xScale, yScale, left, right })}
      {renderTexts({ dataToRender, handleFocus, opacities, xScale, yScale, minY, hours, isTimeType, right, left, sideLabels })}
    </SVGChart>
  )
}

export default Chart
