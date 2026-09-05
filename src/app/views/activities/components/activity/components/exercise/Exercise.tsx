import { FC } from 'react'
import { Button, Checkbox, Divider, Form, FormInstance, Input, RadioChangeEvent, Typography } from 'antd'
import { BreakTimer, DoneInfoModal, History, Note, Rest, Rounds, Title } from './components'
import routes from 'app/constants/end_points'
import { useMemo, useRef, useState } from 'react'
import { isExerciseTimeType, timeToHms } from 'app/utils/time'
import getWordByNumber from 'app/utils/getWordByNumber'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { ActivityForm, HistoryResult, Round } from 'app/store/slices/activity/types'
import { Dayjs } from 'dayjs'
import { Exercise as TExercise } from 'app/store/slices/exercise/types'
import {
  BreakSection,
  ExerciseTitle,
  Header,
  HistoryButtonsContainer,
  HistoryContainer,
  ImageContainer,
  StyledRadio,
  SubHeader,
} from './components/styled'
import { WorkoutListExercise } from 'app/store/slices/workout/types'
import { useAppDispatch, useAppSelector, useFixNumber, useToggle } from 'app/hooks'
import { selectSelectedRoundIndex, setSelectedRound } from 'app/store/slices/activity'
import { CacheFormData } from 'app/views/activities/components/activity/types'
import { ChartIcon, TableIcon } from 'src/assets/icons'
import { useHistoryContext } from 'app/views/activities/components/activity/contexts'
import { selectSettings } from 'app/store/slices/settings'
import { QuestionCircleOutlined } from '@ant-design/icons'

const modeOptions = [
  { label: <ChartIcon />, value: 'chart' },
  { label: <TableIcon style={{ transform: 'scale(1, .7)' }} />, value: 'table' },
]

export interface IExerciseProps {
  roundResults: {
    rounds: Round[],
    note?: string | null,
  };
  break?: number;
  isEdit?: boolean;
  isFormItemDisabled: boolean;
  details: TExercise,
  exerciseList: WorkoutListExercise<number>[],
  form: FormInstance<ActivityForm<Dayjs>>;
  round_break: number;
  rounds: number;
  id: TExercise['id'];
  exerciseIndex: number;
  cacheFormData: CacheFormData;
  orderInWorkout: number;
  itemImagePlaceholder: string;
  weight?: number,
  repeats?: number,
  time?: number,
}

