import { Switch } from 'antd'
import styled from 'styled-components'

export const ThemeSwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const StyledSwitch = styled(Switch)`
  transform: scale(1.2);
  background-color: #372a8f;

  &.ant-switch-checked {
    background-color: #ffb000;
  }

  &.ant-switch-checked .ant-switch-inner {
    margin: 0 27px 0 4px;
  }

  .ant-switch-inner {
    font-size: 14px;
    margin: 0 4px 0 27px;
  }

  .ant-switch-handle::before {
    background-color: var(--background-color);
  }
`
