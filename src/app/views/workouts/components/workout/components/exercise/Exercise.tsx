
import { useRef } from 'react'
import TimePicker from 'app/components/time_picker/TimePicker'
import { DeleteFilled, DownOutlined, UpOutlined } from '@ant-design/icons'
import { Button, Checkbox, Divider, Form, Select } from 'antd'
import { Rule } from 'antd/lib/form'
import { Input as CustomInput } from 'app/components'
import {
  ExerciseOption,
  StyledFormItem,
  ShortFormItem,
  DeleteButton,
} from 'app/views/workouts/components/workout/components'
import { ExerciseContainer, MoveExerciseButtonContainer, StyledSelect } from './components/styled'

const Exercise = ({
  exerciseAmount,
  fields,
  isFormItemDisabled,
  validate,
  form,
  dictionary,
  errorsDictionary,
  index,
  isEditMode,
  isFetching,
  payload,
  exerciseList,
  onExerciseChange,
  remove,
  isInActivity,
}) => {
  const $container = useRef(null)
  const requiredRules = isEditMode ? [ { required: true, message: errorsDictionary.common.required } ] : []
  const handleExerciseChange = onExerciseChange(index, 'rounds')
  const hasTopButton = index !== 0
  const hasBottomButton = index !== exerciseAmount - 1

  const handleChangeOrder = (order: number) => onExerciseChange(index, 'order', order, $container)

  return (
    <ExerciseContainer ref={$container}>
      <Divider style={{ marginBottom: '16px', marginTop: '6px' }} />
      {isEditMode && !isInActivity && (
        <MoveExerciseButtonContainer $hasBottomButton={hasBottomButton} $hasTopButton={hasTopButton}>
          {hasTopButton && <Button onClick={handleChangeOrder(-1)} size="small" type="text"><UpOutlined /></Button>}
          {hasBottomButton && <Button onClick={handleChangeOrder(1)} size="small" type="text"><DownOutlined /></Button>}
        </MoveExerciseButtonContainer>
      )}
      {isEditMode && !isInActivity && fields.length !== 1 && <DeleteButton disabled={isFetching} danger type="text" size="large" onClick={() => remove(index)}><DeleteFilled /></DeleteButton>}

      <Form.Item label={dictionary.input_labels.exercise} name={[ index, 'id' ]} rules={requiredRules}>
        <StyledSelect disabled={isFormItemDisabled || isInActivity} size="large">
          {exerciseList.data.map(exercise => (
            <Select.Option value={exercise.id} key={exercise.id} disabled={exercise.archived}>
              <ExerciseOption {...exercise} payloadDictionary={payload} />
            </Select.Option>
          ))}
        </StyledSelect>
      </Form.Item>

      <StyledFormItem>
        <ShortFormItem
          name={[ index, 'rounds' ]}
          label={dictionary.input_labels.rounds}
          rules={[
            ...requiredRules,
            validate as Rule,
          ]}
          $margin
        >
          <CustomInput.Number
            int
            placeholder={dictionary.placeholders.rounds}
            onlyPositive
            disabled={isFormItemDisabled || isInActivity}
            onChange={handleExerciseChange}
            onBlur={handleExerciseChange}
            size="large"
          />
        </ShortFormItem>
        <ShortFormItem name={[ index, 'round_break' ]} label={dictionary.input_labels.round_break} rules={requiredRules}>
          <TimePicker
            inputReadOnly
            allowClear={false}
            disabled={isFormItemDisabled}
            onChange={onExerciseChange(index, 'round_break')}
            showNow={false}
            size="large"
            placeholder=""
          />
        </ShortFormItem>
      </StyledFormItem>

      {(isEditMode || form.getFieldValue([ 'exercises', index, 'break_enabled' ])) && (
        <StyledFormItem shouldUpdate>
          {({ getFieldValue }) => {
            const breakEnabled = getFieldValue([ 'exercises', index, 'break_enabled' ])
            return (
              <>
                <ShortFormItem name={[ index, 'break' ]} label={dictionary.input_labels.break} $margin rules={breakEnabled ? requiredRules : []}>
                  <TimePicker
                    allowClear={false}
                    inputReadOnly
                    disabled={isFormItemDisabled || !breakEnabled}
                    onChange={onExerciseChange(index, 'break')}
                    showNow={false}
                    size="large"
                    placeholder=""
                  />
                </ShortFormItem>
                <ShortFormItem
                  name={[ index, 'break_enabled' ]}
                  valuePropName="checked"
                  $checkbox
                >
                  <Checkbox
                    onChange={onExerciseChange(index, 'break_enabled')}
                    disabled={isFormItemDisabled}
                  >
                    {dictionary.input_labels.break_enabled}
                  </Checkbox>
                </ShortFormItem>
              </>
            )
          }}
        </StyledFormItem>
      )}
      {index === fields.length - 1 && isEditMode && <Divider style={{ marginTop: '6px' }} />}
    </ExerciseContainer>
  )
}
export default Exercise
