import { Typography } from 'antd'
import styled from 'styled-components'

export const Container = styled.div<{ $eachSide?: boolean }>`
  ${({ $eachSide }) => $eachSide ? `
    display: flex;
    justify-content: flex-start;
  ` : ''}
`

export const SideLabel = styled(Typography.Paragraph)`
  margin-bottom: 0;
`

export const EachSideContainer = styled.div<{ $right?: boolean, $left?: boolean }>`
  margin-left: ${({ $left }) => $left ? '15px' : ''};

  ${SideLabel} {
    margin-bottom: 0;
  }
`
