/** @format */

import { Form, Input, Button, Modal, Select, notification } from 'antd'
import { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ToggleEdit, DeleteEditPanel, DatePicker, ActivityStopwatch } from 'app/components'
import dayjs, { Dayjs } from 'dayjs'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { ActivityForm } from 'app/store/slices/activity/types'
import { useAppSelector, useNotificationPermissionRequest } from 'app/hooks'
import { Exercise, StyledForm, CreateEditFormItem, WorkoutFormItem, WorkoutLabelContainer, StyledDateFormItem } from './components'
import { selectList } from 'app/store/slices/workout'
import { activityApi } from 'app/store/slices/activity/api'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { WorkoutForm, WorkoutListExercise } from 'app/store/slices/workout/types'
import { API_STATUS } from 'app/constants/api_statuses'
import { getActivityValuesToSubmit, getInitialActivityValues, useLoadWorkoutList, useRestoreActivityFromCacheOnWorkoutListLoaded, useShowActivityError } from './utils'
import { CacheFormData, IActivityProps, InitialValues } from './types'
import { QueryStatus } from '@reduxjs/toolkit/dist/query'
import HistoryProvider from './contexts/history_provider/HistoryProvider'
import ActivityProvider from './contexts/activity_provider/ActivityProvider'
import useItemImagePlaceholder from 'app/hooks/useItemImagePlaceholder'
import { useActivityInProgressContext } from 'app/contexts/activity/ActivityInProgressContextProvider'
import { dayjsToSeconds } from 'app/utils/time'
import { StopwatchContainer } from './components/styled'
import { useNavigate } from 'react-router'
import { routes } from 'src/router'

export type ErrorModalTypes = 'restoreActivity' | 'history'
export type RunningActivityForm = ActivityForm & {
  isRunning?: boolean
}

const createDate = (duration: number) => dayjs.tz(duration, 'UTC')

