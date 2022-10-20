import styled from 'styled-components'
import { PreviousItem } from '..'

const PreviousLoader = styled.span`
display: inline-block;
width: 100%;
margin-top: 10px;
padding-left: 25px;
text-align: center;
`

const PreviousItemContainer = styled.div`
  position: relative;
  margin-right: 8px;
  padding-top: ${({ $eachSide }) => $eachSide ? 1 : 2}px;
  height: ${({ $isTimeType }) => $isTimeType ? '100%' : '50px'};
  height: ${({ $isTimeType, $eachSide }) => !$isTimeType && !$eachSide ? '31px' : ''};
`

const StyledTd = styled.td`
  padding: 0;
  ${({ $eachSide }) => $eachSide ? '' : 'vertical-align: top;'}
`

const StyledTr = styled.tr`
  position: relative;
  box-sizing: border-box;
  height: ${({ $eachSide }) => $eachSide ? 68 : 31}px;

  & ${StyledTd}:not(:last-of-type) ${PreviousItemContainer}:after {
    content: '';
    display: block;
    position: absolute;
    top: ${({ $eachSide }) => !$eachSide ? '2px' : 0};
    right: 0;
    height: ${({ $eachSide }) => !$eachSide ? '22px' : '100%'};
    width: 2px;
    background-color: lightgrey;
  }
`

const PreviousRoundsHistory = ({ isLoading, history, comparator, loaderDictionary, eachSide, isTimeType, hours }) => (isLoading || !history
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
                      <PreviousItem comparator={comparator} curr={el.right} prev={arr[i + 1]?.right} isTimeType={isTimeType} hours={hours} marginTop="-1px" />
                      <PreviousItem comparator={comparator} curr={el.left} prev={arr[i + 1]?.left} isTimeType={isTimeType} hours={hours} marginTop={isTimeType ? '9px' : '7px'} />
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
                      <PreviousItem comparator={comparator} curr={el.right} prev={arr[i + 1]?.right} isTimeType={isTimeType} hours={hours} marginTop="-1px" />
                      <PreviousItem comparator={comparator} curr={el.left} prev={arr[i + 1]?.left} isTimeType={isTimeType} hours={hours} marginTop={isTimeType ? '9px' : '7px'} />
                    </PreviousItemContainer>
                  </StyledTd>
                ))}
              </StyledTr>
            )
          : (previous ?? []).length < 6
            ? <StyledTr key={index}>
              {previous.map((el, i, arr) => (
                <StyledTd key={i}>
                  <PreviousItemContainer $isTimeType={isTimeType} key={i}>
                    <PreviousItem comparator={comparator} curr={el} prev={arr[i + 1]} isTimeType={isTimeType} hours={hours} />
                  </PreviousItemContainer>
                </StyledTd>
              ))}
            </StyledTr>
            : (
              <StyledTr key={index}>
                {previous.map((el, i, arr) => i !== arr.length - 1 && (
                  <StyledTd key={i}>
                    <PreviousItemContainer $isTimeType={isTimeType} key={i}>
                      <PreviousItem comparator={comparator} curr={el} prev={arr[i + 1]} isTimeType={isTimeType} hours={hours} />
                    </PreviousItemContainer>
                  </StyledTd>
                ))}
              </StyledTr>
            ))}
      </tbody>
    </table>
  )
)

export default PreviousRoundsHistory
