import styled from 'styled-components'

export const PreviousLoader = styled.span`
display: inline-block;
width: 100%;
margin-top: 10px;
padding-left: 25px;
text-align: center;
`

export const PreviousItemContainer = styled.div<{ $eachSide?: boolean, $isTimeType?: boolean }>`
  position: relative;
  margin-right: 8px;
  padding-top: ${({ $eachSide }) => $eachSide ? 1 : 2}px;
  height: ${({ $isTimeType }) => $isTimeType ? '100%' : '50px'};
  height: ${({ $isTimeType, $eachSide }) => !$isTimeType && !$eachSide ? '31px' : ''};
`

export const StyledTd = styled.td<{ $eachSide?: boolean }>`
  padding: 0;
  ${({ $eachSide }) => $eachSide ? '' : 'vertical-align: top;'}
`

export const StyledTr = styled.tr<{ $eachSide?: boolean }>`
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