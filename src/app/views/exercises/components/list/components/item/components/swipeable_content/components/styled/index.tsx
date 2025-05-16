import styled from 'styled-components'
import { Checkbox, Tag } from 'antd'
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

export const InnerContainer = styled.div<{ $isSelected?: boolean }>`
  background-color: white;
  padding: 15px;
  ${({ $isSelected }) => $isSelected && `background-color: ${theme.ghostPrimaryColor};`}

  .ant-list-item-meta-content {
    width: 100%;
  }
`
