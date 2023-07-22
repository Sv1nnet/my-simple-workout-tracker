import styled from 'styled-components'
import React from 'react'
import Chart from '../../../chart/Chart'
import Header from '../../../history_item_header/HistoryItemHeader'
import { Body } from '../../../history_item_body/components/styled'

export const Container = styled.div`
  width: 100%;
  position: relative;
  margin-left: 10px;
  margin-right: 10px;
`

export const ItemContainer = styled.div<{ $last?: boolean }>`
  text-align: center;
  overflow-y: hidden;
  &:last-of-type ${Header}, &:last-of-type ${Body} {
    border-right: none;
  }
  &:after {
    content: '';
    display: ${({ $last }) => $last ? 'none' : 'block'};
    width: 1px;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: lightgrey;
  }
`

export const HistoryLoader = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
`

export const ListContainer = React.memo(React.forwardRef<React.HTMLAttributes<HTMLDivElement>, any>(function ListContainer({
  children,
  sideLabels,
  showChart,
  style,
  data,
  startIndex,
  endIndex,
  hours,
  eachSide,
  type,
  height,
  isTimeType,
  onResultClick,
  opacityIndex,
  containerProps,
  ...props
}, ref) {
  return (
    <div {...containerProps} style={style} ref={ref}>
      {children}
      {showChart && (
        <Chart
          {...props}
          type={type}
          opacityIndex={opacityIndex}
          isTimeType={isTimeType}
          height={height}
          hours={hours}
          style={style}
          data={data}
          onResultClick={onResultClick}
          startIndex={startIndex}
          endIndex={endIndex}
          eachSide={eachSide}
          sideLabels={sideLabels}
        />
      )}
    </div>
  )
}))