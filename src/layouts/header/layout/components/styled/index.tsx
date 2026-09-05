
import styled from 'styled-components'
import { PageHeader } from 'antd'

export const ContentContainer = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
  position: relative;
  background-color: var(--background-color);
`

export const StyledPageHeader = styled(PageHeader)`
  background-color: var(--primary-color);

  .ant-page-header-heading-extra {
    display: flex;
    align-items: center;
    margin: 0;
  }
  .ant-page-header-heading {
    justify-content: center;
    .ant-page-header-back {
      position: absolute;
      left: 15px;
    }
  }
  .ant-page-header-heading-title {
    height: 32px;
    color: white;
    margin-right: 0;
    position: relative;
    z-index: 2;
  }
  .anticon.anticon-arrow-left > svg {
    transform: scale(1.5);
    fill: white;
  }
`