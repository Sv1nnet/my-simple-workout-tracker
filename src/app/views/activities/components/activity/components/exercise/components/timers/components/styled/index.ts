import { Typography } from 'antd'
import styled from 'styled-components'

export const Container = styled.div<{ $eachSide?: boolean }>`
  margin-top: ${({ $eachSide }) => $eachSide ? '' : '10px'};
  ${({ $eachSide }) => $eachSide ? `
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
  ` : ''}
`

export const SideLabel = styled(Typography.Paragraph)`
  margin-bottom: 0;
`

export const EachSideContainer = styled.div<{ $right?: boolean, $left?: boolean }>`
  margin-left: ${({ $right }) => $right ? '10px' : ''};
  margin-right: ${({ $right }) => !$right ? '15px' : ''};

  ${SideLabel} {
    margin-bottom: 0;
  }

  @media (max-width: 375px) {
    & {
      width: 100%;
      margin-left: 0;
      order: ${({ $left }) => $left ? 1 : ''};
      margin-top: ${({ $left }) => $left ? '6px' : ''};  
    }
  }
`
