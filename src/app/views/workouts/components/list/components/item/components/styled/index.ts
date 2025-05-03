import { theme } from 'src/styles/vars'
import { Checkbox, Collapse, Typography } from 'antd'
import styled from 'styled-components'
import { CaretRightFilled, EditFilled } from '@ant-design/icons'

const { Panel } = Collapse

export const Container = styled.div`
  position: relative;
  width: 100%;
  overflow-x: hidden;
`

export const ImageContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 75px;
  height: 75px;
  background-color: #f5f5f5;
  & a {
    margin: 0 auto;
  }
  & img {
    max-height: 75px;
    max-width: 75px;
  }
`

export const StyledCheckbox = styled(Checkbox)`
  position: absolute;
  top: 19px;
  left: 15px;
  z-index: 1;
`

export const StyledPanel = styled(Panel)`
  &.ant-collapse-item {
    &.panel-header {
      padding-inline: 15px;
    }

    & > .ant-collapse-header {
      padding: 0;

      & .ant-collapse-arrow {
        vertical-align: -7px;
      }
    }
  }
`

export const StyledCollapse = styled(Collapse)<{ $isSelected?: boolean }>`
  width: 100%;
  background-color: white;
  padding-block: 12px;
  border-radius: unset;
  ${({ $isSelected }) => $isSelected && `background-color: ${theme.ghostPrimaryColor};`}
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

export const TagsContainer = styled.div<{ $marginBottom?: number }>`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: ${({ $marginBottom = 0 }) => $marginBottom}px;
  & .ant-tag {
    margin: 0;
  }
`

export const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`

export const StyledBreakText = styled(Typography.Text)`
  display: inline-block;
  width: 100%;
  margin-bottom: 10px;
  font-weight: bold;
  color: ${theme.textColorSecondary};
  line-height: 1;
`


export const ActionText = styled.span<{ $marginTop?: number }>`
  font-size: 14px;
  font-weight: bold;
  color: white;
  line-height: 1;
  margin-top: ${({ $marginTop = 0 }) => $marginTop}px;
`

export const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
`

export const StyledActionIcon = styled(EditFilled)`
  font-size: 28px;
  color: white;
`

export const StyledRightActionIcon = styled(CaretRightFilled)`
  font-size: 36px;
  margin-left: 5px;
  color: white;
`
