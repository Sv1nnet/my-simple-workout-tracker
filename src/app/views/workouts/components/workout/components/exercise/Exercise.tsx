
import { useRef } from 'react'
import TimePicker from 'app/components/time_picker/TimePicker'
import { DeleteFilled, DownOutlined, QuestionCircleOutlined, UpOutlined } from '@ant-design/icons'
import { Button, Checkbox, Divider, Form, Select } from 'antd'
import { Rule } from 'antd/lib/form'
import { Input as CustomInput, NoDataText, WeightInputAddon } from 'app/components'
import {
  ExerciseOption,
  StyledFormItem,
  ShortFormItem,
  DeleteButton,
} from 'app/views/workouts/components/workout/components'
import { ExerciseContainer, MoveExerciseButtonContainer, StyledSelect } from './components/styled'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { isExerciseTimeType } from 'app/utils/time'
import { LabelInnerWithIcon } from 'app/components/styled'

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
  massUnit,
  onInfoClick,
}) => {
  const { intl } = useIntlContext()

  const $container = useRef(null)
  const $select = useRef(null)

  const requiredRules = isEditMode ? [ { required: true, message: errorsDictionary.common.required } ] : []
  const handleExerciseChange = onExerciseChange(index, 'rounds')

  const hasButtons = exerciseAmount > 1
  const hasTopButton = hasButtons && index !== 0
  const hasBottomButton = hasButtons && index !== exerciseAmount - 1

  const handleChangeOrder = (order: number) => onExerciseChange(index, 'order', order, $container)

  const handleWeightChange = (value: number | null) => form.setFieldsValue({ [`exercises.${index}.weight`]: value })

  const handleRepeatsChange = (value: number | null) => form.setFieldsValue({ [`exercises.${index}.repeats`]: value })

  return (
    <ExerciseContainer ref={$container}>
      <Divider style={{ marginBottom: '16px', marginTop: '6px' }} />
      {hasButtons && isEditMode && !isInActivity && (
        <MoveExerciseButtonContainer $hasBottomButton={hasBottomButton} $hasTopButton={hasTopButton}>
          {hasTopButton && (
            <Button onClick={handleChangeOrder(-1)} size="small" type="text">
              <UpOutlined />
            </Button>
          )}
          {hasBottomButton && (
            <Button onClick={handleChangeOrder(1)} size="small" type="text">
              <DownOutlined />
            </Button>
          )}
        </MoveExerciseButtonContainer>
      )}
      {isEditMode && !isInActivity && fields.length !== 1 && <DeleteButton disabled={isFetching} danger type="text" size="large" onClick={() => remove(index)}><DeleteFilled /></DeleteButton>}

      <Form.Item
        label={
          <LabelInnerWithIcon>
            {dictionary.input_labels.exercise}
            {isInActivity && <Button type="link" size="small" onClick={onInfoClick({ isInActivity })} icon={<QuestionCircleOutlined />} />}
          </LabelInnerWithIcon>
        }
        name={[ index, 'id' ]} rules={requiredRules}>
        <StyledSelect
          ref={$select}
          disabled={isFormItemDisabled || isInActivity}
          size="large"
          showSearch
          optionFilterProp="label"
          onSelect={() => $select.current?.blur()}
          notFoundContent={<NoDataText>{intl.common.empty_list}</NoDataText>}
        >
          {exerciseList.data.map(exercise => (
            <Select.Option value={exercise.id} key={exercise.id} label={exercise.title} disabled={exercise.archived}>
              <ExerciseOption {...exercise} payloadDictionary={payload} />
            </Select.Option>
          ))}
        </StyledSelect>
      </Form.Item>

      
      <StyledFormItem shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const type = getFieldValue([ 'exercises', index, 'type' ]) || exerciseList.data.find(exercise => exercise.id === getFieldValue([ 'exercises', index, 'id' ]))?.type

          if (!type) return null

          const shouldRenderTimeInput = !isExerciseTimeType(type)
          const shouldRenderWeightInput = type !== 'weight'
          return (
            <>
              {shouldRenderTimeInput
                ? (
                  <ShortFormItem $margin name={[ index, 'time' ]} label={dictionary.input_labels.time}>
                    <TimePicker
                      disabled={isFormItemDisabled}
                      inputReadOnly
                      showNow={false}
                      size="large"
                      placeholder=""
                    />
                  </ShortFormItem>
                )
                : (
                  <ShortFormItem name={[ index, 'repeats' ]} label={dictionary.input_labels.repeats} $margin>
                    <CustomInput.Number int onlyPositive disabled={isFormItemDisabled} onChange={handleRepeatsChange} onBlur={handleRepeatsChange} size="large" />
                  </ShortFormItem>
                )}
              {shouldRenderWeightInput
                ? (
                  <ShortFormItem name={[ index, 'weight' ]} label={dictionary.input_labels.weight}>
                    <CustomInput.Number
                      onlyPositive
                      disabled={isFormItemDisabled}
                      onChange={handleWeightChange}
                      onBlur={handleWeightChange}
                      size="large"
                      addonAfter={(
                        <WeightInputAddon
                          value={massUnit}
                          showArrow={false}
                          mass_unit={{
                            kg: payload.mass_unit.kg[0],
                            lb: payload.mass_unit.lb[0],
                          }}
                          disabled
                        />
                      )}
                    />
                  </ShortFormItem>
                )
                : (
                  <ShortFormItem name={[ index, 'repeats' ]} label={dictionary.input_labels.repeats}>
                    <CustomInput.Number int onlyPositive disabled={isFormItemDisabled} onChange={handleRepeatsChange} onBlur={handleRepeatsChange} size="large" />
                  </ShortFormItem>
                )}
            </>
          )
        }}
      </StyledFormItem>

      <StyledFormItem>
        <ShortFormItem
          name={[ index, 'rounds' ]}
          label={
            <LabelInnerWithIcon>
              {dictionary.input_labels.rounds}
              {isInActivity && <Button type="link" size="small" onClick={onInfoClick({ isInActivity })} icon={<QuestionCircleOutlined />} />}
            </LabelInnerWithIcon>
          }
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
