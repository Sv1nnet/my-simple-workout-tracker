import styled from 'styled-components'
import TimePicker from 'app/components/time_picker/TimePicker'
import { DeleteFilled } from '@ant-design/icons'
import { Checkbox, Divider, Form, Select } from 'antd'
import { Rule } from 'antd/lib/form'
import { Input as CustomInput } from 'app/components'
import {
  ExerciseOption,
  StyledFormItem,
  ShortFormItem,
  DeleteButton,
} from 'app/views/workouts/components/workout/components'

const ExerciseContainer = styled.div`
  position: relative;
`

const StyledSelect = styled(Select)`
  &.ant-select-disabled .ant-typography {
    color: rgba(0, 0, 0, 0.45);
  }
`

const Exercise = ({ fields, isFormItemDisabled, validate, form, dictionary, errorsDictionary, index, isEditMode, isFetching, payload, exerciseList, onExerciseChange, remove }) => {
  const requiredRules = isEditMode ? [ { required: true, message: errorsDictionary.common.required } ] : []

  return (
    <ExerciseContainer>
      <Divider style={{ marginBottom: '16px', marginTop: '6px' }} />
      {isEditMode && fields.length !== 1 && <DeleteButton disabled={isFetching} danger type="text" size="large" onClick={() => remove(index)}><DeleteFilled /></DeleteButton>}

      <Form.Item label={dictionary.exercise} name={[ index, 'id' ]} rules={requiredRules}>
        <StyledSelect disabled={isFormItemDisabled} size="large">
          {exerciseList.data.map(exercise => (
            <Select.Option value={exercise.id} key={exercise.id}>
              <ExerciseOption {...exercise} payloadDictionary={payload} />
            </Select.Option>
          ))}
        </StyledSelect>
      </Form.Item>

      <StyledFormItem>
        <ShortFormItem
          name={[ index, 'rounds' ]}
          label={dictionary.rounds}
          rules={[
            ...requiredRules,
            validate as Rule,
          ]}
          $margin
        >
          <CustomInput.Number int positive disabled={isFormItemDisabled} onChange={onExerciseChange(index, 'rounds')} onBlur={onExerciseChange(index, 'rounds')} size="large" />
        </ShortFormItem>
        <ShortFormItem name={[ index, 'round_break' ]} label={dictionary.break} rules={requiredRules}>
          <TimePicker
            inputReadOnly
            allowClear={false}
            disabled={!isEditMode || isFetching}
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
                <ShortFormItem name={[ index, 'break' ]} label={dictionary.break} $margin rules={breakEnabled ? requiredRules : []}>
                  <TimePicker
                    allowClear={false}
                    inputReadOnly
                    disabled={!isEditMode || isFetching || !breakEnabled}
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
                    {dictionary.break_enabled}
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
