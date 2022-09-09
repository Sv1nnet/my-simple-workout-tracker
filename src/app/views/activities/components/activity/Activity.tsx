import { useRouter } from 'next/router'
import {
  Form,
  Input,
  Button,
  Modal,
  Select,
} from 'antd'
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ToggleEdit, DeleteEditPanel, DatePicker } from 'app/components'
import dayjs, { Dayjs, isDayjs } from 'dayjs'
import { dayjsToSeconds, isExerciseTimeType, secondsToDayjs } from 'app/utils/time'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'
import { ActivityForm, HistoryServerPayload } from 'app/store/slices/activity/types'
import { useAppSelector } from 'app/hooks'
import {
  Exercise,
  StyledForm,
  CreateEditFormItem,
  WorkoutFormItem,
  WorkoutLabelContainer,
} from './components'
import { RouterContext } from 'app/contexts/router/RouterContextProvider'
import { workoutApi } from 'app/store/slices/workout/api'
import { selectList } from 'app/store/slices/workout'
import { activityApi } from '@/src/app/store/slices/activity/api'
import { CustomBaseQueryError } from '@/src/app/store/utils/baseQueryWithReauth'
import { WorkoutForm, WorkoutListExercise } from '@/src/app/store/slices/workout/types'
import { AppLoaderContext } from '@/src/app/contexts/loader/AppLoaderContextProvider'

export interface IActivityProps {
  id?: string;
  isEdit?: boolean;
  isFetching?: boolean;
  initialValues?: InitialValues<string>;
  isError: boolean;
  error?: string;
  errorCode?: number;
  errorAppCode?: number;
  deleteActivity?: Function;
  onSubmit: Function;
}

export type InitialValues<T = Dayjs> = Omit<ActivityForm<T>, '_id' | 'workout_id'> & {
  _id?: string,
  workout_id?: Pick<WorkoutForm, 'id'>,
}

export const getComparator = (type: string) => type === 'time' 
  ? {
    pos: (curr, next) => curr < next,
    neg: (curr, next) => curr > next,
  }
  : {
    pos: (curr, next) => curr > next,
    neg: (curr, next) => curr < next,
  }



const getResultsFromWorkoutList = (_workoutList, workoutId) => _workoutList
  .data
  .find(wk => wk.id === workoutId)
// TODO: on the server - exercise -> details
  ?.exercises
  ?.map(({ rounds, _id, exercise }) => ({
    _id,
    hours: exercise.hours,
    original_id: exercise.id,
    id_in_workout: _id,
    type: exercise.type,
    rounds: Array.from({ length: rounds }, () => exercise.each_side ? { left: null, right: null } : null),
    note: undefined,
  })) || []

