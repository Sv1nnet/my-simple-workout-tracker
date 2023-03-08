import { Form, FormInstance } from 'antd'
import { colors } from '../../../chart/Chart'
import { LegendItem, PreviousLoader, SideNumberInput, SideTimePicker, StyledTd, StyledTimePicker } from '../styled'
import Input from '@/src/app/components/input'
import PreviousRoundsHistory from '../../../previous_rounds_history/PreviousRoundsHistory'
import { ActivityForm, HistoryResult } from '@/src/app/store/slices/activity/types'
import dayjs from 'dayjs'

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
  history: HistoryResult,
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
                  <SideNumberInput
                    autoComplete="off"
                    disabled={isFormItemDisabled}
                    dataSide="right"
                    onBlur={handleRepeatsChange}
                    roundText={`${sideLabels.right.short}: `}
                  />
                </Form.Item>
                <Form.Item name={[ 'results', exerciseIndex, 'rounds', round, 'left' ]} noStyle>
                  <SideNumberInput
                    autoComplete="off"
                    disabled={isFormItemDisabled}
                    dataSide="left"
                    onBlur={handleRepeatsChange}
                    roundText={`${sideLabels.left.short}: `}
                  />
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
                  autoComplete="off"
                />
              </Form.Item>
            )
          : eachSide
            ? (
              <>
                <Form.Item name={[ 'results', exerciseIndex, 'rounds', round, 'right' ]} noStyle>
                  <SideTimePicker
                    disabled={isFormItemDisabled}
                    roundText={`${sideLabels.right.short}: `}
                    hours={hours}
                    dataSide="right"
                  />
                </Form.Item>
                <Form.Item name={[ 'results', exerciseIndex, 'rounds', round, 'left' ]} noStyle>
                  <SideTimePicker
                    disabled={isFormItemDisabled}
                    roundText={`${sideLabels.left.short}: `}
                    hours={hours}
                    dataSide="left"
                  />
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

export default Round
