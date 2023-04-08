import { TimePicker } from '@/src/app/components'
import { Typography } from 'antd'
import { Input } from '@/src/app/components'
import React, { FC } from 'react'
import styled from 'styled-components'
import { INumberInput } from 'app/components/input/number/NumberInput'

export const RoundText = styled(Typography.Text)`
  min-width: 15px;
  flex-shrink: 0;
`

export const LegendItem = styled.span`
  display: inline-block;
  position: relative;
  bottom: -6px;
  list-style-type: none;
  width: 30px;
  height: 2px;
  background-color: ${({ $color }) => $color.line};

  span {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -90%);
    color: ${({ $color }) => $color.text};
  }

  &:after {
    content: '';
    position: absolute;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 6px;
    width: 6px;
    background-color: ${({ $color }) => $color.line};
  }
`

export const PreviousLoader = styled.span`
  display: inline-block;
  width: 100%;
  margin-top: 10px;
  padding-left: 25px;
  text-align: center;
`

export const StyledTimePicker = styled(TimePicker)`
  width: ${({ hours }) => hours ? '95px' : '75px'};
  padding: 1px 7px 1px;
`

export const SideInputContainer = styled.div`
  margin-top: 5px;
  display: flex;
  justify-content: ${({ $hours }) => $hours ? 'stretch' : 'center' };
`


export interface ISideNumberInput extends INumberInput {
  dataSide: string;
  roundText: string;
  disabled: boolean;
  onBlur: Function;
}

export const SideNumberInput: FC<ISideNumberInput> = ({ dataSide, roundText, ...props }) => (
  <SideInputContainer>
    <RoundText type="secondary">{roundText}</RoundText>
    <Input.Number
      data-side={dataSide}
      onlyPositive
      style={{ textAlign: 'center' }}
      size="small"
      {...props}
    />
  </SideInputContainer>
)

export interface ISideTimePicker {
  dataSide: string;
  roundText: string;
  hours: boolean;
  disabled: boolean;
}

export const SideTimePicker: FC<ISideTimePicker> = ({ dataSide, roundText, hours, ...props }) => (
  <SideInputContainer>
    <RoundText type="secondary">{roundText}</RoundText>
    <StyledTimePicker
      format={hours ? 'HH:mm:ss' : 'mm:ss'}
      data-side={dataSide}
      inputReadOnly
      showNow={false}
      size="small"
      allowClear={false}
      placeholder=""
      {...props}
    />
  </SideInputContainer>
)


export const RoundsTable = styled.table`
  table-layout: fixed;
  width: 100%;
`

export const THeadCell = styled.th`
  font-weight: normal;
  padding-left: ${({ $eachSide }) => $eachSide ? '15px' : ''};
  width: ${({ $previous, $eachSide, $isTimeType, $isHours }) => (
    !$previous
      ? $isTimeType
        ? $isHours
          ? `${$eachSide ? '110px' : '75px'}`
          : `${$eachSide ? '90px' : '75px'}`
        : `${$eachSide ? '80px' : '65px'}`
      : ''
  )};
  min-width: ${({ $previous, $eachSide, $isTimeType, $isHours }) => (
    !$previous
      ? $isTimeType
        ? $isHours
          ? `${$eachSide ? '110px' : '75px'}`
          : `${$eachSide ? '90px' : '75px'}`
        : `${$eachSide ? '80px' : '65px'}`
      : ''
  )};
`

export const StyledTd = styled.td`
  text-align: center;
  padding: 0;
  padding-bottom: 5px;

  & ${StyledTimePicker} {
    width: ${({ $hours }) => $hours ? '100%' : ''};
  }
`
