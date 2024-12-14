import { Checkbox, Collapse } from 'antd'
import styled from 'styled-components'

const { Panel } = Collapse

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

export const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  & .ant-tag {
    margin: 0;
  }
`

export const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`
