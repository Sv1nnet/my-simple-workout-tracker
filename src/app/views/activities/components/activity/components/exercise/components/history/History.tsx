import styled from 'styled-components'
import { HistoryItemHeader, HistoryItemBody, Chart } from '..'
import { Header } from '../history_item_header/HistoryItemHeader'
import { Body } from '../history_item_body/HistoryItemBody'
import { getTimeDateUnit } from 'app/utils/time'
import { VirtualList } from 'app/components'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { COUNT_CELL_WIDTH, TIME_WITHOUT_HOUR_CELL_WIDTH, TIME_WITH_HOUR_CELL_WIDTH } from '../chart/Chart'

const Container = styled.div`
  /* display: flex; */
  position: relative;
  margin-left: 10px;
  margin-right: 10px;
`

const ItemContainer = styled.div`
  text-align: center;
  /* max-width: 50px; */
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

const ListContainer = React.memo(React.forwardRef<{}, any>(function ListContainer({ children, showChart, style, data, startIndex, endIndex, hours, eachSide, ...props }, ref) {
  return (
    <div {...props} style={style} ref={ref}>
      {children}
      {showChart && <Chart {...props} hours={hours} style={style} data={data} startIndex={startIndex} endIndex={endIndex} eachSide={eachSide} />}
    </div>
  )
}))

const RESULT_HEIGHT = 22
const EACH_SIDE_RESULT_HEIGHT = 36
export const HEADER_HEIGHT = 23
const MIN_LIST_HEIGHT = 120
const LIST_OFFSET = 130

const History = ({ exerciseRef, history: _history, rounds, total, mode, type = 'count', hours = false, eachSide, exerciseId }) => {
  const [ width, setWidth ] = useState(() => exerciseRef.current ? exerciseRef.current - LIST_OFFSET : window.innerWidth - LIST_OFFSET)
  const [ history, lastHistoryItem ] = useMemo(() => {
    const hist = [ ..._history ]
    const _lastHistoryItem = hist.length < 31 ? hist[hist.length - 1] : hist.pop()
    return [ hist, _lastHistoryItem ]
  }, [ _history ])

  const $vList = useRef(null)

  const resultHeight = eachSide ? EACH_SIDE_RESULT_HEIGHT : RESULT_HEIGHT
  const listHeight = (rounds * resultHeight) + HEADER_HEIGHT

  const ListComponent = useMemo(() => React.forwardRef(
    function _ListComponent(props, ref) {
      return (
        <ListContainer
          {...props}
          ref={ref}
          data={history}
          type={type}
          hours={hours}
          height={listHeight > MIN_LIST_HEIGHT ? listHeight : MIN_LIST_HEIGHT}
          showChart={mode === 'chart'}
          eachSide={eachSide}
        />
      )
    },
  ), [ mode ])

  const getNextRoundData = (index) => {
    if (index !== 0 && (index + 1) % 30 === 0) {
      return lastHistoryItem?.[1]?.results
    } 
    return history[index + 1]?.[1]?.results
  }

  useEffect(() => {
    const updateListWidth = () => setWidth(exerciseRef.current.offsetWidth - LIST_OFFSET)
    updateListWidth()

    window.addEventListener('resize', updateListWidth)
    return () => window.removeEventListener('resize', updateListWidth)
  }, [])

  return (
    <Container>
      <VirtualList
        ref={$vList}
        orientation="horizontal"
        height={listHeight > MIN_LIST_HEIGHT ? listHeight : MIN_LIST_HEIGHT}
        itemWidth={type === 'time'
          ? hours
            ? TIME_WITH_HOUR_CELL_WIDTH
            : TIME_WITHOUT_HOUR_CELL_WIDTH
          : COUNT_CELL_WIDTH}
        width={width}
        data={history}
        overscanCount={8}
        listComponent={ListComponent}
        itemContainerRenderer={({ style, index, children, key }) => <ItemContainer key={key} $last={index === history.length - 1} style={style}>{children}</ItemContainer>}
      >
        {(historyItem, index) => (
          <>
            <HistoryItemHeader>
              {`${getTimeDateUnit(historyItem[1].date.date(), true)}.${getTimeDateUnit(historyItem[1].date.month() + 1, true)}`}
            </HistoryItemHeader>
            {mode === 'table' && (
              <HistoryItemBody
                type={type}
                hours={hours}
                nextRoundsData={getNextRoundData(index)}
                roundsData={historyItem[1].results}
                eachSide={eachSide}
                total={total}
                index={index}
              />
            )}
          </>
        )}
      </VirtualList>
    </Container>
  )
}

export default History
