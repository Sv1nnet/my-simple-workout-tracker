import { FC } from 'react'
import { FormInstance, RadioChangeEvent, Typography } from 'antd'
import { BreakTimer, History, Note, Rounds, Timers } from './components'
import itemImagePlaceholder from 'constants/item_image_placeholder'
import routes from 'app/constants/end_points'
import { useMemo, useRef, useState } from 'react'
import { isExerciseTimeType, timeToHms } from 'app/utils/time'
import getWordByNumber from 'app/utils/getWordByNumber'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { ActivityForm, Round } from 'app/store/slices/activity/types'
import { Dayjs } from 'dayjs'
import { Exercise as TExercise } from 'app/store/slices/exercise/types'
import {
  ExerciseTitle,
  Header,
  HistoryButtonsContainer,
  HistoryContainer,
  ResultTypeButtonsContainer,
  StyledRadio,
} from './components/styled'
import { getIsAllResultWithoutPenultimateFilled, getIsAllResultsFilled } from './utils'
import { WorkoutListExercise } from 'app/store/slices/workout/types'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { selectSelectedRoundIndex, setSelectedRound } from 'app/store/slices/activity'
import { CacheFormData } from '../../types'
import { ChartIcon, TableIcon } from 'src/assets/icons'

const modeOptions = [
  { label: <ChartIcon />, value: 'chart' },
  { label: <TableIcon style={{ transform: 'scale(1, .7)' }} />, value: 'table' },
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
  exerciseList: WorkoutListExercise<number>[],
  history: any; // TODO: define history type
  form: FormInstance<ActivityForm<Dayjs>>;
  round_break: number;
  rounds: number;
  id: Pick<TExercise<number | Dayjs>, 'id'>;
  exerciseIndex: number;
  cacheFormData: CacheFormData;
}

const Exercise: FC<IExerciseProps> = ({
  roundResults,
  total,
  isFormItemDisabled,
  isHistoryLoading,
  isEdit,
  exerciseList,
  break: exerciseBreak,
  exercise,
  history: historyByDates,
  form,
  round_break,
  rounds,
  exerciseIndex,
  id,
  cacheFormData,
}) => {
  const dispatch = useAppDispatch()
  const selectedRoundIndex = useAppSelector(selectSelectedRoundIndex(id as string))

  const [ isLastRestOver, setIsLastRestOver ] = useState(false)
  const [ historyDisplayMode, setHistoryDisplayMode ] = useState<'table' | 'chart'>('table')
  const { exercises, activities, workouts } = useIntlContext().intl.pages
  const { payload } = exercises
  const { input_placeholders, input_labels, loader, side_labels, timer } = activities
  const $exercise = useRef(null)
  
  const historyByRounds = useMemo(() => {
    if (isHistoryLoading || !historyByDates) return null
    const lastResults = Array.from({ length: historyByDates.length < 6 ? historyByDates.length : 6 }, (_, i) => historyByDates[i].results)
    return lastResults.reduce(
      (prev, next) => next.map((_, i) => (prev[i] || []).concat(next[i])),
      [],
    )
  }, [ isHistoryLoading, historyByDates ])

  const handleHistoryDisplayType = ({ target: { value } }: RadioChangeEvent) => setHistoryDisplayMode(value)

  const handleResultClick = (e: React.BaseSyntheticEvent<MouseEvent>) => {
    const index = e.currentTarget.dataset.index
    dispatch(setSelectedRound({ chartId: id as string, index: index === selectedRoundIndex ? null : index }))
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

  const isAllResultsFilled = getIsAllResultsFilled(form, exercise, exerciseIndex)

  const isAllResultWithoutPenultimateFilled = getIsAllResultWithoutPenultimateFilled(form, exercise, exerciseIndex, isAllResultsFilled)

  const handleTimeOver = () => setIsLastRestOver(isAllResultWithoutPenultimateFilled)

  const isRestTimersVisible = !!round_break && !isEdit && !isAllResultsFilled
  const payloadText = [ repeats, time, weight ].filter(Boolean).map((item, i, arr) => (
    <span key={item} style={{ whiteSpace: 'nowrap' }}>
      {item}{`${arr[i + 1] !== undefined ? ' / ' : ''}`}
    </span>
  ))

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
            {payloadText.length > 0 ? payloadText : <span>&nbsp;</span>}
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
          exerciseId={id}
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
        onResultClick={handleResultClick}
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
        cacheFormData={cacheFormData}
      />
      {isRestTimersVisible && (
        <Timers
          eachSide={exercise.each_side}
          timerDictionary={timer}
          totalRounds={rounds}
          durationInSeconds={round_break}
          sideLabels={side_labels}
          onTimeOver={handleTimeOver}
        />
      )}
      {!!exerciseBreak && (
        <BreakTimer
          isEdit={isEdit}
          nextExerciseTitle={exerciseList[exerciseIndex + 1]?.exercise.title}
          isLastRestOver={isLastRestOver}
          isAllResultsFilled={isAllResultsFilled}
          workoutsDictionary={workouts}
          payloadDictionary={payload}
          exerciseBreak={exerciseBreak}
        />
      )}
      <Note
        form={form}
        isFormItemDisabled={isFormItemDisabled}
        exerciseIndex={exerciseIndex}
        inputLabels={input_labels}
        placeholder={input_placeholders.note}
      />
    </div>
  )
}

export default Exercise
