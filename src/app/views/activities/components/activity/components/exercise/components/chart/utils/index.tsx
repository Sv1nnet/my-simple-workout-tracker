import React from 'react'
import { ResultDots, ResultTexts } from '../components'

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

export const DEFAULT_OPACITY = 1
export const TEXT_GAP_BETWEEN_LOWEST_DOT_POINT_AND_BOTTOM_OF_CHART = 6.5
// If all the history values === 0 then the max value is 0
// and we need to set max any value (100 as exemple) to correctly
// display all zero values. Otherwise it would set chart height as 0
// and display all the values on the top of the chart and user would not see
// any value
export const DEFAULT_MAX_HISTORY_VALUE = 100
export const TEXT_FONT_SIZE = 14

export const Lines = ({ dataToRender, onFocus, opacities, eachSide, line, left, right }) => eachSide
  ? dataToRender.map((_, i) => (
    <React.Fragment key={'path_' + i}>
      <path
        data-index={i}
        onClick={onFocus}
        fill="none"
        opacity={opacities[i]}
        stroke={colors[i].line}
        strokeWidth={2}
        d={line(right[i])} />
      <path
        data-index={i}
        onClick={onFocus}
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
      onClick={onFocus}
      fill="none"
      opacity={opacities[i]}
      stroke={colors[i].line}
      strokeWidth={2}
      d={line(d)}
    />
  ))

export const Dots = ({ dataToRender, onFocus, opacities, eachSide, xScale, yScale, left, right }) => eachSide
  ? (
    <React.Fragment>
      <ResultDots
        dataToRender={right}
        xScale={xScale}
        yScale={yScale}
        colors={colors}
        onFocus={onFocus}
        opacities={opacities}
      />
      <ResultDots
        dataToRender={left}
        xScale={xScale}
        yScale={yScale}
        colors={colors}
        onFocus={onFocus}
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
      onFocus={onFocus}
      opacities={opacities}
    />
  )

export const Texts = ({ dataToRender, onFocus, opacities, xScale, yScale, minY, hours, right, left, sideLabels, isTimeType }) => (
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
    onFocus={onFocus}
    opacities={opacities}
    sideLabels={sideLabels}
  />
)