import {
  Form,
  Input,
  Button,
  Modal,
  Select,
} from 'antd'
import { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ToggleEdit, DeleteEditPanel, DatePicker, Stopwatch } from 'app/components'
import dayjs, { Dayjs, isDayjs } from 'dayjs'
import { dayjsToSeconds, isExerciseTimeType, secondsToDayjs, timeArrayToMilliseconds } from 'app/utils/time'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { ActivityForm, HistoryServerPayload } from 'app/store/slices/activity/types'
import { useAppSelector, useRequestForNotificationPermission } from 'app/hooks'
import {
  Exercise,
  StyledForm,
  CreateEditFormItem,
  WorkoutFormItem,
  WorkoutLabelContainer,
  StyledDateFormItem,
} from './components'
import { workoutApi } from 'app/store/slices/workout/api'
import { selectList } from 'app/store/slices/workout'
import { activityApi } from 'app/store/slices/activity/api'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { WorkoutForm, WorkoutListExercise } from 'app/store/slices/workout/types'
import { useAppLoaderContext } from 'app/contexts/loader/AppLoaderContextProvider'
import { API_STATUS } from 'app/constants/api_statuses'
import { getResultsFromWorkoutList } from './utils'
import { CacheFormData, IActivityProps, InitialValues } from './types'
import { StopwatchContainer } from './components/styled'
import { StopwatchRef } from 'app/components/stopwatch/Stopwatch'
import { useNavigate } from 'react-router'