const Activity: FC<IActivityProps> = ({ initialValues: _initialValues, isEdit, isFetching, onSubmit, deleteActivity, isError, error, errorCode }) => {
  const router = useRouter()
  const [ isEditMode, setEditMode ] = useState(!isEdit && !isFetching)
  const [ isModalVisible, setIsModalVisible ] = useState(false)
  const [ selectedWorkout, setSelectedWorkout ] = useState<Pick<WorkoutForm, 'id'>>()
  const [ cachedFormValues, setCachedFormValues ] = useState<InitialValues | null>(() => {
    try {
      return JSON.parse(typeof localStorage !== 'undefined' ? (localStorage.getItem('cached_activity') || 'null') : 'null')
    } catch {
      return null
    }
  })
  const workoutList = useAppSelector(selectList)
  const [ fetchWorkoutList ] = workoutApi.useLazyListQuery()
  const { runLoader, stopLoaderById } = useContext(AppLoaderContext)
  const { intl } = useContext(IntlContext)
  const { loading } = useContext(RouterContext)
  
  const { input_labels, submit_button, modal } = intl.pages.activities
  const { title, ok_text, default_content } = intl.modal.common
  
  const mountedRef = useRef(false)
  const [ getHistory, { data: _history, isLoading: isHistoryLoading, isError: isHistoryError, error: historyError } ] = activityApi.useLazyGetHistoryQuery()
  const history = useMemo<HistoryServerPayload>(() => _history
    ? Object
      .entries(_history.data)
      .reduce((acc, [ exercise_id, results ]) => {
        acc[exercise_id] = results.items.map(item => ({
          date: dayjs(item.date),
          results: item.results,
        }))
        return acc
      }, {})
    : _history, [ _history ])
  
  const [ form ] = Form.useForm<ActivityForm>()
  
  const initFromCacheRef = useRef(false)

  const handleRestoreFromCacheError = () => {
    Modal.error({
      title: 'Oops!',
      content: 'Something has gone wrong and could not restore activity.',
      okText: 'It\'s sad but ok',
    })
    localStorage.removeItem('cached_activity')
    setTimeout(() => setSelectedWorkout(null))
  }

  const initialValues = useMemo<InitialValues>(() => {
    if (isEdit && _initialValues === null) return {}
    
    let newInitialValues
    if (!isEdit && cachedFormValues && selectedWorkout && initFromCacheRef.current) {
      try {
        initFromCacheRef.current = false
  
        const workout = workoutList
          .data
          .find(wk => wk.id === cachedFormValues.workout_id)
  
        newInitialValues = {
          ...cachedFormValues,
          workout_id: selectedWorkout,
          date: dayjs(cachedFormValues.date),
          results: cachedFormValues.results
            ? cachedFormValues.results.map((results, i) => {
              const { _id, exercise } = workout.exercises[i]
              return isExerciseTimeType(exercise.type)
                ? {
                  _id,
                  hours: exercise.hours,
                  original_id: exercise.id,
                  id_in_workout: _id,
                  type: exercise.type,
                  ...results,
                  rounds: results.rounds.map((round: string | { right: string, left: string }) => {
                    if (round === null) return round
  
                    return (typeof round === 'object')
                      ? { right: round.right !== null ? dayjs(round.right) : null, left: round.left !== null ? dayjs(round.left) : null }
                      : dayjs(round as string)
                  }),
                }
                : {
                  ...results,
                  _id,
                  hours: exercise.hours,
                  original_id: exercise.id,
                  id_in_workout: _id,
                  type: exercise.type,
                  rounds: results.rounds.map((round: string | { right: string, left: string }) => {
                    if (round === null) return round
  
                    return (typeof round === 'object')
                      ? { right: round.right !== null ? +round.right : null, left: round.left !== null ? +round.left : null }
                      : +round
                  }),
                }
            })
            : getResultsFromWorkoutList(workoutList, cachedFormValues.workout_id),
        }
      } catch {
        handleRestoreFromCacheError()
        return {
          _id: undefined,
          workout_id: undefined,
          date: undefined,
          results: [],
          description: '',
        }
      }
    } else if (!isEdit) {
      newInitialValues = {
        id: _initialValues._id,
        date: (form.getFieldValue('date') as Dayjs) || dayjs(),
        workout_id: selectedWorkout,
        results: getResultsFromWorkoutList(workoutList, form.getFieldValue('workout_id')),
        description: '',
      }
    } else {
      newInitialValues = {
        ..._initialValues,
        date: dayjs(_initialValues.date),
        results: _initialValues.results.map(results => isExerciseTimeType(results.type)
          ? {
            ...results,
            rounds: results.rounds.map((round: number | { right: number, left: number }) => (round !== null && typeof round === 'object')
              ? { right: secondsToDayjs(round.right), left: secondsToDayjs(round.left) }
              : secondsToDayjs(round as number)),
          }
          : results),
      }
    }

    if (mountedRef.current) setTimeout(() => form.setFieldsValue(newInitialValues))
    if (newInitialValues.workout_id) {
      setTimeout(() => setSelectedWorkout(newInitialValues.workout_id))
      getHistory({ workoutId: newInitialValues.workout_id as Pick<WorkoutForm, 'id'>, activityId: newInitialValues.id })
    }

    return newInitialValues
  }, [ _initialValues, selectedWorkout, workoutList ])

  const handleCancelEditing = () => {
    setEditMode(false)
    form.resetFields()
  }

  const handleSubmit = async ({ ...values }) => {
    values.id = initialValues.id
    values.date = values.date.toJSON()
    values.results = values.results.reduce((acc, { id, rounds, note }, i) => {
      const exercise = workoutList.data.find(workout => workout.id === values.workout_id).exercises[i]
      const { exercise: details } = exercise

      acc.push({
        original_id: id || exercise.id,
        id_in_workout: exercise._id,
        type: details.type,
        rounds: isExerciseTimeType(details.type)
          ? rounds.map((round) => {
            if (round === null) return 0
            return isDayjs(round)
              ? dayjsToSeconds(round)
              : {
                right: round.right === null || round.right === '' ? 0 : dayjsToSeconds(round.right),
                left: round.left === null || round.left === '' ? 0 : dayjsToSeconds(round.left),
              }
          })
          : rounds.map((round) => {
            if (round === null) return 0
            return typeof round === 'number'
              ? round
              : {
                right: round.right === null || round.right === '' ? 0 : round.right,
                left: round.left === null || round.left === '' ? 0 : round.left,
              }
          }),
        note,
      })
      return acc
    }, [])

    return onSubmit(values)
      .then((res) => {
        if (!isEdit) {
          localStorage.removeItem('cached_activity')
          setCachedFormValues(null)
        }
        if (isEdit && !res.error && !res.data.error) {
          setEditMode(false)
          if (selectedWorkout && initialValues.date.toString() !== values.date.toString()) getHistory({ workoutId: selectedWorkout, activityId: initialValues.id })
        }
        return res
      })
  }

  const handleDelete = () => deleteActivity(initialValues.id).then((res) => {
    setIsModalVisible(false)
    return res
  })

  const handleSelectedWorkoutChange = (value) => {
    setSelectedWorkout(value)
    const newCachedValues = {
      date: dayjs(),
      description: '',
      workout_id: value,
      results: getResultsFromWorkoutList(workoutList, value),
    }
    localStorage.setItem('cached_activity', JSON.stringify(newCachedValues))
    setCachedFormValues(newCachedValues)
    return value
  }

  const cacheFormData = (changedValues, allValues) => {
    if (isEdit) return
    if ('workout_id' in changedValues && Object.keys(changedValues).length === 1) return

    localStorage.setItem('cached_activity', JSON.stringify(allValues))
  }

  useEffect(() => {
    const historyErrorText = (historyError as CustomBaseQueryError)?.data?.error?.message?.text
    if (error || isError) {
      Modal.error({
        title: title.error,
        content: error || default_content.error,
        okText: ok_text,
        onOk() {
          if (errorCode === 404) router.push('/activities')
        },
      })
    } else if (!!historyErrorText || isHistoryError) {
      Modal.error({
        title: title.error,
        content: historyErrorText || default_content.error,
        okText: ok_text,
      })
    }
  }, [ !!error, isError, isHistoryError, historyError ])

  useEffect(() => {
    if (!workoutList.data.length) fetchWorkoutList()
  }, [])

  useEffect(() => {
    if (isEdit) form.setFieldsValue(initialValues)
  }, [])

  useEffect(() => {
    if (workoutList.status === 'loading') {
      runLoader('workout_list_loader', { tip: 'Loading workout list...' })
    } else if (workoutList.status === 'loaded' || workoutList.status === 'error') {
      stopLoaderById('workout_list_loader')
    }
  }, [ workoutList.status ])

  useEffect(() => () => stopLoaderById('workout_list_loader'), [])

  useEffect(() => {
    if (selectedWorkout) getHistory({ workoutId: selectedWorkout, activityId: initialValues.id })
  }, [ selectedWorkout ])

  useEffect(() => {
    if (!isEdit && localStorage.getItem('cached_activity') && workoutList.status === 'loaded') {
      Modal.confirm({
        title: 'You have unfinished activity.',
        content: 'Restore unfinished activity? If no the activity will be cleared.',
        okText: 'Restore',
        cancelText: 'Don\'t restore',
        onOk() {
          try {
            const _cachedFormValues = JSON.parse(localStorage.getItem('cached_activity') || 'null')

            if (!_cachedFormValues) {
              throw new Error('No cached form values')
            }

            setSelectedWorkout(_cachedFormValues.workout_id)
            setCachedFormValues(_cachedFormValues)
            initFromCacheRef.current = true
          } catch {
            handleRestoreFromCacheError()
          }
        },
        onCancel() {
          localStorage.removeItem('cached_activity')
        },
      })
    }
  }, [ workoutList.status ])

  useEffect(() => {
    mountedRef.current = true
  }, [])

  const isFormItemDisabled = !isEditMode || isFetching || loading

  return (
    <>
      <StyledForm onValuesChange={cacheFormData} preserve={false} form={form} initialValues={initialValues} onFinish={handleSubmit} layout="vertical" $isEdit={isEdit}>
        {isEdit && (
          <DeleteEditPanel
            isEditMode={isEditMode}
            onEditClick={() => setEditMode(true)}
            onDeleteClick={() => setIsModalVisible(true)}
            deleteButtonProps={{ disabled: isFetching || loading }}
            editButtonProps={{ disabled: isFetching || loading }}
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
                style={{ marginBottom: 0 }}
              >
                <DatePicker disabled={isFormItemDisabled} inputReadOnly bordered={false} size="small" allowClear={false} />
              </Form.Item>
            </WorkoutLabelContainer>
          )}
          name="workout_id"
          rules={[ { required: true, message: 'Required' } ]}
        >
          <Select disabled={isFormItemDisabled || isEdit} size="large" onChange={handleSelectedWorkoutChange}>
            {workoutList.data.map(workout => (
              <Select.Option key={workout.id} value={workout.id}>{workout.title}</Select.Option>
            ))}
          </Select>
        </WorkoutFormItem>
        <Form.Item noStyle shouldUpdate>
          {
            ({ getFieldValue }) => workoutList
              .data
              .find(workout => workout.id === getFieldValue('workout_id'))
              ?.exercises
              .map((exercise: WorkoutListExercise<number>, i) => (
                <Exercise
                  roundResults={initialValues.results[i]}
                  form={form}
                  exerciseIndex={i}
                  id={exercise._id}
                  key={exercise._id as string}
                  isHistoryLoading={isHistoryLoading}
                  isFormItemDisabled={isFormItemDisabled}
                  total={history?.[exercise._id as string]?.total}
                  history={history?.[exercise._id as string]}
                  {...exercise}
                />
              ))
          }
        </Form.Item>
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

Activity.defaultProps = {
  initialValues: {
    _id: undefined,
    workout_id: undefined,
    date: undefined,
    results: [],
    description: '',
  },
}

export default Activity
