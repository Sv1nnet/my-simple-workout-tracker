import { Input, TimePicker } from '@/src/app/components'
import { Form, Typography } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
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
`

const RoundsBodyContainer = styled.div`
  display: flex;
  align-items: center;
  /* flex-wrap: wrap; */
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

// const RoundItem = styled.span`
//   display: block;
//   text-align: center;
// `

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

const StyledTimePicker = styled(TimePicker)`
  width: 95px;
`

const Round = ({ history, form, exerciseIndex, hours, round, eachSide, isTimeType }) => {
  const handleRepeatsChange = (value, { target }) => {
    const results = [ ...form.getFieldValue('results') ]
    if (eachSide) {
      results[exerciseIndex][1][round].type = results[exerciseIndex][1][round].type
      results[exerciseIndex][1][round].value[target.dataset.side] = value
    } else {
      results[exerciseIndex][1][round].type = results[exerciseIndex][1][round].type
      results[exerciseIndex][1][round].value = value
    }
    form.setFieldsValue({ results })
  }

  return (
    <RoundsBodyContainer>
      <RoundItem style={{ flexShrink: 0 }}>{round + 1}</RoundItem>
      <RoundItem style={{ flexShrink: 0 }} $eachSide={eachSide}>
        {!isTimeType
          ? eachSide
            ? (
              <>
                <Form.Item name={[ 'results', exerciseIndex, 1, round, 'value', 'right' ]} noStyle>
                  <div style={{ display: 'flex' }}>
                    <RoundText type="secondary">R: </RoundText>
                    <Input.Number
                      data-side="right"
                      positive
                      // disabled={isFormItemDisabled}
                      style={{ textAlign: 'center' }}
                      onBlur={handleRepeatsChange}
                      size="small"
                    />
                  </div>
                </Form.Item>
                <Form.Item name={[ 'results', exerciseIndex, 1, round, 'value', 'left' ]} noStyle>
                  <div style={{ display: 'flex' }}>
                    <RoundText type="secondary">L: </RoundText>
                    <Input.Number
                      data-side="left"
                      positive
                      // disabled={isFormItemDisabled}
                      style={{ textAlign: 'center' }}
                      onBlur={handleRepeatsChange}
                      size="small"
                    />
                  </div>
                </Form.Item>
              </>
            )
            : (
              <Form.Item name={[ 'results', exerciseIndex, 1, round, 'value' ]} noStyle>
                <Input.Number
                  positive
                  // disabled={isFormItemDisabled}
                  style={{ textAlign: 'center' }}
                  onBlur={handleRepeatsChange}
                  size="small"
                />
              </Form.Item>
            )
          : eachSide
            ? (
              <>
                <Form.Item name={[ 'results', exerciseIndex, 1, round, 'value', 'right' ]} noStyle>
                  <div style={{ display: 'flex' }}>
                    <RoundText type="secondary">R: </RoundText>
                    <StyledTimePicker
                      // disabled={!isEditMode || isFetching}
                      data-side="right"
                      inputReadOnly
                      showNow={false}
                      size="small"
                      allowClear={false}
                      placeholder=""
                    />
                  </div>
                </Form.Item>
                <Form.Item name={[ 'results', exerciseIndex, 1, round, 'value', 'left' ]} noStyle>
                  <div style={{ display: 'flex' }}>
                    <RoundText type="secondary">L: </RoundText>
                    <StyledTimePicker
                      // disabled={!isEditMode || isFetching}
                      data-side="left"
                      inputReadOnly
                      showNow={false}
                      size="small"
                      allowClear={false}
                      placeholder=""
                    />
                  </div>
                </Form.Item>
              </>
            )
            : (
              <Form.Item name={[ 'results', exerciseIndex, 1, round, 'value' ]} noStyle>
                <StyledTimePicker
                // disabled={!isEditMode || isFetching}
                  inputReadOnly
                  showNow={false}
                  size="small"
                  allowClear={false}
                  placeholder=""
                />
              </Form.Item>
            )}
      </RoundItem>
      <RoundItem $previous>
        {eachSide
          ? (
            <>
              <div style={{ display: 'flex' }}>
                {history[round].length < 6
                  ? history[round].map((el, i, arr) => (
                    <PreviousItemContainer key={i}>
                      <PreviousItem curr={el.right} prev={arr[i + 1].right} isTimeType={isTimeType} hours={hours} />
                      <PreviousItem curr={el.left} prev={arr[i + 1].left} isTimeType={isTimeType} hours={hours} />
                    </PreviousItemContainer>
                  ))
                  : history[round].map((el, i, arr) => i !== arr.length - 1 && (
                    <PreviousItemContainer key={i}>
                      <PreviousItem curr={el.right} prev={arr[i + 1].right} isTimeType={isTimeType} hours={hours} />
                      <PreviousItem curr={el.left} prev={arr[i + 1].left} isTimeType={isTimeType} hours={hours} />
                    </PreviousItemContainer>
                  ))}
              </div>
            </>
          )
          : (
            <div style={{ display: 'flex' }}>
              {history[round].length < 6
                ? history[round].map((el, i, arr) => (
                  <PreviousItemContainer key={i}>
                    <PreviousItem curr={el} prev={arr[i + 1]} isTimeType={isTimeType} hours={hours} />
                  </PreviousItemContainer>
                ))
                : history[round].map((el, i, arr) => i !== arr.length - 1 && (
                  <PreviousItemContainer key={i}>
                    <PreviousItem curr={el} prev={arr[i + 1]} isTimeType={isTimeType} hours={hours} />
                  </PreviousItemContainer>
                ))}
            </div>
          )}
      </RoundItem>
    </RoundsBodyContainer>
  )
}


const RoundBody = ({ history, isTimeType, hours, rounds, form, exerciseIndex, eachSide }) => {
  const [ , results ] = rounds[exerciseIndex]

  // if (eachSide) {
  //   return results.map((_, i) => (
  //     <React.Fragment key={i}>
  //       <Round
  //         hours={hours}
  //         key={i}
  //         form={form}
  //         side="r"
  //         isTimeType={isTimeType}
  //         exerciseIndex={exerciseIndex}
  //         round={i}
  //         history={history}
  //       />
  //       <Round
  //         hours={hours}
  //         key={i}
  //         form={form}
  //         side="l"
  //         isTimeType={isTimeType}
  //         exerciseIndex={exerciseIndex}
  //         round={i}
  //         history={history}
  //       />
  //     </React.Fragment>
  //   ))
  // }

  return results.map((_, i) => (
    <Round
      hours={hours}
      key={i}
      form={form}
      eachSide={eachSide}
      isTimeType={isTimeType}
      exerciseIndex={exerciseIndex}
      round={i}
      history={history}
    />
  ))
}

const Rounds = ({ form, history, rounds, exerciseIndex, eachSide }) => {
  const type = form.getFieldValue([ 'results', exerciseIndex, 0, 1, 'type' ])
  const hours = form.getFieldValue([ 'results', exerciseIndex, 0, 1, 'hours' ])
  const isTimeType = type === 'time'

  return (
    <div>
      <RoundsHeader>
        <RoundItem>Rounds</RoundItem>
        <RoundItem $isTimeType={isTimeType} $eachSide={eachSide} style={{ paddingLeft: '15px' }}>Repeats</RoundItem>
        <RoundItem $previous $header>Previous</RoundItem>
      </RoundsHeader>
      <RoundBody
        isTimeType={isTimeType}
        hours={hours}
        rounds={rounds}
        form={form}
        eachSide={eachSide}
        exerciseIndex={exerciseIndex}
        history={history}
      />
    </div>
  )
}

export default Rounds
