import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Button, ButtonProps } from 'antd'
import { CaretRightOutlined, PauseOutlined, RedoOutlined } from '@ant-design/icons'
import { timeArrayToSeconds } from 'app/utils/time'
import { theme } from 'src/styles/vars'
import { getFinalValue } from './utils'

const TimerContainer = styled.div<{ $isFinished?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 1px solid ${theme.borderColorBase};
  border-radius: 2px;
  font-size: 16px;
  box-shadow: ${({ $isFinished }) => $isFinished ? '0px 0px 3px red' : 'none'};
`

const TimeText = styled.span<{ $disabled?: boolean }>`
  margin-right: 4px;
  color: ${({ $disabled }) => $disabled ? theme.textColorSecondary : ''};
`

export interface TimerViewProps {
  notificationTitle?: string,
  notificationOptions?: NotificationOptions,
  duration?: number,
  msOn?: boolean,
  hoursOn?: boolean,
  keepPageAwake?: boolean,
  onReset?: ButtonProps['onClick'],
  onPause?: ButtonProps['onClick'],
  onRunTimer?: ButtonProps['onClick'],
  onTimeOver?: (duration: number) => void,
  timeElementProps?: React.HTMLAttributes<HTMLSpanElement>,
  buttonProps?: Omit<ButtonProps, 'onClick'> & {
    onClick?: (runState: boolean, e: React.MouseEvent<HTMLElement>) => void,
  },
  resetButtonProps?: Omit<ButtonProps, 'onClick'> & {
    onClick?: (runState: boolean, e: React.MouseEvent<HTMLElement>) => void,
  },
  initialValue: number[],
  value: number[],
  showResetButton: boolean,
  isRunning: boolean,
  isPaused: boolean,
  disabled?: boolean,
  isFinished?: boolean,
}

const TimerView = ({
  initialValue,
  value,
  duration,
  msOn,
  hoursOn,
  onRunTimer,
  onPause,
  showResetButton,
  resetButtonProps,
  onReset,
  disabled,
  buttonProps,
  timeElementProps,
  isRunning,
  isFinished,
  ...rest
}: TimerViewProps) => {
  const buttonAttributes = useMemo(() => isRunning
    ? {
      icon: <PauseOutlined style={{ fontSize: 26 }} />,
      onClick: onPause,
    }
    : isFinished
      ? showResetButton
        ? {
          icon: <CaretRightOutlined style={{ fontSize: 26 }} />,
          onClick: (e) => {
            onReset(e)
            onRunTimer(e)
          },
        }
        : {
          icon: <RedoOutlined style={{ fontSize: 26 }} />,
          onClick: onReset,
        }
      : {
        icon: <CaretRightOutlined style={{ fontSize: 26 }} />,
        onClick: onRunTimer,
      },
  [ onPause, onReset, onRunTimer, isRunning, isFinished, showResetButton ])

  return (
    <TimerContainer {...rest} $isFinished={isFinished}>
      <Button disabled={disabled} type="text" size="middle" {...buttonProps} {...buttonAttributes} />
      <TimeText $disabled={disabled} {...timeElementProps}>
        {getFinalValue(value, msOn, hoursOn, initialValue, duration === undefined ? 1 : -1)}
      </TimeText>
      {showResetButton && (
        <Button
          type="text"
          size="middle"
          disabled={disabled || duration === timeArrayToSeconds(value) * 1000}
          icon={<RedoOutlined style={{ fontSize: 26 }} />}
          {...resetButtonProps}
          onClick={onReset}
        />
      )}
    </TimerContainer>
  )
}

export default TimerView