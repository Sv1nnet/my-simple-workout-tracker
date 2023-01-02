import { FC } from 'react'
import styled from 'styled-components'
import { Button, Form, FormInstance, Input, Radio, Typography } from 'antd'
import { History, Rounds, Timers } from './components'
import itemImagePlaceholder from 'constants/item_image_placeholder'
import routes from 'app/constants/end_points'
import { useContext, useMemo, useRef, useState } from 'react'
import { isExerciseTimeType, timeToHms } from 'app/utils/time'
import getWordByNumber from 'app/utils/getWordByNumber'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'
import { ActivityForm, Round } from '@/src/app/store/slices/activity/types'
import { Dayjs } from 'dayjs'
import { Exercise as TExercise } from '@/src/app/store/slices/exercise/types'

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`

const HistoryContainer = styled.div`
  display: flex;
  overflow: hidden;
`

const HistoryButtonsContainer = styled.div`
  text-align: right;
  margin-bottom: 5px;
`

const StyledRadio = styled(Radio.Group)`
  & > label.ant-radio-button-wrapper {
    border-width: 2px;
  }
`

const HistoryButtonIcon = styled.img`
  position: relative;
  top: -2px;
  ${({ $table }) => $table ? 'transform: scale(1, .7);' : ''}
`

const AddRemoveNoteButton = styled(Button)`
  margin-top: 10px;
`

const ResultTypeButtonsContainer = styled.div`
  text-align: right;
`

const ExerciseTitle = styled(Typography.Title)`
  margin-bottom: 0;
  line-height: 1;
