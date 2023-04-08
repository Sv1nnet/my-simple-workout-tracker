import styled from 'styled-components'

export const Body = styled.div`
  overflow-y: scroll;
  border-right: 1px solid lightgrey;
  border-left: none;
  height: 100%;
`

const TextSide = styled.span`
  text-align: right;
  flex-basis: 40%;
`

const TextResult = styled.span`
  flex-grow: 1;
  text-align: left;
  padding-left: 10px;
`

export const Text = (() => {
  const _Text = styled.p`
    margin: 0;
    display: ${({ $isTimeType }) => $isTimeType ? '' : 'flex'};
    justify-content: center;
    color: ${({ $color }) => $color};
    margin-top: ${({ $mt }) => $mt};
    ${({ $eachSide }) => $eachSide ? 'line-height: 1;' : ''}
  `
  _Text.Side = TextSide
  _Text.Result = TextResult
  return _Text
})()
