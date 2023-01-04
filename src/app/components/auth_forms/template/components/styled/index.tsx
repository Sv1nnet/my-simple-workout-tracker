import { Tabs, TabsProps } from 'antd'
import { FC } from 'react'
import styled from 'styled-components'

export const Container = styled.div`
position: relative;
display: flex;
height: 100%;
width: 100%;
`

export const FormContainer = styled.div`
width: 100%;
max-width: 425px;
margin: 10vh auto 0;
`

export const StyledTabs: FC<TabsProps> = styled(Tabs)`
.ant-tabs-nav {
  .ant-tabs-nav-operations {
    display: none;
  }

  &-list {
    width: 100%;
    .ant-tabs-tab {
      width: 50%;
      justify-content: center;
      &:nth-child(3) {
        overflow: hidden;
        width: 0;
        padding: 0;
        margin: 0;
      }
    }
  }
}
`