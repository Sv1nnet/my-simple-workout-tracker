import { Input, TimePicker } from '@/src/app/components'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'
import { ActivityForm, HisotryResult, Round as TRound } from '@/src/app/store/slices/activity/types'
import { ExerciseType } from '@/src/app/store/slices/exercise/types'
import { Form, FormInstance, Typography } from 'antd'
import dayjs from 'dayjs'
import React, { FC, useContext } from 'react'
import styled from 'styled-components'
import { getComparator } from 'app/views/activities/components/activity/Activity'
import { colors } from '../chart/Chart'
import { PreviousRoundsHistory } from '..'

const RoundText = styled(Typography.Text)`
  min-width: 15px;
  flex-shrink: 0;
`

const LegendItem = styled.span`
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

const PreviousLoader = styled.span`
  display: inline-block;
  width: 100%;
  margin-top: 10px;
  padding-left: 25px;
  text-align: center;
`

const StyledTimePicker = styled(TimePicker)`
  width: ${({ hours }) => hours ? '95px' : '75px'};
  padding: 1px 7px 1px;
`

const SideInputContainer = styled.div`
  margin-top: 5px;
  display: flex;
  justify-content: ${({ $hours }) => $hours ? 'stretch' : 'center' };
`

export interface ISideNumberInput {
  dataSide: string;
  roundText: string;
  disabled: boolean;
  onBlur: Function;
}

const SideNumberInput: FC<ISideNumberInput> = ({ dataSide, roundText, ...props }) => (
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

const SideTimePicker: FC<ISideTimePicker> = ({ dataSide, roundText, hours, ...props }) => (
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

export interface IRound {
  comparator: {
    pos: (curr: number, next: number) => boolean,
    neg: (curr: number, next: number) => boolean,
  };
  isFormItemDisabled: boolean;
  loaderDictionary: {
    previous_loading: string,
  };
  isLoading: boolean;
  history: HisotryResult,
  form: FormInstance<ActivityForm<dayjs.Dayjs>>,
  exerciseIndex: number;
  hours: boolean;
  round: number;
  eachSide: boolean,
  isTimeType: boolean,
  historyDisplayMode: 'chart' | 'table',
  sideLabels: {
    right: {
      short: string,
    },
    left: {
      short: string,
    },
  };
}

export interface IRounds {
  loaderDictionary: {
    previous_loading: string,
  };
  isFormItemDisabled: boolean;
  isLoading: boolean;
  form;
  history: HisotryResult;
  rounds: TRound[];
  hours: boolean;
  exerciseIndex: number;
  eachSide: boolean;
  historyDisplayMode: 'table' | 'chart';
  type: ExerciseType;
  isTimeType: boolean;
}

const RoundsTable = styled.table`
  table-layout: fixed;
  width: 100%;
`

const THeadCell = styled.th`
  font-weight: normal;
  padding-left: ${({ $eachSide }) => $eachSide ? '15px' : ''};
  width: ${({ $previous, $eachSide, $isTimeType }) => (
    !$previous
      ? $isTimeType
        ? `${$eachSide ? '90px' : '75px'}`
        : `${$eachSide ? '80px' : '65px'}`
      : ''
  )};
  min-width: ${({ $previous, $eachSide, $isTimeType }) => (
    !$previous
      ? $isTimeType
        ? `${$eachSide ? '90px' : '75px'}`
        : `${$eachSide ? '80px' : '65px'}`
      : ''
  )};
`

const StyledTd = styled.td`
  text-align: center;
  padding: 0;
  padding-bottom: 5px;

  & ${StyledTimePicker} {
    width: ${({ $hours }) => $hours ? '100%' : ''};
  }
