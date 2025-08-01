import { Collapse, Typography } from 'antd'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import styled from 'styled-components'

const { Panel } = Collapse

const StyledCollapse = styled(Collapse)`
  margin-bottom: 8px;

  & > .ant-collapse-item {
    & > .ant-collapse-header {
      margin-top: 6px;
      padding: 0;
      border: 1px solid var(--border-color-base);
      border-radius: var(--border-radius-base);
      color: var(--text-color);

      & .ant-collapse-expand-icon {
        width: 100%;
        display: flex;

        & .ant-collapse-arrow {
          margin: 0 auto;
          svg {
            transform: rotate(90deg);
          }
        }
      }

    }

    &.ant-collapse-item-active {
      & > .ant-collapse-header {
        border-bottom: 1px solid transparent;
      }

      & .ant-collapse-expand-icon {
        & .ant-collapse-arrow svg {
          transform: rotate(270deg) !important;
        }
      }
    }

  }
  &.ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    border-bottom: 1px solid var(--border-color-base);
    border-left: 1px solid var(--border-color-base);
    border-right: 1px solid var(--border-color-base);
    padding: 0 2px;
  }
`

export type DescriptionProps = {
  description?: string
}

const Description = ({ description }: DescriptionProps) => {
  const { intl } = useIntlContext()
  const { activities: { input_labels } } = intl.pages

  return (
    <StyledCollapse ghost>
      <Panel header={null} key="1" >
        <Typography.Text>{description || input_labels.no_description}</Typography.Text>
      </Panel>
    </StyledCollapse>
  )
}

export default Description