import styled from 'styled-components'
import { Input, Button } from 'antd'

export const Container = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: 6px;
  padding-left: 15px;
  padding-right: 15px;

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
  ${({ $collapsed }) => $collapsed ? `
    margin-left: -1px !important;
    width: 0 !important;
    border-width: 0px !important;
    padding: 0 !important;
    z-index: 1;
  ` : ''}
`

export const ReloadButton = styled(Button)`
  margin-left: 5px;
  flex-shrink: 0;
  flex-basis: 46px;
  height: 40px;
`

export const StyledInputGroup = styled(Input.Group)<{ $collapsed: boolean }>`
  display: flex;
  flex-wrap: nowrap;
  transition: all .3s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: ${({ $collapsed }) => $collapsed ? '50px' : '100%'};
`

export const StyledSearchButton = styled(Button)`
  margin-top: 5px;
  width: 50px;
  height: 40px;
  z-index: 1000;
`
