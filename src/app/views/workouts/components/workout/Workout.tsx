import {
  Form,
  Input,
  Button,
  Modal,
} from 'antd'
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { dayjsToSeconds, secondsToDayjs } from 'app/utils/time'
import { DeleteEditPanel, ToggleEdit } from 'app/components'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'
import { WorkoutForm, WorkoutExercise } from 'app/store/slices/workout/types'
import { useAppSelector } from 'app/hooks'
import { selectList } from 'app/store/slices/exercise'
import { exerciseApi } from 'app/store/slices/exercise/api'
import { RouterContext } from 'app/contexts/router/RouterContextProvider'
import {
  StyledForm,
  CreateEditFormItem,
  Exercise,
} from './components'

export type InitialValues = Omit<WorkoutForm, 'exercises'> & {
  exercises: {
    id: Pick<WorkoutExercise<number | dayjs.Dayjs>, 'id'>;
    rounds: number;
    round_break: Dayjs | number;
    break?: Dayjs | number;
    break_enabled: boolean;
  }[]
}

export interface IWorkout {
  id?: string;
  isEdit?: boolean;
  isFetching?: boolean;
  initialValues?: InitialValues;
  isError: boolean;
  error?: string;
  deleteWorkout?: Function;
  onSubmit: Function;
}

const addDefaultExercise = () => ({
  break_enabled: true,
  id: null,
  rounds: 1,
  round_break: dayjs().hour(0).minute(0).second(0),
  break: dayjs().hour(0).minute(0).second(0),
})

