import { Typography } from 'antd'
import styled from 'styled-components'

const { Title: TitleAnt } = Typography

export const StyledTitle = styled(TitleAnt)`
  color: var(--textColor);
  &.ant-typography {
    margin-bottom: 0;
    color: var(--heading-color);
  }
`

export const LoadType = styled.div`
  color: var(--textColor);
  text-align: left;
  width: 100%;

  & .ant-typography.ant-typography-secondary {
    color: var(--text-color-secondary);
  }
`
