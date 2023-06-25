import { Form, FormInstance } from 'antd'
import { colors } from '../../../chart/utils'
import { LegendItem, PreviousLoader, SideNumberInput, SideTimePicker, StyledTd, StyledTimePicker } from '../styled'
import Input from 'app/components/input'
import PreviousRoundsHistory from '../../../previous_rounds_history/PreviousRoundsHistory'
import { ActivityForm, HistoryResult } from 'app/store/slices/activity/types'
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
  onResultClick: Function;
}

const Round = ({
  comparator,
  onResultClick,
  totalRounds,
  isFormItemDisabled,
  loaderDictionary,
  isLoading,
  history,
  form,
  exerciseIndex,
  hours,
  round,
  eachSide,
  isTimeType,
  historyDisplayMode,
  sideLabels,
  cacheFormData,
}) => {
  const results = Form.useWatch([ 'results', exerciseIndex, 'rounds' ], form)

  const handleRepeatsChange = (value, { target }) => {
    const _results = [ ...form.getFieldValue('results') ]

    if (eachSide) _results[exerciseIndex].rounds[round][target.dataset.side] = value
    else _results[exerciseIndex].rounds[round] = value

    form.setFieldsValue({ results: _results })
    cacheFormData([ 'results' ], form.getFieldsValue())
  }

  const isChartMode = historyDisplayMode === 'chart'

  return (
    <tr>
      <StyledTd data-index={round} onClick={isChartMode ? onResultClick : undefined}>
        {isChartMode
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
                    maxDigitsAfterPoint={3}
                  />
                </Form.Item>
                <Form.Item name={[ 'results', exerciseIndex, 'rounds', round, 'left' ]} noStyle>
                  <SideNumberInput
                    autoComplete="off"
                    disabled={isFormItemDisabled}
                    dataSide="left"
                    onBlur={handleRepeatsChange}
                    roundText={`${sideLabels.left.short}: `}
                    maxDigitsAfterPoint={3}
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
                  maxDigitsAfterPoint={3}
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
                    current={results}
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
