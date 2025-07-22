import { Collapse, Checkbox, List, Typography } from 'antd'
import styled from 'styled-components'

const { Panel } = Collapse
const { Title, Text } = Typography

export const StyledCheckbox = styled(Checkbox)`
  position: absolute;
  top: 19px;
  left: 16px;
  z-index: 1;
`

export const StyledCollapse = styled(Collapse)<{ $isSelected?: boolean }>`
  width: 100%;
  background-color: var(--background-color);
  padding-block: 12px;
  border-radius: unset;
  ${({ $isSelected }) => $isSelected && 'background-color: var(--selected-list-item-color);'}
`

export const TagsContainer = styled.div<{ $isInTitle?: boolean }>`
  margin-top: ${({ $isInTitle }) => $isInTitle ? 0 : 12}px;
  margin-bottom: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  & .ant-tag {
    margin: 0;
  }
`

export const StyledPanel = styled(Panel)`
  &.ant-collapse-item {
    &.panel-header {
      padding-inline: 15px;
    }

    & > .ant-collapse-content > .ant-collapse-content-box {
      padding: 0 0 0 32px;
    }
  }

  &.ant-collapse-item > .ant-collapse-header {
    padding: 0;

    & .ant-collapse-arrow {
      vertical-align: -7px;
    }
  }
`

export const StyledTagsPanel = styled(StyledPanel)`
  & .ant-collapse-header {
    display: none !important;
  }

  & .ant-collapse-content-box {
    padding: 0 !important;

    & .ant-tag {
      margin: 0;
    }
  }
`

export const DateOfActivity = styled(Text)`
  display: block;
  line-height: 1;
`

export const WorkoutTitle = styled(Title)`
  text-align: left !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  line-height: 1 !important;
`

export const ExerciseTitle = styled(Text)`
  line-height: 0.9;
  display: inline-block;
  margin-bottom: 0;
  font-size: 18px;
`

export const StyledListItemMeta = styled(List.Item.Meta)`
  margin-bottom: 8px;

  & .ant-list-item-meta-title {
    margin-bottom: 0;
  }
`

export const Description = styled(Typography.Text)`
  margin-top: -6px;
  padding-bottom: 6px;
  padding-inline: 40px 15px;
  display: block;
  background-color: var(--background-color);
`

export const StyledText = styled(Typography.Text)`
  display: block;
  line-height: 1;
`
