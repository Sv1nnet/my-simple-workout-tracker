import { useMemo } from 'react'
import { PreviousItem } from '..'
import { PreviousItemContainer, PreviousLoader, StyledTd, StyledTr } from './components/styled'
import { dayjsToSeconds } from 'app/utils/time'

const convertToHistoryItem = item => item !== undefined && item !== null && item !== '' ? dayjsToSeconds(item) : item

const PreviousRoundsHistory = ({ current = [], isLoading, history: _history, comparator, loaderDictionary, eachSide, isTimeType, hours }) => {
  const history = useMemo(() => _history?.map((result, i) => [
    isTimeType
      ? eachSide
        ? {
          right: convertToHistoryItem(current[i]?.right),
          left: convertToHistoryItem(current[i]?.left),
        }
        : convertToHistoryItem(current[i])
      : current[i],
    ...result,
  ]), [ _history, current ])

  return (isLoading || !_history)
    ? <PreviousLoader>{loaderDictionary.previous_loading}</PreviousLoader>
    : (
      <table>
        <tbody>
          {history.map((previous, index) => eachSide
            ? (previous ?? []).length < 6
              ? (
                <StyledTr $eachSide key={index}>
                  {previous.map((el, i, arr) => (
                    <StyledTd $eachSide key={i}>
                      <PreviousItemContainer $isTimeType={isTimeType} $eachSide key={i}>
                        <PreviousItem
                          omitValue={i === 0}
                          comparator={comparator}
                          curr={el?.right}
                          prev={arr[i + 1]?.right}
                          isTimeType={isTimeType}
                          hours={hours}
                          marginTop="-1px"
                        />
                        <PreviousItem
                          omitValue={i === 0}
                          comparator={comparator}
                          curr={el?.left}
                          prev={arr[i + 1]?.left}
                          isTimeType={isTimeType}
                          hours={hours}
                          marginTop={isTimeType ? '9px' : '7px'}
                        />
                      </PreviousItemContainer>
                    </StyledTd>
                  ))}
                </StyledTr>
              )
              : (
                <StyledTr $eachSide key={index}>
                  {(previous ?? []).map((el, i, arr) => i !== arr.length - 1 && (
                    <StyledTd $eachSide key={i}>
                      <PreviousItemContainer $isTimeType={isTimeType} $eachSide key={i}>
                        <PreviousItem
                          omitValue={i === 0}
                          comparator={comparator}
                          curr={el?.right}
                          prev={arr[i + 1]?.right}
                          isTimeType={isTimeType}
                          hours={hours}
                          marginTop="-1px"
                        />
                        <PreviousItem
                          omitValue={i === 0}
                          comparator={comparator}
                          curr={el?.left}
                          prev={arr[i + 1]?.left}
                          isTimeType={isTimeType}
                          hours={hours}
                          marginTop={isTimeType ? '9px' : '7px'}
                        />
                      </PreviousItemContainer>
                    </StyledTd>
                  ))}
                </StyledTr>
              )
            : (previous ?? []).length < 6
              ? (
                <StyledTr key={index}>
                  {previous.map((el, i, arr) => (
                    <StyledTd key={i}>
                      <PreviousItemContainer $isTimeType={isTimeType} key={i}>
                        <PreviousItem omitValue={i === 0} comparator={comparator} curr={el} prev={arr[i + 1]} isTimeType={isTimeType} hours={hours} />
                      </PreviousItemContainer>
                    </StyledTd>
                  ))}
                </StyledTr>
              )
              : (
                <StyledTr key={index}>
                  {previous.map((el, i, arr) => i !== arr.length - 1 && (
                    <StyledTd key={i}>
                      <PreviousItemContainer $isTimeType={isTimeType} key={i}>
                        <PreviousItem omitValue={i === 0} comparator={comparator} curr={el} prev={arr[i + 1]} isTimeType={isTimeType} hours={hours} />
                      </PreviousItemContainer>
                    </StyledTd>
                  ))}
                </StyledTr>
              ))}
        </tbody>
      </table>
    )
}

export default PreviousRoundsHistory
