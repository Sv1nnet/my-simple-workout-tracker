import { Collapse, Checkbox, List, Typography } from 'antd'
import styled from 'styled-components'

const { Panel } = Collapse
const { Title, Text } = Typography

export const StyledCheckbox = styled(Checkbox)`
  position: absolute;
  top: 25px;
  left: 16px;
  z-index: 1;
`

export const StyledPanel = styled(Panel)`
  &.ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding: 0 0 0 32px;
  }

  &.ant-collapse-item > .ant-collapse-header {
    padding: 0;
    padding-left: 7px;

    & .ant-collapse-arrow {
      vertical-align: -16px;
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

export const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`

export const ExerciseTitle = styled(Text)`
  margin-bottom: 0;
  font-size: 18px;
`

export const StyledListItemMeta = styled(List.Item.Meta)`
  flex-basis: 100%;
  margin-top: 6px;
  margin-bottom: 6px;
`

export const Description = styled(Typography.Text)`
  margin-top: 6px;
  padding-left: 32px;
  display: inline-block;
`

export const StyledText = styled(Typography.Text)`
  display: block;
  line-height: 1;
`