const Exercise: FC<IExerciseProps> = ({
  roundResults,
  isFormItemDisabled,
  isEdit,
  exerciseList,
  break: exerciseBreak,
  details,
  form,
  round_break,
  rounds,
  exerciseIndex,
  id,
  cacheFormData,
  itemImagePlaceholder,
  weight,
  repeats: repeatsProps,
  time: timeProp,
}) => {
  const dispatch = useAppDispatch()
  const selectedRoundIndex = useAppSelector(selectSelectedRoundIndex(id as string))
  const { units } = useAppSelector(selectSettings)
  const { getByExerciseId, isLoading: isHistoryLoading } = useHistoryContext()
  const fixNumber = useFixNumber({ cutZeroes: true })

  const [ historyDisplayMode, setHistoryDisplayMode ] = useState<'table' | 'chart'>('table')
  const { intl, lang } = useIntlContext()
  const { exercises, activities, workouts } = intl.pages
  const { payload } = exercises
  const { input_placeholders, input_labels, loader, side_labels, timer } = activities
  const $exercise = useRef(null)

  const historyByDates = getByExerciseId(id)?.results

  const { state: isDone, setState: setIsDone } = useToggle(false)
  const { state: isDoneInfoOpen, setTrue: openDoneInfo, setFalse: closeDoneInfo } = useToggle(false)

  const historyByRounds = useMemo(() => {
    if (isHistoryLoading || !historyByDates) return null

    const lastResults = Array.from({ length: historyByDates.length < 6 ? historyByDates.length : 6 }, (_, i) => historyByDates[i].results)
    return lastResults.reduce<HistoryResult[][]>(
      (prev, next) => next.map((_, i) => [ ...(prev[i] || []), next[i] ]),
      [],
    )
  }, [ isHistoryLoading, historyByDates ])

  const handleHistoryDisplayType = ({ target: { value } }: RadioChangeEvent) => setHistoryDisplayMode(value)

  const handleResultClick = (e: React.BaseSyntheticEvent<MouseEvent>) => {
    const index = e.currentTarget.dataset.index
    dispatch(setSelectedRound({ chartId: id as string, index: index === selectedRoundIndex ? null : index }))
  }

  const repeats = repeatsProps ? `${repeatsProps} ${getWordByNumber(payload.repeats.short, repeatsProps, lang)}` : null
  const time = timeProp
    ? timeToHms(
      timeProp,
      {
        hms: [
          payload.time.hour.short,
          payload.time.minute.short,
          payload.time.second.short,
        ],
      },
    )
    : null
  const weightStr = weight ? `${fixNumber((+weight).toFixed(2))} ${getWordByNumber(payload.mass_unit[units], weight, lang)}` : null
  const isTimeType = isExerciseTimeType(details.type)
  const isRestTimersVisible = !!round_break && !isEdit && !isDone

  const payloadText = [ repeats, time, weightStr ].filter(Boolean).map((item, i, arr) => (
    <span key={item} style={{ whiteSpace: 'nowrap' }}>
      {item}{`${arr[i + 1] !== undefined ? ' / ' : ''}`}
    </span>
  ))

  return (
    <div ref={$exercise} style={{ marginBottom: 0 }}>
      <Header>
        <Title
          description={details.description}
        >
          <ExerciseTitle level={5}>{details.title}</ExerciseTitle>
        </Title>
        <SubHeader>
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
        </SubHeader>
      </Header>
      <HistoryContainer>
        <ImageContainer>
          <img
            style={{ maxHeight: 120, maxWidth: 120 }}
            src={details.image?.url
              ? details.image.url.startsWith('data:image/')
                ? details.image.url
                : `${routes.base}${details.image.url}`
              : itemImagePlaceholder}
          />
        </ImageContainer>
        <History
          exerciseId={id}
          isLoading={isHistoryLoading || !historyByDates}
          exerciseRef={$exercise}
          rounds={rounds}
          eachSide={details.each_side}
          type={details.type}
          loaderDictionary={loader}
          isTimeType={isTimeType}
          hours={details.hours}
          mode={historyDisplayMode}
        />
      </HistoryContainer>
      <Form.Item name={[ 'results', exerciseIndex, '_id' ]} hidden>
        <Input />
      </Form.Item>
      <Form.Item name={[ 'results', exerciseIndex, 'hours' ]} valuePropName="checked" hidden>
        <Checkbox tabIndex={-1} />
      </Form.Item>
      <Form.Item name={[ 'results', exerciseIndex, 'original_id' ]} hidden>
        <Input />
      </Form.Item>
      <Form.Item name={[ 'results', exerciseIndex, 'id_in_workout' ]} hidden>
        <Input />
      </Form.Item>
      <Form.Item name={[ 'results', exerciseIndex, 'type' ]} hidden>
        <Input />
      </Form.Item>
      <Rounds
        isTimeType={isTimeType}
        hours={details.hours}
        onResultClick={handleResultClick}
        isFormItemDisabled={isFormItemDisabled}
        historyDisplayMode={historyDisplayMode}
        eachSide={details.each_side}
        isLoading={isHistoryLoading}
        history={historyByRounds}
        loaderDictionary={loader}
        exerciseIndex={exerciseIndex}
        form={form}
        type={details.type}
        rounds={roundResults.rounds}
        cacheFormData={cacheFormData}
      />
      {isRestTimersVisible && (
        <Rest
          id={id}
          details={details}
          timer={timer}
          rounds={rounds}
          round_break={round_break}
          side_labels={side_labels}
          workoutsDictionary={workouts}
        />
      )}
      <BreakSection>
        {!!exerciseBreak && (
          <BreakTimer
            id={id}
            nextExerciseTitle={exerciseList[exerciseIndex + 1]?.details.title}
            workoutsDictionary={workouts}
            payloadDictionary={payload}
            exerciseBreak={exerciseBreak}
          />
        )}
        {!isEdit && (
          <div style={{ marginBlock: 6 }}>
            <Checkbox value={isDone} onChange={e => setIsDone(e.target.checked)}>
              <Typography.Text>{input_labels.done}</Typography.Text>
              <Button type='link' size="small" icon={<QuestionCircleOutlined />} onClick={openDoneInfo} />
            </Checkbox>
          </div>
        )}
      </BreakSection>
      
      <Note
        form={form}
        isFormItemDisabled={isFormItemDisabled}
        exerciseIndex={exerciseIndex}
        inputLabels={input_labels}
        placeholder={input_placeholders.note}
        cacheFormData={cacheFormData}
      />

      <Divider style={{ margin: '18px 0 13px' }} />

      <DoneInfoModal
        isOpen={isDoneInfoOpen}
        onOk={closeDoneInfo}
      />
    </div>
  )
}

export default Exercise
