import { EditFilled } from '@ant-design/icons'
import { Checkbox, Tag } from 'antd'
import styled from 'styled-components'

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

export const InnerContainer = styled.div`
  background-color: white;
  padding: 15px;

  .ant-list-item-meta-content {
    width: 100%;
  }
`

export const StyledActionIcon = styled(EditFilled)`
  font-size: 28px;
  margin-left: 20px;
  color: white;
`
