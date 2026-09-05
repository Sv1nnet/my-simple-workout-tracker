import { Button } from 'antd'
import { TimePicker } from 'app/components'

import styled from 'styled-components'

export const StopwatchContainer = styled.div`
  display: flex;
  margin-block: -1px;
  color: var(--text-color);
  font-weight: 400;

  & .activity-timer {
    background-color: var(--background-color);
  }
`

export const StyledButton = styled(Button)`
  margin-top:1px;
  color: white;
  &:focus, &:hover, &:active {
    color: white;
    background-color: #00ffb542;
  }
`

export const StyledTimePicker = styled(TimePicker)`
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  padding: 0;
  margin: 0;
  pointer-events: none;
  opacity: 0;
  outline: none;
  overflow: hidden;
`
