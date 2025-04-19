import { Typography } from 'antd'
import styled from 'styled-components'

const { Title: TitleAnt } = Typography

export const StyledTitle = styled(TitleAnt)`
  &.ant-typography {
    margin-bottom: 0;
  }
`

export const LoadType = styled.div`
  text-align: left;
  width: 100%;
`
