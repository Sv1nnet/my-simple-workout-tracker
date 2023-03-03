import { useRouter } from 'next/router'
import {
  Form,
  Input,
  Button,
  Modal,
} from 'antd'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { dayjsToSeconds, secondsToDayjs } from 'app/utils/time'
import { DeleteEditPanel, ToggleEdit } from 'app/components'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { WorkoutForm } from 'app/store/slices/workout/types'
import { useAppSelector } from 'app/hooks'
import { selectList } from 'app/store/slices/exercise'
import { exerciseApi } from 'app/store/slices/exercise/api'
import { useRouterContext } from 'app/contexts/router/RouterContextProvider'
import {
  StyledForm,
  CreateEditFormItem,
  Exercise,
} from './components'
import { Exercise as TExercise } from '@/src/app/store/slices/exercise/types'
import { API_STATUS } from '@/src/app/constants/api_statuses'
import { useAppLoaderContext } from '@/src/app/contexts/loader/AppLoaderContextProvider'

export type InitialValues = Omit<WorkoutForm, 'exercises'> & {
  exercises: {
    id: Pick<TExercise<number | dayjs.Dayjs>, 'id'>;
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
  errorCode?: number;
  errorAppCode?: number;
  deleteWorkout?: Function;
  onSubmit: Function;
}

const getDefaultExercise = () => ({
  break_enabled: true,
  id: null,
  rounds: 1,
  round_break: dayjs().hour(0).minute(0).second(0),
  break: dayjs().hour(0).minute(0).second(0),
})

const Workout: FC<IWorkout> = ({ initialValues: _initialValues, isEdit, isFetching, onSubmit, deleteWorkout, isError, error, errorCode }) => {
  const router = useRouter()
  const $container = useRef(null)
  const [ isEditMode, setEditMode ] = useState(!isEdit && !isFetching)
  const [ isModalVisible, setIsModalVisible ] = useState(false)
  const [ fetchExerciseList ] = exerciseApi.useLazyListQuery()
  const { runLoader, stopLoaderById } = useAppLoaderContext()
  const exerciseList = useAppSelector(selectList)
  const { intl, lang } = useIntlContext()
  const { loading } = useRouterContext()
  const { payload } = intl.pages.exercises
  const { input_labels, submit_button, error_message, modal, placeholders } = intl.pages.workouts
  const { title, ok_text, default_content } = intl.modal.common

  const [ form ] = Form.useForm<InitialValues>()
  const initialValues = useMemo<InitialValues>(() => {
    if (isEdit && _initialValues === null) {
      return {
        title: '',
        is_in_activity: false,
        exercises: [],
      }
    }

    const workout = { ..._initialValues } as unknown as InitialValues
    workout.exercises = workout.exercises.map(({ id, rounds, round_break, break: exercise_break, break_enabled }) => ({
      id,
      rounds,
      round_break: typeof round_break === 'object' ? round_break : secondsToDayjs(round_break as number),
      break: typeof exercise_break === 'object' ? exercise_break : secondsToDayjs(exercise_break as number),
      break_enabled,
    }))

    if (!workout.exercises.length) workout.exercises.push(getDefaultExercise())

    return workout
  }, [ _initialValues, exerciseList ])

  const mountedRef = useRef(false)

  const handleExerciseChange = (i, name, order, ref) => (value) => {
    let exercises = [ ...form.getFieldValue('exercises') ]
    const exerciseToUpdate = { ...exercises[i] }

    if (order) {
      const newPos = i + order
      form.setFieldsValue({
        exercises: exercises.map((exercise, index) => {
          if (index === newPos) return exerciseToUpdate
          if (index === i) return exercises[index + order]
          return exercise
        }),
      })
      requestAnimationFrame(() => {
        const elementToScrollTo = ref.current.parentElement.children[newPos + 1]
        $container.current.parentElement.scrollTo(0, (elementToScrollTo.offsetTop - 25))
      })
      return
    }

    if (value && typeof value === 'object' && 'target' in value) {
      value = value.target.checked
    }

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
    let { is_in_activity: _, ...values } = _values
    values = { ...values, id: initialValues.id }
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
        const parsedValue = parseInt(value, 10)
        if (parsedValue > 10) throw new Error(error_message.rounds.max)
        if (parsedValue !== 0) return
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
        onOk() {
          if (errorCode === 404) router.push('/workouts')
        },
      })
    }
  }, [ !!error, isError ])

  useEffect(() => {
    fetchExerciseList({ archived: isEdit, workoutId: initialValues.id, lang: isEdit ? lang : undefined })
  }, [])
  
  useEffect(() => {
    if (exerciseList.status === API_STATUS.LOADING) {
      runLoader('exercise_list_loader', { tip: 'Loading exercise list...' })
    } else if (exerciseList.status === API_STATUS.LOADED || exerciseList.status === API_STATUS.ERROR) {
      stopLoaderById('exercise_list_loader')
    }
  }, [ exerciseList.status ])

  useEffect(() => () => stopLoaderById('exercise_list_loader'), [])

  useEffect(() => {
    mountedRef.current = true
  }, [])

  const isFormItemDisabled = !isEditMode || isFetching || loading

  return (
    <div ref={$container}>
      <StyledForm form={form} initialValues={initialValues} onFinish={handleSubmit} layout="vertical">
        {isEdit && (
          <DeleteEditPanel
            isEditMode={isEditMode}
            onEditClick={() => setEditMode(true)}
            onDeleteClick={() => setIsModalVisible(true)}
            deleteButtonProps={{ disabled: isFetching || loading }}
            editButtonProps={{ disabled: isFetching || loading }}
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
                  exerciseAmount={fields.length}
                  fields={fields}
                  form={form}
                  index={i}
                  isInActivity={initialValues.is_in_activity}
                  validate={validate}
                  dictionary={{ input_labels, placeholders }}
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
              {isEditMode && !initialValues.is_in_activity && (
                <Button
                  disabled={isFormItemDisabled}
                  onClick={() => add(getDefaultExercise())}
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
            <Button type="primary" htmlType="submit" size="large" block loading={isFetching || loading}>
              {isEdit ? submit_button.save : submit_button.create}
            </Button>
            {isEdit && (
              <ToggleEdit onClick={handleCancelEditing} disabled={isFetching || loading} size="large" block>
                {submit_button.cancel}
              </ToggleEdit>
            )}
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
    </div>
  )
}

Workout.defaultProps = {
  initialValues: {
    title: '',
    is_in_activity: false,
    exercises: [ getDefaultExercise() ],
    description: '',
  },
}

export default Workout