const Workout: FC<IWorkout> = ({ initialValues: _initialValues, isEdit, isFetching, onSubmit, deleteWorkout, isError, error }) => {
  const [ isEditMode, setEditMode ] = useState(!isEdit && !isFetching)
  const [ isModalVisible, setIsModalVisible ] = useState(false)
  const [ fetchExerciseList ] = exerciseApi.useLazyListQuery()
  const exerciseList = useAppSelector(selectList)
  const { intl } = useContext(IntlContext)
  const { loading } = useContext(RouterContext)
  const { payload } = intl.pages.exercises
  const { input_labels, submit_button, error_message, modal } = intl.pages.workouts
  const { title, ok_text, default_content } = intl.modal.common

  const [ form ] = Form.useForm<InitialValues>()
  const initialValues = useMemo<InitialValues>(() => {
    const workout = { ..._initialValues } as unknown as InitialValues
    workout.exercises = workout.exercises.map(({ id, rounds, round_break, break: exercise_break, break_enabled }) => ({
      id,
      rounds,
      round_break: typeof round_break === 'object' ? round_break : secondsToDayjs(round_break as number),
      break: typeof exercise_break === 'object' ? exercise_break : secondsToDayjs(exercise_break as number),
      break_enabled,
    }))

    if (!workout.exercises.length) workout.exercises.push(addDefaultExercise())

    return workout
  }, [ _initialValues, exerciseList ])

  const mountedRef = useRef(false)

  const handleExerciseChange = (i, name) => (value) => {
    if (value && typeof value === 'object' && 'target' in value) {
      value = value.target.checked
    }

    let exercises = [ ...form.getFieldValue('exercises') ]
    const exerciseToUpdate = { ...exercises[i] }
    exerciseToUpdate[name] = value
    exercises[i] = exerciseToUpdate
    form.setFieldsValue({ exercises })
    form.validateFields([ [ 'exercises', i, 'rounds' ] ])
  }

  const handleCancelEditing = () => {
    setEditMode(false)
    form.resetFields()
  }

  const handleSubmit = async (_values) => {
    const values = { ..._values, id: initialValues.id }
    values.exercises = values.exercises.map(({ id, rounds, round_break, break: exercise_break, break_enabled }) => ({
      id,
      rounds,
      round_break: dayjsToSeconds(round_break),
      break_enabled,
      break: dayjsToSeconds(exercise_break),
    }))

    return onSubmit(values)
      .then((res) => {
        if (isEdit && !res.error && !res.data.error) setEditMode(false)
        return res
      })
  }

  const validate = () => ({
    validator: async ({ field }, value) => {
      const fieldName = field.split('.').pop()
      if (fieldName === 'rounds') {
        if (parseInt(value, 10) !== 0) return
        throw new Error(error_message.rounds.required)
      }
    },
  })

  const handleDelete = () => deleteWorkout(initialValues.id).then((res) => {
    setIsModalVisible(false)
    return res
  })

  useEffect(() => {
    if (mountedRef.current) form.setFieldsValue(initialValues)
  }, [ initialValues ])

  useEffect(() => {
    if (error || isError) {
      Modal.error({
        title: title.error,
        content: error || default_content.error,
        okText: ok_text,
      })
    }
  }, [ !!error, isError ])

  useEffect(() => {
    if (!exerciseList.data.length) fetchExerciseList()
  }, [])

  useEffect(() => {
    mountedRef.current = true
  }, [])

  const isFormItemDisabled = !isEditMode || isFetching || loading

  return (
    <>
      <StyledForm form={form} initialValues={initialValues} onFinish={handleSubmit} layout="vertical">
        {isEdit && (
          <DeleteEditPanel
            isEditMode={isEditMode}
            onEditClick={() => setEditMode(true)}
            onDeleteClick={() => setIsModalVisible(true)}
            deleteButtonProps={{ disabled: isFetching || loading }}
          />
        )}
        <Form.Item label={input_labels.title} name="title" rules={isEditMode ? [ { required: true, message: 'Required' } ] : []}>
          <Input disabled={isFormItemDisabled} size="large" />
        </Form.Item>
        <Form.List name="exercises">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, i) => (
                <Exercise
                  key={field.key}
                  fields={fields}
                  form={form}
                  index={i}
                  validate={validate}
                  dictionary={input_labels}
                  errorsDictionary={error_message}
                  isEditMode={isEditMode}
                  isFetching={isFetching}
                  isFormItemDisabled={isFormItemDisabled}
                  payload={payload}
                  exerciseList={exerciseList}
                  onExerciseChange={handleExerciseChange}
                  remove={remove}
                />
              ))}
              {isEditMode && (
                <Button
                  disabled={isFormItemDisabled}
                  onClick={() => add(addDefaultExercise())}
                  block
                  size="large"
                  type="dashed"
                  style={{ marginBottom: '18px' }}
                >
                  {input_labels.add_exercise}
                </Button>
              )}
            </>
          )}
        </Form.List>
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.description !== cur.description}>
          {({ getFieldValue }) => (
            (isEditMode || getFieldValue('description')) ? (
              <Form.Item label={input_labels.description} name="description">
                <Input.TextArea disabled={isFormItemDisabled} showCount maxLength={300} autoSize={{ minRows: 2, maxRows: 8 }} />
              </Form.Item>
            ) : null
          )}
        </Form.Item>
        {(isEditMode || !isEdit) && (
          <CreateEditFormItem>
            <>
              <Button type="primary" htmlType="submit" size="large" block loading={isFetching || loading}>
                {isEdit ? submit_button.save : submit_button.create}
              </Button>
              {isEdit && (
                <ToggleEdit onClick={handleCancelEditing} disabled={isFetching || loading} size="large" block>
                  {submit_button.cancel}
                </ToggleEdit>
              )}
            </>
          </CreateEditFormItem>
        )}
        <Modal
          visible={isModalVisible}
          okText={modal.delete.ok_button}
          onOk={handleDelete}
          okButtonProps={{ danger: true, type: 'default', loading: isFetching }}
          cancelText={modal.delete.cancel_button}
          onCancel={() => setIsModalVisible(false)}
        >
          {modal.delete.body_single}
        </Modal>
      </StyledForm>
    </>
  )
}

Workout.defaultProps = {
  initialValues: {
    title: '',
    exercises: [ addDefaultExercise() ],
    description: '',
  },
}

export default Workout