const Activity: FC<IActivityProps> = ({ initialValues: _initialValues, isEdit, isFetching, onSubmit, deleteActivity, isError, error, errorCode }) => {
  const navigate = useNavigate()
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
  const { runLoader, stopLoaderById } = useAppLoaderContext()
  const { intl, lang } = useIntlContext()

  const { input_labels, submit_button, modal, loader } = intl.pages.activities
  const { title, ok_text, default_content } = intl.modal.common
  
  const [ getHistory, { data: _history, isLoading: isHistoryLoading, isError: isHistoryError, error: historyError } ] = activityApi.useLazyGetHistoryQuery()
  const history = useMemo<HistoryServerPayload>(() => _history
    ? Object
      .entries(_history.data)
      .reduce((acc, [ exercise_id, results ]) => {
        acc[exercise_id] = (results as { items }).items.map(item => ({
          date: dayjs(item.date),
          results: item.results,
        }))
        return acc
      }, {})
    : _history, [ _history ])
  
  const [ form ] = Form.useForm<ActivityForm>()
  
  const isRestoringActivity = useRef(false)
  const settingInitialValueTimeout = useRef(null)
  const initFromCacheRef = useRef(false)
  const durationTimerRef = useRef<StopwatchRef>(null)

  const handleRestoreFromCacheError = () => {
    Modal.error({
      title: modal.error.title,
      content: modal.error.body,
      okText: modal.error.ok_button,
    })
    localStorage.removeItem('cached_activity')
    setSelectedWorkout(null)
  }

  const initialValues = useMemo<InitialValues>(() => {
    if (isEdit && _initialValues === null) return {}
    
    let newInitialValues
    try {
      if (!isEdit && cachedFormValues && selectedWorkout && initFromCacheRef.current) {
        const workout = workoutList
          .data
          .find(wk => wk.id === cachedFormValues.workout_id)
  
        newInitialValues = {
          duration: 0,
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
      } else if (!isEdit) {
        newInitialValues = {
          id: _initialValues._id,
          duration: 0,
          date: (form.getFieldValue('date') as Dayjs) || dayjs(),
          workout_id: selectedWorkout,
          results: getResultsFromWorkoutList(workoutList, form.getFieldValue('workout_id')),
          description: '',
        }
      } else {
        newInitialValues = {
          duration: 0,
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

      clearTimeout(settingInitialValueTimeout.current)

      return newInitialValues
    } catch {
      handleRestoreFromCacheError()
      return {
        _id: undefined,
        workout_id: undefined,
        duration: 0,
        date: undefined,
        results: [],
        description: '',
      }
    }
  }, [ _initialValues, selectedWorkout, workoutList ])

  const handleCancelEditing = () => {
    setEditMode(false)
    form.resetFields()
  }

  const handleSubmit = async ({ ...values }) => {
    durationTimerRef.current.pauseTimer()

    values.id = initialValues.id
    values.duration = timeArrayToMilliseconds(durationTimerRef.current.valueRef.current)
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
            if (round === null || round === '') return 0
            return isDayjs(round)
              ? dayjsToSeconds(round)
              : {
                right: round.right === null || round.right === '' ? 0 : dayjsToSeconds(round.right),
                left: round.left === null || round.left === '' ? 0 : dayjsToSeconds(round.left),
              }
          })
          : rounds.map((round) => {
            if (round === null || round === '') return 0
            return typeof round === 'number' || typeof round === 'string'
              ? +round
              : {
                right: round.right === null || round.right === '' ? 0 : +round.right,
                left: round.left === null || round.left === '' ? 0 : +round.left,
              }
          }),
        note,
      })
      return acc
    }, [])

    return onSubmit(values)
      .then((res) => {
        if (!isEdit && !res.error && !res.data.error) {
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
      duration: 0,
    }
    localStorage.setItem('cached_activity', JSON.stringify(newCachedValues))
    setCachedFormValues(newCachedValues)
    return value
  }

  const cacheFormData: CacheFormData = (changedValues, allValues) => {
    if (isEdit) return
    if ('workout_id' in changedValues && Object.keys(changedValues).length === 1) return
    localStorage.setItem('cached_activity', JSON.stringify(allValues))
  }

  const handleDurationChange = (ms: number) => {
    cacheFormData([ 'duration' ], { ...form.getFieldsValue(), duration: ms })
  }

  const updateDurationInForm = (ms: number) => {
    form.setFieldsValue({ duration: ms })
  }

  const resetDuration = () => {
    handleDurationChange(0)
    updateDurationInForm(0)
  }

  useLayoutEffect(() => {
    form.setFieldsValue(initialValues)
    if (initialValues.workout_id) {
      setSelectedWorkout(initialValues.workout_id)
      getHistory({ workoutId: initialValues.workout_id as Pick<WorkoutForm, 'id'>, activityId: initialValues.id })
    }
  }, [ initialValues ])

  useEffect(() => {
    const historyErrorText = (historyError as CustomBaseQueryError)?.data?.error?.message?.text?.[lang || 'eng']
    if (error || isError) {
      Modal.error({
        title: title.error,
        content: error || default_content.error,
        okText: ok_text,
        onOk() {
          if (errorCode === 404) navigate('/activities')
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
    if (isEdit) form.setFieldsValue(initialValues)
    return () => stopLoaderById('workout_list_loader')
  }, [])

  useEffect(() => {
    if (workoutList.status === API_STATUS.LOADING) {
      runLoader('workout_list_loader', { tip: loader.workouts_loading })
    } else if (workoutList.status === API_STATUS.LOADED || workoutList.status === API_STATUS.ERROR) {
      stopLoaderById('workout_list_loader')
    }
  }, [ workoutList.status ])

  useEffect(() => {
    if (selectedWorkout) getHistory({ workoutId: selectedWorkout, activityId: initialValues.id })
  }, [ selectedWorkout ])

  useEffect(() => {
    if (!isRestoringActivity.current && !isEdit && localStorage.getItem('cached_activity') && workoutList.status === API_STATUS.LOADED) {
      const _modal = Modal.confirm({
        title: modal.restore.title,
        content: modal.restore.body,
        okText: modal.restore.ok_button,
        cancelText: modal.restore.cancel_button,
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
      return () => _modal.destroy()
    }
  }, [ workoutList.status ])

  useRequestForNotificationPermission()

  const isFormItemDisabled = !isEditMode || isFetching

  return (
    <>
      <StyledForm onValuesChange={cacheFormData} preserve={false} form={form} initialValues={initialValues} onFinish={handleSubmit} layout="vertical" $isEdit={isEdit}>
        {isEdit && (
          <DeleteEditPanel
            isEditMode={isEditMode}
            onEditClick={() => setEditMode(true)}
            onDeleteClick={() => setIsModalVisible(true)}
            deleteButtonProps={{ disabled: isFetching }}
            editButtonProps={{ disabled: isFetching }}
          />
        )}
        <StyledDateFormItem
          required
          name="date"
          $isEdit={isEdit}
        >
          <DatePicker disabled={isFormItemDisabled} inputReadOnly bordered={false} size="small" allowClear={false} />
        </StyledDateFormItem>
        <WorkoutFormItem
          required
          label={(
            <WorkoutLabelContainer>
              {input_labels.workout}
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
              .map((exercise: WorkoutListExercise<number>, i, list) => (
                <Exercise
                  exerciseList={list as WorkoutListExercise<number>[]}
                  roundResults={initialValues.results[i]}
                  form={form}
                  exerciseIndex={i}
                  id={exercise._id}
                  key={exercise._id as string}
                  isHistoryLoading={isHistoryLoading}
                  isFormItemDisabled={isFormItemDisabled}
                  isEdit={isEdit}
                  total={history?.[exercise._id as string]?.total}
                  history={history?.[exercise._id as string]}
                  cacheFormData={cacheFormData}
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
            <Button type="primary" htmlType="submit" size="large" block loading={isFetching}>
              {isEdit ? submit_button.save : submit_button.create}
            </Button>
            {isEdit && (
              <ToggleEdit onClick={handleCancelEditing} disabled={isFetching} size="large" block>
                {submit_button.cancel}
              </ToggleEdit>
            )}
          </CreateEditFormItem>
        )}

        <Form.Item noStyle name="duration">
          <StopwatchContainer>
            <Stopwatch
              key={`${selectedWorkout}`}
              ref={durationTimerRef}
              hoursOn
              showResetButton
              disabled={isEdit || !selectedWorkout}
              className="activity-timer"
              initialValue={initialValues.duration}
              msOn={false}
              onPause={updateDurationInForm}
              onReset={resetDuration}
              onChange={handleDurationChange}
            />
          </StopwatchContainer>
        </Form.Item>
        
        <Modal
          open={isModalVisible}
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
    duration: 0,
    workout_id: undefined,
    date: undefined,
    results: [],
    description: '',
  },
}

export default Activity
