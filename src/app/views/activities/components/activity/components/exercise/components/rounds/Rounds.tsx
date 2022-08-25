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
import PreviousItem from '../previous_item/PreviousItem'

const RoundsHeader = styled.div`
  display: flex;
`

const RoundItem = styled.span`
  margin-top: 10px;
  flex-basis: ${({ $previous, $eachSide }) => !$previous ? `${$eachSide ? '80px' : '65px'}` : 'auto'};
  flex-grow: ${({ $previous }) => !$previous ? '0' : '1'};
  ${({ $isTimeType, $eachSide }) => $isTimeType ? `flex-basis: ${$eachSide ? '110px' : '95px'}` : ''};
  ${({ $previous }) => $previous ? `
    display: flex;
    overflow-x: scroll;
    margin-left: 15px;
    width: 50%;
  ` : ''}
  ${({ $header }) => $header ? 'display: block;' : ''}
  flex-shrink: 0;
  text-align: center;
  flex-wrap: wrap;
  ${({ $round }) => $round ? `
    text-align: center;
    padding: 0 5px;
  ` : ''}
`

const RoundsBodyContainer = styled.div`
  display: flex;
  align-items: center;
`

const PreviousItemContainer = styled.div`
  margin-right: 5px;
  &:not(:last-of-type) {
    padding-right: 2px;
    border-right: 2px solid lightgrey;
  }
`

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

export interface ISideNumberInput {
  dataSide: string;
  roundText: string;
  disabled: boolean;
  onBlur: Function;
}

const SideNumberInput: FC<ISideNumberInput> = ({ dataSide, roundText, ...props }) => (
  <div style={{ display: 'flex', marginTop: 5 }}>
    <RoundText type="secondary">{roundText}</RoundText>
    <Input.Number
      data-side={dataSide}
      positive
      style={{ textAlign: 'center' }}
      size="small"
      {...props}
    />
  </div>
)

export interface ISideTimePicker {
  dataSide: string;
  roundText: string;
  hours: boolean;
  disabled: boolean;
}

const SideTimePicker: FC<ISideTimePicker> = ({ dataSide, roundText, hours, ...props }) => (
  <div style={{ display: 'flex', marginTop: 5 }}>
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
  </div>
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

const Round: FC<IRound> = ({ comparator, isFormItemDisabled, loaderDictionary, isLoading, history, form, exerciseIndex, hours, round, eachSide, isTimeType, historyDisplayMode, sideLabels }) => {
  const handleRepeatsChange = (value, { target }) => {
    const results = [ ...form.getFieldValue('results') ]

    if (eachSide) results[exerciseIndex].rounds[round][target.dataset.side] = value
    else results[exerciseIndex].rounds[round] = value

    form.setFieldsValue({ results })
  }

  return (
    <RoundsBodyContainer>
      <RoundItem style={{ flexShrink: 0 }} $round>
        {historyDisplayMode === 'chart'
          ? (
            <LegendItem $color={colors[round]}>
              <span>{round + 1}</span>
            </LegendItem>
          )
          : <span>{round + 1}</span>}
      </RoundItem>
      <RoundItem style={{ flexShrink: 0, flexBasis: isTimeType && !hours ? '95px' : '65px' }} $eachSide={eachSide}>
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
                  positive
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
      </RoundItem>
      {isLoading || !history
        ? <PreviousLoader>{loaderDictionary.previous_loading}</PreviousLoader>
        : (
          <RoundItem $previous>
            {eachSide
              ? (
                <>
                  <div style={{ display: 'flex' }}>
                    {(history[round] ?? []).length < 6
                      ? (history[round] ?? []).map((el, i, arr) => (
                        <PreviousItemContainer key={i}>
                          <PreviousItem comparator={comparator} curr={el.right} prev={arr[i + 1]?.right} isTimeType={isTimeType} hours={hours} />
                          <PreviousItem comparator={comparator} curr={el.left} prev={arr[i + 1]?.left} isTimeType={isTimeType} hours={hours} marginTop={5} />
                        </PreviousItemContainer>
                      ))
                      : (history[round] ?? []).map((el, i, arr) => i !== arr.length - 1 && (
                        <PreviousItemContainer key={i}>
                          <PreviousItem comparator={comparator} curr={el.right} prev={arr[i + 1]?.right} isTimeType={isTimeType} hours={hours} />
                          <PreviousItem comparator={comparator} curr={el.left} prev={arr[i + 1]?.left} isTimeType={isTimeType} hours={hours} marginTop={5} />
                        </PreviousItemContainer>
                      ))}
                  </div>
                </>
              )
              : (
                <div style={{ display: 'flex' }}>
                  {(history[round] ?? []).length < 6
                    ? (history[round] ?? []).map((el, i, arr) => (
                      <PreviousItemContainer key={i}>
                        <PreviousItem comparator={comparator} curr={el} prev={arr[i + 1]} isTimeType={isTimeType} hours={hours} />
                      </PreviousItemContainer>
                    ))
                    : (history[round] ?? []).map((el, i, arr) => i !== arr.length - 1 && (
                      <PreviousItemContainer key={i}>
                        <PreviousItem comparator={comparator} curr={el} prev={arr[i + 1]} isTimeType={isTimeType} hours={hours} />
                      </PreviousItemContainer>
                    ))}
                </div>
              )}
          </RoundItem>
        )}
    </RoundsBodyContainer>
  )
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

const Rounds: FC<IRounds> = ({ loaderDictionary, isFormItemDisabled, isLoading, form, history, rounds, hours, exerciseIndex, eachSide, historyDisplayMode, type, isTimeType }) => {
  const { side_labels, rounds_section_headers } = useContext(IntlContext).intl.pages.activities

  const comparator = getComparator(type)

  return (
    <div>
      <RoundsHeader>
        <RoundItem>{rounds_section_headers.rounds}</RoundItem>
        <RoundItem $isTimeType={isTimeType} $eachSide={eachSide} style={eachSide ? { paddingLeft: '15px' } : null}>{rounds_section_headers.results}</RoundItem>
        <RoundItem $previous $header>{rounds_section_headers.previous}</RoundItem>
      </RoundsHeader>
      {rounds.map((_, i) => (
        <Round
          isFormItemDisabled={isFormItemDisabled}
          loaderDictionary={loaderDictionary}
          sideLabels={side_labels}
          comparator={comparator}
          historyDisplayMode={historyDisplayMode}
          hours={hours}
          key={i}
          form={form}
          isLoading={isLoading}
          eachSide={eachSide}
          isTimeType={isTimeType}
          exerciseIndex={exerciseIndex}
          round={i}
          history={history}
        />
      ))}
    </div>
  )
}

export default Rounds
