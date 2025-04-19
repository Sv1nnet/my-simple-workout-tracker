import { EditFilled } from '@ant-design/icons'
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

export const Container = styled.div`
  position: relative;
  width: 100%;
  overflow-x: hidden;
`

export const StyledCollapse = styled(Collapse)`
  width: 100%;
  background-color: white;
  padding-block: 12px;
  border-radius: unset;
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
  line-height: 1;
  margin-bottom: 0;
  font-size: 18px;
`

export const StyledListItemMeta = styled(List.Item.Meta)`
  flex-basis: 100%;
  margin-bottom: 6px;

  & .ant-list-item-meta-title {
    margin-bottom: 0;
  }
`

export const Description = styled(Typography.Text)`
  margin-top: -6px;
  padding-bottom: 6px;
  padding-inline: 40px 15px;
  display: block;
  background-color: white;
`

export const StyledText = styled(Typography.Text)`
  display: block;
  line-height: 1;
`

export const StyledActionIcon = styled(EditFilled)`
  font-size: 28px;
  margin-left: 20px;
  color: white;
`
