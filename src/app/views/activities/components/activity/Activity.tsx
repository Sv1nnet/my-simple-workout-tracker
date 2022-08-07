import {
  Form,
  Input,
  Button,
  Modal,
  Select,
  Checkbox,
} from 'antd'
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { FormActionButtonsContainer, ToggleEdit, TimePicker, DeleteEditPanel, DatePicker } from 'app/components'
import dayjs, { Dayjs } from 'dayjs'
import { dayjsToSeconds, timeToDayjs } from 'app/utils/time'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'
import { ActivityForm } from 'app/store/slices/activity/types'
import { useAppSelector } from 'app/hooks'
import { exerciseApi } from 'app/store/slices/exercise/api'
import { Input as CustomInput } from 'app/components'
import {
  Exercise,
  StyledForm,
  StyledFormItem,
  StyledModal,
  CreateEditFormItem,
  ImageFormItem,
  ShortFormItem,
  WorkoutFormItem,
  WorkoutLabelContainer,
} from './components'
import { RouterContext } from 'app/contexts/router/RouterContextProvider'
import { workoutApi } from 'app/store/slices/workout/api'
import { selectList } from 'app/store/slices/workout'

export type InitialValues = ActivityForm & {
  exercises: {
    rounds: number;
    round_break: Dayjs | number;
    break?: Dayjs | number;
    break_enabled: boolean;
  }[]
}

export interface IActivity {
  id?: string;
  isEdit?: boolean;
  isFetching?: boolean;
  initialValues?: ActivityForm;
  error?: string;
  deleteActivity?: Function,
  onSubmit: Function;
}

/*
  {
    workout: id,
    date: number | Date,
    results: [
      id: string,
      {
        type: string,
        rounds: number[],
        description?: string,
      },
    ][],
  }
*/

/*
  history
  {
    id: string, // exercise id
    date: number | Date,
    results: number[]
  }[]
*/

const createFakeHistory = (dateAmount: number, roundAmount: number, eachSide = false) => {
  const res = []
  
  for (let i = 0; i < dateAmount; i++) {
    if (i === 0) {
      res.push([
        `${Date.now()}`,
        {
          date: dayjs(),
          // results: [ 137, 187, 188, 133 ],
          // results: eachSide ? [
          //   { right: 17, left: 15 },
          //   { right: 14, left: 13 },
          //   { right: 10, left: 9 },
          //   { right: 8, left: 6 },
          // ] : [ 0, 187, 188, 5 ],
          // results: [ 0, 187, 188, 5 ],
          results: eachSide ? [
            { right: 17, left: 15 },
            { right: 14, left: 13 },
            { right: 10, left: 9 },
            { right: 8, left: 6 },
          ] : [ 200, 10, 200, 0 ],
          // results: [ 100, 100, 100, 100 ],
          // results: [ 0, 0, 0, 10 ],
          // results: [ 0, 5, 0, 10 ],
          // results: [ 75, 94, 97, 96 ],
          // results: [ 106, 167, 25, 85 ],
          // results: [ 91, 159, 189, 188 ],
          // results: [ 103, 144, 143, 148 ],
        },
      ])
      continue
    }
    res.push([
      `${Date.now()}`,
      {
        date: dayjs().add(-7 * i, 'day'),
        results: Array.from({ length: roundAmount }, () => eachSide ? { right: Math.round(Math.random() * 200), left: Math.round(Math.random() * 200) } : Math.round(Math.random() * 200)),
      },
    ])
  }
  return res
}

