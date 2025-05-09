import React, { useMemo } from 'react'
import { Button, ButtonProps } from 'antd'
import { CaretRightOutlined, PauseOutlined, RedoOutlined } from '@ant-design/icons'
import { timeArrayToSeconds } from 'app/utils/time'
import { getFinalValue, ICON_STYLE } from './utils'
import { StopIcon, ResetButton, TimeText, TimerContainer } from './components'

export interface TimerViewProps {
  notificationTitle?: string,
  notificationOptions?: NotificationOptions,
  duration?: number,
  msOn?: boolean,
  hoursOn?: boolean,
  keepPageAwake?: boolean,
  onReset?: ButtonProps['onClick'],
  onPause?: ButtonProps['onClick'],
  onRun?: ButtonProps['onClick'],
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
  disabled?: boolean,
  isFinished?: boolean,
}

const TimerView = ({
  initialValue,
  value,
  duration,
  msOn,
  hoursOn,
  onRun,
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
      icon: <PauseOutlined style={ICON_STYLE} />,
      onClick: onPause,
    }
    : isFinished
      ? showResetButton
        ? {
          icon: <RedoOutlined style={ICON_STYLE} />,
          onClick: (e) => {
            onReset?.(e)
            onRun?.(e)
          },
        }
        : {
          icon: <StopIcon />,
          onClick: onReset,
        }
      : {
        icon: <CaretRightOutlined style={ICON_STYLE} />,
        onClick: onRun,
      },
  [ onPause, onReset, onRun, isRunning, isFinished, showResetButton ])

  return (
    <TimerContainer {...rest} $isFinished={isFinished}>
      <Button disabled={disabled} type="text" size="middle" {...buttonProps} {...buttonAttributes} />
      <TimeText $disabled={disabled} {...timeElementProps}>
        {getFinalValue(value, msOn, hoursOn, initialValue, duration === undefined ? 1 : -1)}
      </TimeText>
      {showResetButton && (
        <ResetButton
          type="text"
          size="middle"
          disabled={disabled || duration === timeArrayToSeconds(value) * 1000}
          icon={<StopIcon />}
          style={{ display: 'inline-flex' }}
          {...resetButtonProps}
          onClick={onReset}
        />
      )}
    </TimerContainer>
  )
}

export default TimerView