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
  const Component = styled.p<{ $isTimeType?: boolean, $color?: string, $mt?: string, $eachSide?: boolean }>`
    margin: 0;
    display: ${({ $isTimeType }) => $isTimeType ? '' : 'flex'};
    justify-content: center;
    color: ${({ $color }) => $color};
    margin-top: ${({ $mt }) => $mt};
    ${({ $eachSide }) => $eachSide ? 'line-height: 1;' : ''}
  `

  const _Text: typeof Component & { Side: typeof TextSide, Result: typeof TextResult }
    = Object.assign(Component, { Side: TextSide, Result: TextResult })

  return _Text
})()
