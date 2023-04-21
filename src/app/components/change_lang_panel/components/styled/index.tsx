import styled from 'styled-components'

export const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  right: 15px;
  top: 15px;

  .ant-select-selector {
    padding-left: 2px !important;
    padding-right: 2px !important;
  }
`

export const OptionsContainer = styled.div`
  & .ant-select-item.ant-select-item-option {
    padding: 0;

    .ant-select-item-option-content {
      display: flex;
      justify-content: center;
      align-items: center;
    }

  }
`