`

const Round = ({ comparator, totalRounds, isFormItemDisabled, loaderDictionary, isLoading, history, form, exerciseIndex, hours, round, eachSide, isTimeType, historyDisplayMode, sideLabels }) => {
  const handleRepeatsChange = (value, { target }) => {
    const results = [ ...form.getFieldValue('results') ]

    if (eachSide) results[exerciseIndex].rounds[round][target.dataset.side] = value
    else results[exerciseIndex].rounds[round] = value

    form.setFieldsValue({ results })
  }

  return (
    <tr>
      <StyledTd>
        {historyDisplayMode === 'chart'
          ? (
            <LegendItem $color={colors[round]}>
              <span>{round + 1}</span>
            </LegendItem>
          )
          : <span>{round + 1}</span>}
      </StyledTd>
      <StyledTd $hours={hours}>
        {!isTimeType
          ? eachSide
            ? (
              <>
                <Form.Item name={[ 'results', exerciseIndex, 'rounds', round, 'right' ]} noStyle>
                  <SideNumberInput disabled={isFormItemDisabled} dataSide="right" onBlur={handleRepeatsChange} roundText={`${sideLabels.right.short}: `} />
                </Form.Item>
                <Form.Item name={[ 'results', exerciseIndex, 'rounds', round, 'left' ]} noStyle>
                  <SideNumberInput disabled={isFormItemDisabled} dataSide="left" onBlur={handleRepeatsChange} roundText={`${sideLabels.left.short}: `} />
                </Form.Item>
              </>
            )
            : (
              <Form.Item name={[ 'results', exerciseIndex, 'rounds', round ]} noStyle>
                <Input.Number
                  onlyPositive
                  disabled={isFormItemDisabled}
                  style={{ textAlign: 'center' }}
                  onBlur={handleRepeatsChange}
                  size="small"
                />
              </Form.Item>
            )
          : eachSide
            ? (
              <>
                <Form.Item name={[ 'results', exerciseIndex, 'rounds', round, 'right' ]} noStyle>
                  <SideTimePicker disabled={isFormItemDisabled} roundText={`${sideLabels.right.short}: `} hours={hours} dataSide="right" />
                </Form.Item>
                <Form.Item name={[ 'results', exerciseIndex, 'rounds', round, 'left' ]} noStyle>
                  <SideTimePicker disabled={isFormItemDisabled} roundText={`${sideLabels.left.short}: `} hours={hours} dataSide="left" />
                </Form.Item>
              </>
            )
            : (
              <Form.Item name={[ 'results', exerciseIndex, 'rounds', round ]} noStyle>
                <StyledTimePicker
                  disabled={isFormItemDisabled}
                  format={hours ? 'HH:mm:ss' : 'mm:ss'}
                  inputReadOnly
                  showNow={false}
                  size="small"
                  allowClear={false}
                  placeholder=""
                />
              </Form.Item>
            )}
      </StyledTd>
      {round === 0
        ? <td rowSpan={totalRounds} style={{ overflow: 'hidden', padding: 0 }}>
          {isLoading || !history
            ? <PreviousLoader>{loaderDictionary.previous_loading}</PreviousLoader>
            : (
              <div style={{ overflow: 'hidden', paddingLeft: 5 }}>
                <div style={{ overflow: 'scroll' }}>
                  <PreviousRoundsHistory
                    isLoading={isLoading}
                    history={history}
                    comparator={comparator}
                    loaderDictionary={loaderDictionary}
                    eachSide={eachSide}
                    isTimeType={isTimeType}
                    hours={hours}
                  />
                </div>
              </div>
            )}
        </td>
        : null}
    </tr>
  )
}

const Rounds: FC<IRounds> = ({ loaderDictionary, isFormItemDisabled, isLoading, form, history, rounds, hours, exerciseIndex, eachSide, historyDisplayMode, type, isTimeType }) => {
  const { side_labels, rounds_section_headers } = useContext(IntlContext).intl.pages.activities

  const comparator = getComparator(type)

  return (
    <RoundsTable style={{ tableLayout: 'fixed' }}>
      <thead>
        <tr>
          <THeadCell>{rounds_section_headers.rounds}</THeadCell>
          <THeadCell $isTimeType={isTimeType} $eachSide={eachSide}>{rounds_section_headers.results}</THeadCell>
          <THeadCell $previous>{rounds_section_headers.previous}</THeadCell>
        </tr>
      </thead>
      <tbody>
        {rounds.map((_, i) => (
          <Round
            isFormItemDisabled={isFormItemDisabled}
            loaderDictionary={loaderDictionary}
            sideLabels={side_labels}
            comparator={comparator}
            historyDisplayMode={historyDisplayMode}
            hours={hours}
            key={i}
            totalRounds={rounds.length}
            form={form}
            isLoading={isLoading}
            eachSide={eachSide}
            isTimeType={isTimeType}
            exerciseIndex={exerciseIndex}
            round={i}
            history={history}
          />
        ))}
      </tbody>
    </RoundsTable>
  )
}

export default Rounds
