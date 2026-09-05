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
  secOn?: boolean,
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
  stopButtonProps?: Omit<ButtonProps, 'onClick'> & {
    onClick?: (runState: boolean, e: React.MouseEvent<HTMLElement>) => void,
  },
  initialValue: number[],
  value: number[],
  showRunPauseButton: boolean,
  showStopButton: boolean,
  isRunning: boolean,
  disabled?: boolean,
  isFinished?: boolean,
}

const TimerView = ({
  initialValue,
  value,
  duration,
  msOn,
  secOn = true,
  hoursOn,
  onRun,
  onPause,
  showStopButton = true,
  showRunPauseButton = true,
  stopButtonProps,
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
      ? showStopButton
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
  [ onPause, onReset, onRun, isRunning, isFinished, showStopButton ])

  return (
    <TimerContainer {...rest} $isFinished={isFinished}>
      {showRunPauseButton && <Button disabled={disabled} type="text" size="middle" {...buttonProps} {...buttonAttributes} />}
      <TimeText $disabled={disabled} $isRunPauseButtonsHidden={!showRunPauseButton} $isStopButtonHidden={!showStopButton} {...timeElementProps}>
        {getFinalValue(value, msOn, secOn, hoursOn, initialValue, duration === undefined ? 1 : -1)}
      </TimeText>
      {showStopButton && (
        <ResetButton
          type="text"
          size="middle"
          disabled={disabled || duration === timeArrayToSeconds(value) * 1000}
          icon={<StopIcon />}
          style={{ display: 'inline-flex' }}
          {...stopButtonProps}
          onClick={onReset}
        />
      )}
    </TimerContainer>
  )
}

export default TimerView