const Activity: FC<IActivity> = ({ initialValues: _initialValues, isEdit, isFetching, onSubmit, deleteActivity, error }) => {
  const [ isEditMode, setEditMode ] = useState(!isEdit && !isFetching)
  const [ isModalVisible, setIsModalVisible ] = useState(false)
  const [ selectedWorkout, setSelectedWorkout ] = useState()
  const [ fetchWorkoutList ] = workoutApi.useLazyListQuery()
  const workoutList = useAppSelector(selectList)
  const { intl } = useContext(IntlContext)
  const { loading } = useContext(RouterContext)
  // const { input_labels, submit_button, payload, modal } = intl.pages.exercises
  const { input_labels, submit_button, payload, modal } = intl.pages.activities
  const { title, ok_text, default_content } = intl.modal.common

  const mountedRef = useRef(false)

  const [ form ] = Form.useForm<ActivityForm>()
  console.log('workoutList', workoutList)
  const initialValues = useMemo(() => ({
    id: 'a',
    date: dayjs(),
    results: workoutList
      .data
      .find(wk => wk.id === form.getFieldValue('workout'))
      ?.exercises
      ?.map(({ rounds, _id, exercise }) => {
        console.log('exercise _id', _id)
        return [ _id, Array.from({ length: rounds }, () => ({ type: exercise.type, value: '' })) ]
      }) || [],
    // ?.map(exercise => Array.from({ length: exercise.rounds }, () => [ `${Date.now()}`, { type: 'time', value: dayjs() } ])) || [],
  }), [ _initialValues, selectedWorkout ])
  console.log('initialValues', initialValues)
  const _history = useMemo(() => Array.from({ length: 4 }, () => createFakeHistory(31, 4, false) ), [])

  const handleWeightChange = value => form.setFieldsValue({ weight: value })

  const handleRepeatsChange = value => form.setFieldsValue({ repeats: value })

  const handleCancelEditing = () => {
    setEditMode(false)
    form.resetFields()
  }

  const handleSubmit = async (_values) => {
    console.log('submit', _values)
    // let { time, image, ...values } = _values
    // values = (() => {
    //   const formData = new FormData()
    //   Object
    //     .entries(values)
    //     .forEach(([ key, value ]) => value !== undefined && formData.append(key, `${value}`))

    //   return formData
    // })()

    // if (time) {
    //   const [ h, m, s ] = [ time.hour(), time.minute(), time.second() ]
    //   const timeInSeconds = s + (m * 60) + (h * 60 * 60)
    //   values.append('time', timeInSeconds)
    // }

    // if (image && image.length) {
    //   [ image ] = image
    //   if (image.originFileObj) {
    //     values.append('image_uid', image.uid)
    //     values.append('image', image.originFileObj)
    //   } else {
    //     image = { ...image }
    //     delete image.uploaded_at

    //     Object
    //       .entries(image)
    //       .forEach(([ key, value ]) => {
    //         values.append(`image_${key}`, value)
    //       })
    //   }
    // }

    // if (initialValues.id) {
    //   values.append('id', initialValues.id)
    // }

    // return onSubmit(values)
    //   .then((res) => {
    //     if (isEdit && !res.error && !res.data.error) setEditMode(false)
    //     return res
    //   })
  }

  const handleDelete = () => deleteActivity(initialValues.id).then((res) => {
    setIsModalVisible(false)
    return res
  })

  useEffect(() => {
    if (mountedRef.current) {
      // debugger
      console.log('initialValues', initialValues)
      form.setFieldsValue(initialValues)
    }
  }, [ initialValues ])

  useEffect(() => {
    if (error) {
      Modal.error({
        title: title.error,
        content: error || default_content.error,
        okText: ok_text,
      })
    }
  }, [ !!error ])

  useEffect(() => {
    if (!workoutList.data.length) fetchWorkoutList()
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
        <WorkoutFormItem
          required
          label={(
            <WorkoutLabelContainer>
              <span>{input_labels.workout}</span>
              <Form.Item
                required
                name="date"
                style={{ marginBottom: '0' }}
              >
                <DatePicker inputReadOnly bordered={false} size="small" allowClear={false} />
              </Form.Item>
            </WorkoutLabelContainer>
          )}
          name="workout"
          rules={[ { required: true, message: 'Required' } ]}
        >
          <Select disabled={isFormItemDisabled} size="large" onChange={(value) => { console.log('args', value); setSelectedWorkout(value)}}>
            {workoutList.data.map(workout => (
              <Select.Option key={workout.id} value={workout.id}>{workout.title}</Select.Option>
            ))}
          </Select>
        </WorkoutFormItem>
        <Form.Item noStyle shouldUpdate>
          {
            ({ getFieldValue }) => workoutList
              .data
              .find(wk => wk.id === getFieldValue('workout'))
              ?.exercises
              .map((exercise, i) => (
                <Exercise
                  // roundResults={getFieldValue('results')}
                  roundResults={initialValues.results}
                  form={form}
                  exerciseIndex={i}
                  id={exercise._id}
                  key={exercise._id}
                  history={_history[i]}
                  {...exercise}
                />
              ))
          }
        </Form.Item>
        {/* <StyledFormItem shouldUpdate>
          {({ getFieldValue }) => {
            const type = getFieldValue('type')
            const shouldRenderTimeInput = type !== 'time' && type !== 'duration'
            return (
              <>
                {shouldRenderTimeInput
                  ? (
                    <ShortFormItem name="time" label={input_labels.time}>
                      <TimePicker
                        disabled={!isEditMode || isFetching}
                        inputReadOnly
                        showNow={false}
                        size="large"
                        allowClear={false}
                        placeholder=""
                      />
                    </ShortFormItem>
                  )
                  : (
                    <ShortFormItem name="repeats" label={input_labels.repeats} $fullWidth $margin>
                      <CustomInput.Number
                        int
                        positive
                        disabled={isFormItemDisabled}
                        onChange={handleRepeatsChange}
                        onBlur={handleRepeatsChange}
                        size="large"
                      />
                    </ShortFormItem>
                  )}
                <ShortFormItem name="weight" label={input_labels.weight} $fullWidth={!shouldRenderTimeInput}>
                  <CustomInput.Number
                    positive
                    disabled={isFormItemDisabled}
                    onChange={handleWeightChange}
                    onBlur={handleWeightChange}
                    size="large"
                  />
                </ShortFormItem>
              </>
            )
          }}
        </StyledFormItem> */}
        <Form.Item label={input_labels.description} name="description">
          <Input.TextArea disabled={isFormItemDisabled} showCount maxLength={300} autoSize={{ minRows: 2, maxRows: 8 }} />
        </Form.Item>
        {(isEditMode || !isEdit) && (
          <CreateEditFormItem>
            <>
              <Button type="primary" htmlType="submit" size="large" block loading={isFetching || loading}>
                {isEdit ? submit_button.save : submit_button.create}
              </Button>
              {isEdit && (
                <ToggleEdit onClick={handleCancelEditing} size="large" block>
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

Activity.defaultProps = {
  initialValues: {
    title: '',
    description: '',
  },
}

export default Activity
