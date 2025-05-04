import { EditFilled } from '@ant-design/icons'
import { Checkbox, Tag } from 'antd'
import styled from 'styled-components'
import { theme } from 'styles/vars'

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
`

export const StyledCheckbox = styled(Checkbox)`
  position: absolute;
  z-index: 100;
  top: -3px;
  left: 0;
`


export const TagsContainer = styled.div`
  width: 100%;
`

export const StyledTag = styled(Tag)`
  margin-bottom: 6px;
`

export const Container = styled.div`
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex: 1;
  align-items: start;
  max-width: 100%;
  flex-wrap: wrap;
`

export const InnerContainer = styled.div<{ $isSelected?: boolean }>`
  background-color: white;
  padding: 15px;
  ${({ $isSelected }) => $isSelected && `background-color: ${theme.ghostPrimaryColor};`}

  .ant-list-item-meta-content {
    width: 100%;
  }
`

export const ActionText = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: white;
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
