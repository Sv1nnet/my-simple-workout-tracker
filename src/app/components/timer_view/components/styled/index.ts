import { Button } from 'antd'
import { theme } from 'styles/vars'
import styled from 'styled-components'

export const TimerContainer = styled.div<{ $isFinished?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 1px solid ${theme.borderColorBase};
  border-radius: 2px;
  font-size: 16px;
  box-shadow: ${({ $isFinished }) => $isFinished ? '0px 0px 3px red' : 'none'};
`

export const TimeText = styled.span<{ $disabled?: boolean }>`
  margin-right: 4px;
  color: ${({ $disabled }) => $disabled ? theme.textColorSecondary : ''};
`

export const ResetButton = styled(Button)`
  display: inline-flex;

  & svg {
    margin: auto;
  }
`