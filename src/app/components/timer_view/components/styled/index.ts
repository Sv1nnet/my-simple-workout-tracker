import { Button } from 'antd'
import styled from 'styled-components'

export const TimerContainer = styled.div<{ $isFinished?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border-color-base);
  border-radius: 2px;
  font-size: 16px;
  height: 33px;
  box-shadow: ${({ $isFinished }) => $isFinished ? '0px 0px 3px red' : 'none'};
`

export const TimeText = styled.span<{ $disabled?: boolean, $isRunPauseButtonsHidden?: boolean, $isStopButtonHidden?: boolean }>`
  margin-right: 4px;
  ${({ $isRunPauseButtonsHidden }) => $isRunPauseButtonsHidden && 'margin-left: 10px'};
  ${({ $isStopButtonHidden }) => $isStopButtonHidden && 'margin-right: 10px'};
  color: ${({ $disabled }) => $disabled ? 'var(--text-color-secondary)' : 'var(--text-color)'};
`

export const ResetButton = styled(Button)`
  display: inline-flex;

  & svg {
    margin: auto;
  }
`