`

const modeOptions = [
  { label: <HistoryButtonIcon src="/icons/chart.svg" alt="chart" />, value: 'chart' },
  { label: <HistoryButtonIcon $table src="/icons/table.svg" alt="table" />, value: 'table' },
]


export interface IExerciseProps {
  roundResults: {
    rounds: Round[],
    note?: string,
  };
  total: number;
  break?: number;
  isEdit?: boolean;
  isFormItemDisabled: boolean;
  isHistoryLoading: boolean;
  exercise: TExercise<number | Dayjs>,
  history: any; // TODO: define history type
  form: FormInstance<ActivityForm<Dayjs>>;
  round_break: number;
  rounds: number;
  id: Pick<TExercise<number | Dayjs>, 'id'>;
  exerciseIndex: number;
}

// TODO: пофиксить баг - при выборе тренировок, в случае если по индексу
// в списке идет то же упражнение, то результаты для него не обновляются
const Exercise: FC<IExerciseProps> = ({
  roundResults,
  total,
  isFormItemDisabled,
  isHistoryLoading,
  isEdit,
  break: exerciseBreak,
  exercise,
  history: historyByDates,
  form,
  round_break,
  rounds,
  exerciseIndex,
}) => {
  const [ showNote, setShowNote ] = useState(form.getFieldValue([ 'results', exerciseIndex, 'note' ]))
  const [ historyDisplayMode, setHistoryDisplayMode ] = useState<'table' | 'chart'>('table')
  const { exercises, activities, workouts } = useContext(IntlContext).intl.pages
  const { payload } = exercises
  const { input_placeholders, input_labels, loader, side_labels } = activities
  const $exercise = useRef(null)
  
  const historyByRounds = useMemo(() => {
    if (isHistoryLoading || !historyByDates) return null
    const lastResults = Array.from({ length: historyByDates.length < 6 ? historyByDates.length : 6 }, (_, i) => historyByDates[i].results)
    return lastResults.reduce(
      (prev, next) => next.map((_, i) => (prev[i] || []).concat(next[i])),
      [],
    )
  }, [ isHistoryLoading, historyByDates ])

  const handleHistoryDisplayType = ({ target: { value } }) => setHistoryDisplayMode(value)

  const handleHideNote = () => {
    setShowNote(false)
    const results = [ ...form.getFieldValue('results') ]
    results[exerciseIndex].note = null
    form.setFieldsValue({ results })
  }

  let { repeats: _repeats, time: _time, weight, mass_unit } = exercise

  const repeats = _repeats ? `${_repeats} ${getWordByNumber(payload.repeats.short, _repeats)}` : null
  const time = _time
    ? timeToHms(
      _time,
      {
        hms: [
          payload.time.hour.short,
          payload.time.minute.short,
          payload.time.second.short,
        ],
      },
    )
    : null
  weight = weight ? `${weight} ${payload.mass_unit[mass_unit][0]}` : null

  const isTimeType = isExerciseTimeType(exercise.type)

  return (
    <div ref={$exercise} style={{ marginBottom: '10px' }}>
      <Header>
        <div>
          <ExerciseTitle level={5}>{exercise.title}</ExerciseTitle>
          <Typography.Text type="secondary">
            {workouts.input_labels.round_break}: {timeToHms(round_break, {
              hms: [
                payload.time.hour.short,
                payload.time.minute.short,
                payload.time.second.short,
              ],
            })}
          </Typography.Text>
        </div>
        <ResultTypeButtonsContainer>
          <Typography.Text>
            {[ repeats, time, weight ].filter(Boolean).map((item, i, arr) => (
              <span key={item} style={{ whiteSpace: 'nowrap' }}>
                {item}{`${arr[i + 1] !== undefined ? ' / ' : ''}`}
              </span>
            )) || <span>&nbsp;</span>}
          </Typography.Text>
          <HistoryButtonsContainer>
            <StyledRadio
              options={modeOptions}
              value={historyDisplayMode}
              onChange={handleHistoryDisplayType}
              size="small"
              optionType="button"
            />
          </HistoryButtonsContainer>
        </ResultTypeButtonsContainer>
      </Header>
      <HistoryContainer>
        <img
          width={120}
          height={120}
          src={exercise.image?.url ? `${routes.base}${exercise.image.url}` : itemImagePlaceholder}
        />
        <History
          isLoading={isHistoryLoading || !historyByDates}
          total={total}
          exerciseRef={$exercise}
          history={historyByDates}
          rounds={rounds}
          eachSide={exercise.each_side}
          type={exercise.type}
          loaderDictionary={loader}
          isTimeType={isTimeType}
          hours={exercise.hours}
          mode={historyDisplayMode}
        />
      </HistoryContainer>
      <Rounds
        isTimeType={isTimeType}
        hours={exercise.hours}
        isFormItemDisabled={isFormItemDisabled}
        historyDisplayMode={historyDisplayMode}
        eachSide={exercise.each_side}
        isLoading={isHistoryLoading}
        history={historyByRounds}
        loaderDictionary={loader}
        exerciseIndex={exerciseIndex}
        form={form}
        type={exercise.type}
        rounds={roundResults.rounds}
      />
      {!!round_break && !isEdit && (
        <Timers eachSide={exercise.each_side} durationInSeconds={round_break} sideLabels={side_labels} />
      )}
      {!!exerciseBreak && (
        <div style={{ marginTop: '10px' }}>
          <Typography.Text>
            {workouts.input_labels.break}: {timeToHms(exerciseBreak, {
              hms: [
                payload.time.hour.short,
                payload.time.minute.short,
                payload.time.second.short,
              ],
            })}
          </Typography.Text></div>
      )}
      {
        !showNote
          ? (
            <AddRemoveNoteButton disabled={isFormItemDisabled} size="small" onClick={() => setShowNote(true)}>
              {input_labels.add_note}
            </AddRemoveNoteButton>
          )
          : (
            <AddRemoveNoteButton disabled={isFormItemDisabled} size="small" onClick={handleHideNote}>
              {input_labels.remove_note}
            </AddRemoveNoteButton>
          )
      }
      {showNote && (
        <Form.Item name={[ 'results', exerciseIndex, 'note' ]}>
          <Input.TextArea
            disabled={isFormItemDisabled}
            autoFocus
            style={{ marginTop: '10px' }}
            placeholder={input_placeholders.note}
            showCount
            maxLength={120}
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
        </Form.Item>
      )}
    </div>
  )
}

export default Exercise
