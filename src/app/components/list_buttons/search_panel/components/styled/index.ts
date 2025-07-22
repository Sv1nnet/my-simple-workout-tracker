import styled from 'styled-components'
import { Input, Button, Collapse, Select } from 'antd'

const transition = 'all .3s cubic-bezier(0.645, 0.045, 0.355, 1)'

export const AddItemContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  padding: 0 8px 4px;
`

export const Container = styled.div`
  position: absolute;
  width: 100%;
  padding-inline: 15px;
  padding-block: 6px;
  background-color: var(--background-color);
  color: var(--text-color);
  z-index: 1;
`

export const PanelPlaceholder = styled.div`
  width: 100%;
  height: 51px;
`

export const ButtonsContainer = styled.div`
  display: flex;
  align-items: flex-end;

  & .minified {
    width: 52px;
  }
`

export const AddButtonText = styled.span<{ $isVisible: boolean }>`
  opacity: ${({ $isVisible }) => $isVisible ? 1 : 0};
  transition: .3s;
`

export const StyledInput = styled(Input)<{ $collapsed: boolean }>`
  position: relative;
  margin-top: 5px;
  z-index: 1001;
  background-color: var(--background-color);
  color: var(--text-color);
  border-color: var(--border-color-base);
  ${({ $collapsed }) => $collapsed ? `
    margin-left: -1px !important;
    width: 0 !important;
    border-width: 0px !important;
    padding: 0 !important;
    z-index: 1;
  ` : ''}

  &:hover, &:focus {
    border-color: var(--primary-color);
  }
`

export const StyledInputGroup = styled(Input.Group)<{ $collapsed: boolean }>`
  display: flex;
  flex-wrap: nowrap;
  transition: ${transition};
  width: ${({ $collapsed }) => $collapsed ? '50px' : '100%'};
`

export const StyledSearchButton = styled(Button)`
  margin-top: 5px;
  width: 50px;
  height: 40px;
  z-index: 100;
  background-color: var(--background-color);
  color: var(--text-color);
  border-color: var(--border-color-base);

  &:hover, &:focus {
    background-color: var(--background-color);
    color: var(--text-color);
    border-color: var(--primary-color);
  }
`

export const StyledSelect = styled(Select)`
  .ant-select-selection-overflow .ant-select-selection-item {
    background: var(--tag-background-color);
    color: var(--text-color);
    border-color: var(--border-color-base);

    .ant-select-selection-item-remove {
      color: var(--text-color);
    }
  }
  &.ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background-color: var(--background-color);
    color: var(--text-color);
    border-color: var(--border-color-base);

    &:hover, &:focus {
      border-color: var(--primary-color);
    }
  }
  &.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector  {
    border-color: var(--primary-color);
  }
` 

export const SelectContainer = styled.div<{ $collapsed: boolean }>`
  display: flex;
  width: 100%;
  margin-top: 5px;
  overflow: hidden;
  transition: ${transition};
  opacity: ${({ $collapsed }) => $collapsed ? '0' : '1'};;

  & .ant-select {
    width: 100%;
  }
`

export const StyledCollapse = styled(Collapse)`
  & > .ant-collapse-item {
    border: none;

    & > .ant-collapse-content > .ant-collapse-content-box {
      padding: 0;
    }

    & > .ant-collapse-header {
      overflow: hidden;
      border: none;
      outline: none;
      height: 0;
      margin: 0;
      padding: 0;
    }
  }
`

export const OptionContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`