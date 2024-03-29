import styled from 'styled-components'

export const Container = styled.div<{ $mt?: string | number }>`
  display: flex;
  margin-top: ${({ $mt }) => $mt};
  padding-right: 8px;
`

export const Value = styled.span<{ $color?: string, $noDiff?: boolean }>`
  color: ${({ $color }) => $color};
  background-color: ${({ $color, $noDiff }) => $noDiff ? 'rgba(0,0,0,0.1)' : `${$color}29`};
  padding-left: 4px;
  padding-right: 4px;
`

export const Diff = styled.span<{ $color?: string }>`
  color: ${({ $color }) => $color};
`
