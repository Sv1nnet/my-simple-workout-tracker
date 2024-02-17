/** @format */

import { Form, Input, Button, Modal, Select, notification } from 'antd'
import { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ToggleEdit, DeleteEditPanel, DatePicker, Stopwatch } from 'app/components'
import dayjs, { Dayjs } from 'dayjs'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { ActivityForm, HistoryServerPayload } from 'app/store/slices/activity/types'
import { useAppSelector, useLocalStorage, useNotificationPermissionRequest } from 'app/hooks'
import { Exercise, StyledForm, CreateEditFormItem, WorkoutFormItem, WorkoutLabelContainer, StyledDateFormItem } from './components'
import { selectList } from 'app/store/slices/workout'
import { activityApi } from 'app/store/slices/activity/api'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { WorkoutForm, WorkoutListExercise } from 'app/store/slices/workout/types'
import { API_STATUS } from 'app/constants/api_statuses'
import { getActivityValuesToSubmit, getInitialActivityValues, getResultsFromWorkoutList, useLoadWorkoutList, useRestoreActivityFromCacheOnWorkoutListLoaded, useShowActivityError } from './utils'
import { CacheFormData, IActivityProps, InitialValues } from './types'
import { StopwatchContainer } from './components/styled'
import { StopwatchRef } from 'app/components/stopwatch/Stopwatch'

export type ErrorModalTypes = 'restoreActivity' | 'history'

const Activity: FC<IActivityProps> = ({ initialValues: _initialValues, isEdit, isFetching, onSubmit, deleteActivity, isError, error, errorCode }) => {
  const [ cachedFormValues, setCachedFormValues, removeCachedFormValues, getCachedFormValues ] = useLocalStorage<InitialValues | null>('cached_activity', null)

  const [ isEditMode, setEditMode ] = useState(!isEdit && !isFetching)
  const [ isModalVisible, setIsModalVisible ] = useState(false)
  const [ selectedWorkout, setSelectedWorkout ] = useState<Pick<WorkoutForm, 'id'>>()

  const { status: workoutListStatus, data: workoutList } = useAppSelector(selectList)
  const { intl, lang } = useIntlContext()

  const errorModalsRef = useRef<{ [key in ErrorModalTypes]: ReturnType<typeof Modal.error> | null }>({
    restoreActivity: null,
    history: null,
  })

  const { input_labels, submit_button, modal, notifications } = intl.pages.activities

  const [ getHistory, { data: _history, isLoading: isHistoryLoading, isError: isHistoryError, error: historyError } ] = activityApi.useLazyGetHistoryQuery()
  const history = useMemo<HistoryServerPayload>(
    () =>
      _history
        ? Object.entries(_history.data).reduce((acc, [ exercise_id, results ]) => {
          acc[exercise_id] = (results as { items }).items.map(item => ({
            date: dayjs(item.date),
            results: item.results,
          }))
          return acc
        }, {})
        : _history,
    [ _history ],
  )

  const [ form ] = Form.useForm<ActivityForm>()

  const initFromCacheRef = useRef(false)
  const durationTimerRef = useRef<StopwatchRef>(null)

  const handleRestoreFromCacheError = () => {
    if (errorModalsRef.current.restoreActivity) {
      errorModalsRef.current.restoreActivity.destroy()
      errorModalsRef.current.restoreActivity = null
    }
    errorModalsRef.current.restoreActivity = Modal.error({
      title: modal.error.title,
      content: modal.error.body,
      okText: modal.error.ok_button,
    })
    removeCachedFormValues()
    setSelectedWorkout(null)
  }

  const initialValues = useMemo<InitialValues<Dayjs>>(
    () =>
      getInitialActivityValues({
        isEdit,
        initialValues: _initialValues,
        workoutList,
        cachedFormValues,
        selectedWorkout,
        initFromCacheRef,
        form,
        handleRestoreFromCacheError,
      }),
    [ _initialValues, selectedWorkout, workoutList ],
  )

  const handleCancelEditing = () => {
    setEditMode(false)
    form.resetFields()
  }

  const handleSubmit = async (values) => {
    durationTimerRef.current.pauseTimer()

    return onSubmit(getActivityValuesToSubmit(values, initialValues, workoutList, durationTimerRef)).then((res) => {
      if (!res.error && !res.data.error) {
        notification.success({
          message: notifications[isEdit ? 'update' : 'create'].success,
          placement: 'top',
        })
      }
      if (!isEdit && !res.error && !res.data.error) {
        setCachedFormValues(null)
      }
      if (isEdit && !res.error && !res.data.error) {
        setEditMode(false)
        if (selectedWorkout && initialValues.date.toString() !== values.date.toString()) getHistory({ workoutId: selectedWorkout, activityId: initialValues.id })
      }
      return res
    })
  }

  const handleDelete = () =>
    deleteActivity(initialValues.id).then((res) => {
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
    setCachedFormValues(newCachedValues)
    return value
  }

  const cacheFormData: CacheFormData = (changedValues, allValues) => {
    if (isEdit) return
    if ('workout_id' in changedValues && Object.keys(changedValues).length === 1) return
    setCachedFormValues(allValues)
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
    if (!isFetching) form.setFieldsValue(initialValues)
    if (initialValues.workout_id) {
      setSelectedWorkout(initialValues.workout_id)
      getHistory({ workoutId: initialValues.workout_id as Pick<WorkoutForm, 'id'>, activityId: initialValues.id })
    }
  }, [ initialValues, isFetching ])

  useShowActivityError({
    lang,
    historyError: historyError as CustomBaseQueryError,
    error,
    isError,
    isHistoryError,
    errorCode,
    errorModalsRef,
    intl,
  })

  useLoadWorkoutList({
    isEdit,
    workoutList,
    workoutListStatus,
    initialValues,
    form,
    intl,
  })

  useEffect(() => {
    if (selectedWorkout) getHistory({ workoutId: selectedWorkout, activityId: initialValues.id })
  }, [ selectedWorkout ])

  useRestoreActivityFromCacheOnWorkoutListLoaded({
    isEdit,
    getCachedFormValues,
    workoutListStatus,
    setSelectedWorkout,
    setCachedFormValues,
    initFromCacheRef,
    handleRestoreFromCacheError,
  })

  useNotificationPermissionRequest()

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
        <StyledDateFormItem required name="date" $isEdit={isEdit}>
          <DatePicker disabled={isFormItemDisabled} inputReadOnly bordered={false} size="small" allowClear={false} />
        </StyledDateFormItem>
        <WorkoutFormItem required label={<WorkoutLabelContainer>{input_labels.workout}</WorkoutLabelContainer>} name="workout_id" rules={[ { required: true, message: 'Required' } ]}>
          <Select disabled={isFormItemDisabled || isEdit} size="large" onChange={handleSelectedWorkoutChange}>
            {workoutListStatus === API_STATUS.LOADED || workoutListStatus === API_STATUS.ERROR
              ? workoutList.map(workout => (
                <Select.Option key={workout.id} value={workout.id}>
                  {workout.title}
                </Select.Option>
              ))
              : (
                <Select.Option value={initialValues.workout_id}>
                  {intl.common.loading}
                </Select.Option>
              )}
          </Select>
        </WorkoutFormItem>
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) =>
            workoutList
              .find(workout => workout.id === getFieldValue('workout_id'))
              ?.exercises.map((exercise: WorkoutListExercise<number>, i, list) => (
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
