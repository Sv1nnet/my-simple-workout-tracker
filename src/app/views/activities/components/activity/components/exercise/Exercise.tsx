import styled from 'styled-components'
import { Button, Form, Input, Radio, Typography } from 'antd'
import { History, Rounds } from './components'
import itemImagePlaceholder from 'constants/item_image_placeholder'
import routes from 'app/constants/end_points'
import { useContext, useMemo, useRef, useState } from 'react'
import { timeToHms } from 'app/utils/time'
import getWordByNumber from 'app/utils/getWordByNumber'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'

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
  /* display: flex;
  flex-direction: column;
  align-items: flex-end; */
  text-align: right;
`

const modeOptions = [
  { label: <HistoryButtonIcon src="/icons/chart.svg" alt="chart" />, value: 'chart' },
  { label: <HistoryButtonIcon $table src="/icons/table.svg" alt="table" />, value: 'table' },
]

/*
break: 180
break_enabled: true
exercise: {
  each_side: false
  id: "625f17f7bd914948431bcb60"
  image: {
    uid: 'rc-upload-1650396875360-2',
    uuid: 'YL-K4ND7fsHBU2UTz1bYb',
    name: 'pull-ups.jpeg',
    url: '/uploads/61e4445e0c3fba6d031ae67d/625f17f7bd914948431bcb60/YL-K4ND7fsHBU2UTz1bYb_pull-ups.jpeg',
    uploaded_at: 1650399223269
  }
  mass_unit: "kg"
  title: "Wide pull ups"
  type: "repeats"
}
id: "625f17f7bd914948431bcb60"
round_break: 90
rounds: 4
_id: "62605e50bd914948431bcbae"
*/

const Exercise = ({
  roundResults,
  total,
  break: exerciseBreak,
  exercise,
  history: _history,
  form,
  round_break,
  rounds,
  id,
  exerciseIndex,
}) => {
  const [ showNote, setShowNote ] = useState(false)
  const [ historyDisplayMode, setHistoryDisplayMode ] = useState('table')
  const { payload, modal } = useContext(IntlContext).intl.pages.exercises
  const $exercise = useRef(null)

  const history = useMemo(() => {
    const lastResults = Array.from({ length: _history.length < 6 ? _history.length : 6 }, (_, i) => _history[i][1].results)
    return lastResults.reduce(
      (prev, next) => next.map((_, i) => (prev[i] || []).concat(next[i])),
      [],
    )
  }, [ _history ])

  const handleHistoryDisplayType = ({ target: { value } }) => setHistoryDisplayMode(value)

  const handleHideNote = () => {
    setShowNote(false)
    const results = [ ...form.getFieldValue('results') ]
    results[exerciseIndex][2] = undefined
    form.setFieldsValue({ results })
  }

  let { repeats, time, weight, mass_unit } = exercise

  // repeats = 10
  // time = 75
  // weight = 15

  repeats = repeats ? `${repeats} ${getWordByNumber(payload.repeats.short, repeats)}` : null
  time = time
    ? timeToHms(
      time,
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

  return (
    <div ref={$exercise} style={{ marginBottom: '10px' }}>
      <Header>
        <div>
          <Typography.Title level={5} style={{ marginBottom: 0, lineHeight: 1 }}>{exercise.title}</Typography.Title>
          <Typography.Text type="secondary">Rest: {timeToHms(round_break)}</Typography.Text>
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
          total={total}
          exerciseRef={$exercise}
          history={_history}
          rounds={rounds}
          eachSide={exercise.each_side}
          exerciseId={id}
          mode={historyDisplayMode}
        />
      </HistoryContainer>
      <Rounds eachSide={exercise.each_side} history={history} exerciseIndex={exerciseIndex} form={form} rounds={roundResults} />
      {!!exerciseBreak && <div style={{ marginTop: '10px' }}><Typography.Text>Break: {timeToHms(exerciseBreak)}</Typography.Text></div>}
      {
        !showNote
          ? (
            <AddRemoveNoteButton size="small" onClick={() => setShowNote(true)}>
              Add a note
            </AddRemoveNoteButton>
          )
          : (
            <AddRemoveNoteButton size="small" onClick={handleHideNote}>
              Remove the note
            </AddRemoveNoteButton>
          )
      }
      {showNote && (
        <Form.Item name={[ 'results', exerciseIndex, 2 ]}>
          <Input.TextArea autoFocus style={{ marginTop: '10px' }} placeholder="Note..." disabled={false} showCount maxLength={120} autoSize={{ minRows: 1, maxRows: 4 }} />
        </Form.Item>
      )}
    </div>
  )
}

export default Exercise
