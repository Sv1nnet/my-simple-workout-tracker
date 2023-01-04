import styled from 'styled-components'

export const Body = styled.div`
  overflow-y: scroll;
  border-right: 1px solid lightgrey;
  border-left: none;
  height: 100%;
`

export const Text = styled.p`
  margin: 0;
  color: ${({ $color }) => $color};
  margin-top: ${({ $mt }) => $mt};
  ${({ $eachSide }) => $eachSide ? 'line-height: 1;' : ''}
`
