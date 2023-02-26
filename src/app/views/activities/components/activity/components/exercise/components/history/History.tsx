import { HistoryItemHeader, HistoryItemBody } from '..'
import { getTimeDateUnit } from 'app/utils/time'
import { VirtualList } from 'app/components'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  COUNT_CELL_WIDTH,
  EACH_SIDE_COUNT_CELL_WIDTH,
  TIME_WITHOUT_HOUR_CELL_WIDTH,
  TIME_WITH_HOUR_CELL_WIDTH,
  EACH_SIDE_TIME_WITHOUT_HOUR_CELL_WIDTH,
  EACH_SIDE_TIME_WITH_HOUR_CELL_WIDTH,
} from 'app/views/activities/components/activity/components/exercise/components/chart/Chart'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { getComparator } from 'app/views/activities/components/activity/utils'
import { Container, HistoryLoader, ItemContainer, ListContainer } from './compoents/styled'

const RESULT_HEIGHT = 22
const EACH_SIDE_RESULT_HEIGHT = 36
const MIN_LIST_HEIGHT = 120
const LIST_OFFSET = 130

export const HEADER_HEIGHT = 23

const History = ({ loaderDictionary, isLoading, exerciseRef, history: _history, rounds, total, mode, type, hours, eachSide, isTimeType }) => {
  const [ width, setWidth ] = useState(() => exerciseRef.current ? exerciseRef.current - LIST_OFFSET : window.innerWidth - LIST_OFFSET)
  const { side_labels } = useIntlContext().intl.pages.activities

  const [ history, lastHistoryItem ] = useMemo(() => {
    if (isLoading) return [ null, null ]

    const hist = [ ..._history ]
    const _lastHistoryItem = hist.length < 31 ? hist[hist.length - 1] : hist.pop()
    return [ hist, _lastHistoryItem ]
  }, [ isLoading, _history ])

  const $vList = useRef(null)

  const resultHeight = eachSide ? EACH_SIDE_RESULT_HEIGHT : RESULT_HEIGHT
  const listHeight = (history ?? []).length ? (rounds * resultHeight) + HEADER_HEIGHT : 0

  const comparator = getComparator(type)

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
          sideLabels={side_labels}
          comparator={comparator}
          isTimeType={isTimeType}
        />
      )
    },
  ), [ mode, side_labels, history, isTimeType ])

  const getNextRoundData = (index) => {
    if (index !== 0 && (index + 1) % 30 === 0) {
      return lastHistoryItem?.results
    } 
    return history[index + 1]?.results
  }

  useEffect(() => {
    const updateListWidth = () => setWidth(exerciseRef.current.offsetWidth - LIST_OFFSET)
    updateListWidth()

    window.addEventListener('resize', updateListWidth)
    return () => window.removeEventListener('resize', updateListWidth)
  }, [])

  return (
    <Container>
      {isLoading || !history
        ? <HistoryLoader>{loaderDictionary.history_loading}</HistoryLoader>
        : (
          <VirtualList
            ref={$vList}
            orientation="horizontal"
            height={listHeight > MIN_LIST_HEIGHT ? listHeight : MIN_LIST_HEIGHT}
            itemWidth={isTimeType
              ? hours
                ? eachSide
                  ? EACH_SIDE_TIME_WITH_HOUR_CELL_WIDTH
                  : TIME_WITH_HOUR_CELL_WIDTH
                : eachSide
                  ? EACH_SIDE_TIME_WITHOUT_HOUR_CELL_WIDTH
                  : TIME_WITHOUT_HOUR_CELL_WIDTH
              : eachSide
                ? EACH_SIDE_COUNT_CELL_WIDTH
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
                  {`${getTimeDateUnit(historyItem.date.date(), true)}.${getTimeDateUnit(historyItem.date.month() + 1, true)}`}
                </HistoryItemHeader>
                {mode === 'table' && (
                  <HistoryItemBody
                    isTimeType={isTimeType}
                    hours={hours}
                    nextRoundsData={getNextRoundData(index)}
                    roundsData={historyItem.results}
                    eachSide={eachSide}
                    total={total}
                    index={index}
                    sideLabels={side_labels}
                    comparator={comparator}
                  />
                )}
              </>
            )}
          </VirtualList>
        )}
    </Container>
  )
}

export default History
