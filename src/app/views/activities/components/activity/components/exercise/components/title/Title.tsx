import { Collapse, Typography } from 'antd'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { ReactNode } from 'react'
import styled from 'styled-components'

const { Panel } = Collapse

const StyledCollapse = styled(Collapse)`
  margin-bottom: 3px;

  & > .ant-collapse-item {
    & > .ant-collapse-header {
      padding: 0;
      border: none;
      border-radius: var(--border-radius-base);
      color: var(--text-color);

      & .ant-collapse-expand-icon {
        & .ant-collapse-arrow {
          margin: 0 auto;
        }
      }
    }
  }
  &.ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding: 0 2px;
    line-height: 1.2;
  }
`

export type TitleProps = {
  description?: ReactNode;
  children?: ReactNode
}

const Title = ({ description, children }: TitleProps) => {
  const { intl } = useIntlContext()
  const { activities: { input_labels } } = intl.pages

  return (
    <StyledCollapse expandIconPosition='start' ghost>
      <Panel header={children || null} key="1" >
        <Typography.Text>{description || input_labels.no_description}</Typography.Text>
      </Panel>
    </StyledCollapse>
  )
}

export default Title