import styled from 'styled-components'
import * as d3 from 'd3'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { HEADER_HEIGHT } from '../history/History'
import isFunc from '@/src/app/utils/isFunc'
import {
  COUNT_CELL_WIDTH, COUNT_IN_CELL_OFFSET,
  DEFAULT_MAX_HISTORY_VALUE, DEFAULT_OPACITY,
  EACH_SIDE_COUNT_CELL_WIDTH, EACH_SIDE_COUNT_IN_CELL_OFFSET,
  EACH_SIDE_TIME_WITHOUT_HOUR_CELL_WIDTH,
  EACH_SIDE_TIME_WITHOUT_HOUR_IN_CELL_OFFSET,
  EACH_SIDE_TIME_WITH_HOUR_CELL_WIDTH,
  EACH_SIDE_TIME_WITH_HOUR_IN_CELL_OFFSET,
  TEXT_FONT_SIZE,
  TEXT_GAP_BETWEEN_LOWEST_DOT_POINT_AND_BOTTOM_OF_CHART,
  TIME_WITHOUT_HOUR_CELL_WIDTH,
  TIME_WITHOUT_HOUR_IN_CELL_OFFSET,
  TIME_WITH_HOUR_CELL_WIDTH,
  TIME_WITH_HOUR_IN_CELL_OFFSET,
  Lines,
  Dots,
  Texts,
} from './utils'

const { curveMonotoneX } = d3

const SVGChart = styled.svg`
  position: absolute;
  left: 0;
  top: 23px;
`


const Chart = ({ style, data, startIndex, endIndex, height, type, hours, eachSide, sideLabels, isTimeType, onResultClick, opacityIndex, setSelectedRoundIndex, ...props }) => {
  const [ opacities, setOpacities ] = useState(() => new Array((data?.[0]?.results?.length ?? 0)).fill(DEFAULT_OPACITY))
  const [ fullOpacityIndex, setFullOpacityIndex ] = useState<string | null>(opacityIndex ?? null)

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

  const getResultsOpacity = (event) => {
    let turnAllOpacities = false
    let index = event

    if (typeof event !== 'string' && event !== null) {
      index = event.target.dataset.index
    }

    turnAllOpacities = fullOpacityIndex === index || index === null

    const _fullOpacityIndex = turnAllOpacities ? null : index
    setFullOpacityIndex(_fullOpacityIndex)

    if (turnAllOpacities) {
      const _opacities = opacities.map(() => DEFAULT_OPACITY)

      return {
        opacities: _opacities,
        fullOpacityIndex: _fullOpacityIndex,
      }
    }

    const _opacities = opacities.map(() => .1)
    _opacities[index] = DEFAULT_OPACITY

    return {
      opacities: _opacities,
      fullOpacityIndex: _fullOpacityIndex,
    }
  }

  const handleFocus = (e) => {
    if (isFunc(onResultClick)) onResultClick(e)
    const result = getResultsOpacity(e)
    setSelectedRoundIndex(result.fullOpacityIndex)
    setOpacities(result.opacities)
  }

  useEffect(() => {
    if (!prevData.current) {
      setOpacities(new Array((data?.[0]?.results?.length ?? 0)).fill(DEFAULT_OPACITY))
    }
    prevData.current = data
  }, [ data ])

  useEffect(() => {
    if (opacityIndex !== undefined && opacityIndex !== fullOpacityIndex) {
      setOpacities(getResultsOpacity(opacityIndex).opacities)
    }
  }, [ opacityIndex ])

  useEffect(() => () => { setSelectedRoundIndex(null) }, [])
 
  return (
    <SVGChart xmlns="http://www.w3.org/2000/svg" key="svg-container" {...props} width={style.width} height={`calc(100% - ${HEADER_HEIGHT}px)`} viewBox={`0 0 ${style.width} ${height - HEADER_HEIGHT}`}>
      {svgDefs}
      <Lines
        line={line}
        eachSide={eachSide}
        left={left}
        right={right}
        dataToRender={dataToRender}
        onFocus={handleFocus}
        opacities={opacities}
      />
      <Dots
        eachSide={eachSide}
        left={left}
        right={right}
        dataToRender={dataToRender}
        xScale={xScale}
        yScale={yScale}
        onFocus={handleFocus}
        opacities={opacities}
      />
      <Texts
        isTimeType={isTimeType}
        hours={hours}
        minY={minY}
        dataToRender={dataToRender}
        right={right}
        left={left}
        xScale={xScale}
        yScale={yScale}
        onFocus={handleFocus}
        opacities={opacities}
        sideLabels={sideLabels}
      />
    </SVGChart>
  )
}

export default Chart