const Activity: FC<IActivityProps> = ({ deleteStatus, initialValues: _initialValues, isEdit, isFetching, onSubmit, deleteActivity, isError, error, errorCode }) => {
  const navigate = useNavigate()
  const {
    activity: cachedActivity,
    cacheActivity,
    removeActivity: removeCachedActivity,
    getActivity: getCachedActivity,
    onSelectedWorkoutChange,
    pauseStopwatch,
    getCurrentDuration,
    resetStopwatch,
  } = useActivityInProgressContext()
  const [ itemImagePlaceholder ] = useItemImagePlaceholder()

  const [ isEditMode, setEditMode ] = useState(!isEdit && !isFetching)
  const [ isModalVisible, setIsModalVisible ] = useState(false)
  const [ selectedWorkout, setSelectedWorkout ] = useState<WorkoutForm['id']>()

  const { status: workoutListStatus, data: workoutList } = useAppSelector(selectList)
  const { intl, lang } = useIntlContext()

  const $select = useRef(null)
  const errorModalsRef = useRef<{ [key in ErrorModalTypes]: ReturnType<typeof Modal.error> | null }>({
    restoreActivity: null,
    history: null,
  })

  const { input_labels, submit_button, modal, notifications } = intl.pages.activities

  const [ getHistory, { data: _history, isLoading: isHistoryLoading, isError: isHistoryError, error: historyError } ] = activityApi.useLazyGetHistoryQuery()

  const [ form ] = Form.useForm<RunningActivityForm>()

  const initFromCacheRef = useRef(false)

  const handleSelectedWorkoutChange = (value: WorkoutForm['id']) => {
    setSelectedWorkout(value)
    onSelectedWorkoutChange(value)
    removeCachedActivity()
    resetStopwatch()
    return value
  }

  const handleRestoreFromCacheError = () => {
    if (errorModalsRef.current.restoreActivity) {
      errorModalsRef.current.restoreActivity.destroy()
      errorModalsRef.current.restoreActivity = null
    }
    errorModalsRef.current.restoreActivity = Modal.error({
      title: modal.error.title,
      content: modal.error.body,
      okText: modal.error.ok_button,
      onOk: () => {
        form.setFieldsValue({ workout_id: '' })
      },
    })
    removeCachedActivity()
    setSelectedWorkout(null)
    form.setFieldsValue({ workout_id: '' })
  }

  const initialValues = useMemo<InitialValues<Dayjs>>(
    () =>
      getInitialActivityValues({
        isEdit,
        initialValues: _initialValues,
        workoutList,
        cachedActivity,
        selectedWorkout,
        form,
        handleRestoreFromCacheError,
      }),
    [ _initialValues, selectedWorkout, workoutList, cachedActivity ],
  )

  const handleCancelEditing = () => {
    setEditMode(false)
    form.resetFields()
  }

  const handleCancelActivity = () => {
    removeCachedActivity()
    navigate(routes.activities.list())
  }

  const handleSubmit = async (values) => {
    pauseStopwatch()

    return onSubmit(getActivityValuesToSubmit(values, initialValues, workoutList, getCurrentDuration())).then((res) => {
      if (!res.error && !res.data.error) {
        notification.success({
          message: notifications[isEdit ? 'update' : 'create'].success,
          placement: 'top',
        })
      }
      if (!isEdit && !res.error && !res.data.error) {
        cacheActivity(null)
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

  const cacheFormData: CacheFormData = (changedValues, allValues) => {
    if (isEdit) return
    if ('workout_id' in changedValues && Object.keys(changedValues).length === 1) return
    cacheActivity(allValues)
  }

  const updateDurationInForm = (ms: number) => {
    form.setFieldsValue({ duration: ms })
  }

  const resetDuration = () => {
    updateDurationInForm(0)
  }

  const handleOk = (date: Dayjs) => {
    form.setFieldsValue({ duration: dayjsToSeconds(date) })
  }

  useLayoutEffect(() => {
    if (!isFetching) form.setFieldsValue(initialValues)
    if (deleteStatus !== QueryStatus.pending && deleteStatus !== QueryStatus.fulfilled && initialValues.workout_id) {
      if (selectedWorkout !== initialValues.workout_id) setSelectedWorkout(initialValues.workout_id)
      getHistory({ workoutId: initialValues.workout_id as WorkoutForm['id'], activityId: initialValues.id })
    }
  }, [ deleteStatus, selectedWorkout, initialValues, isFetching ])

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
    form,
    isEdit,
    workoutList,
    getCachedFormValues: getCachedActivity,
    workoutListStatus,
    setSelectedWorkout,
    setCachedFormValues: cacheActivity,
    handleSelectedWorkoutChange,
    initFromCacheRef,
    handleRestoreFromCacheError,
  })

  useNotificationPermissionRequest()

  useEffect(() => {
    if (cachedActivity?.isRunning) {
      form.setFieldsValue({ isRunning: true, duration: cachedActivity.duration })
    }
  }, [ cachedActivity?.isRunning ])

  useEffect(() => {
    if (cachedActivity?.isPaused) {
      form.setFieldsValue({ isRunning: false, duration: cachedActivity.duration })
      updateDurationInForm(cachedActivity.duration)
    }
  }, [ cachedActivity?.isPaused ])

  useEffect(() => {
    if (cachedActivity?.isStopped) {
      form.setFieldsValue({ isRunning: false, duration: 0 })
      resetDuration()
    }
  }, [ cachedActivity?.isStopped ])

  useEffect(() => {
    if (isEdit) return
    if (initialValues.workout_id) {
      cacheActivity({ ...initialValues, workout_id: initialValues.workout_id })
    }
  }, [ selectedWorkout ])

  const isFormItemDisabled = !isEditMode || isFetching

  return (
    <ActivityProvider form={form} selectedWorkout={selectedWorkout} activityId={initialValues.id}>
      <HistoryProvider activityId={initialValues.id} historyData={_history?.data} isLoading={isHistoryLoading} loadHistory={getHistory}>
        <StyledForm
          onValuesChange={cacheFormData}
          preserve={false}
          form={form}
          initialValues={initialValues}
          onFinish={handleSubmit}
          layout="vertical"
          $isEdit={isEdit}
        >
          {isEdit && (
            <StopwatchContainer>
              <ActivityStopwatch
                hideEditButton={!isEditMode}
                time={createDate(initialValues.duration ?? 0)}
                initialDuration={initialValues.duration}
                isDisabled={isFormItemDisabled}
                onOk={handleOk}
                stopwatchProps={{
                  showStopButton: false,
                  showRunPauseButton: false,
                }}
              />
            </StopwatchContainer>)}
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
          <WorkoutFormItem
            required
            label={<WorkoutLabelContainer>{input_labels.workout}</WorkoutLabelContainer>}
            name="workout_id"
            rules={[ { required: true, message: 'Required' } ]}
          >
            <Select
              ref={$select}
              disabled={isFormItemDisabled || isEdit}
              size="large"
              showSearch
              optionFilterProp="label"
              onSelect={() => $select.current?.blur()}
              onChange={handleSelectedWorkoutChange}
            >
              {workoutListStatus === API_STATUS.LOADED || workoutListStatus === API_STATUS.ERROR
                ? workoutList.map(workout => (
                  <Select.Option key={workout.id} value={workout.id} label={workout.title}>
                    {workout.title}
                  </Select.Option>
                ))
                : workoutListStatus === API_STATUS.LOADING ? (
                  <Select.Option value={_initialValues.workout_id}>
                    {intl.common.loading}
                  </Select.Option>
                ) : null}
            </Select>
          </WorkoutFormItem>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) =>
              workoutList
                .find(workout => workout.id === getFieldValue('workout_id'))
                ?.exercises.map((exercise: WorkoutListExercise<number>, i, list) => (
                  <Exercise
                    key={exercise._id as string}
                    itemImagePlaceholder={itemImagePlaceholder}
                    exerciseList={list as WorkoutListExercise<number>[]}
                    roundResults={initialValues.results[i]}
                    form={form}
                    exerciseIndex={i}
                    isFormItemDisabled={isFormItemDisabled}
                    isEdit={isEdit}
                    cacheFormData={cacheFormData}
                    orderInWorkout={i}
                    {...exercise}
                    id={exercise._id}
                  />
                ))
            }
          </Form.Item>
          <Form.Item label={input_labels.description} name="description">
            <Input.TextArea disabled={isFormItemDisabled} showCount maxLength={300} autoSize={{ minRows: 2, maxRows: 8 }} />
          </Form.Item>
          {/* Hidden form items to track activity status and duration in form.getFieldsValue() */}
          <Form.Item name="isRunning" hidden />
          <Form.Item name="isPaused" hidden />
          <Form.Item name="isStopped" hidden />
          <Form.Item name="duration" hidden />
          {(isEditMode || !isEdit) && (
            <CreateEditFormItem shouldUpdate>
              {({ getFieldValue }) => getFieldValue('workout_id') && (
                <>
                  <Button type="primary" htmlType="submit" size="large" block loading={isFetching}>
                    {isEdit ? submit_button.save : submit_button.finish}
                  </Button>
                  {isEdit
                    ? (
                      <ToggleEdit onClick={handleCancelEditing} disabled={isFetching} size="large" block>
                        {submit_button.cancel}
                      </ToggleEdit>
                    )
                    : (
                      <Button size="large" block loading={isFetching} onClick={handleCancelActivity} style={{ marginTop: '10px' }}>
                        {submit_button.cancel}
                      </Button>
                    )}
                </>
              )}
            </CreateEditFormItem>
          )}

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
      </HistoryProvider>
    </ActivityProvider>
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
