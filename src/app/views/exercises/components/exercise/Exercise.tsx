import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  Checkbox,
  Modal,
  notification,
} from 'antd'
import { FC, useEffect, useMemo, useReducer, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { DeleteEditPanel, SelectWithItemCreating, TimePicker } from 'app/components'
import { isExerciseTimeType } from 'app/utils/time'
import { ToggleEdit } from 'app/components'
import { ExerciseForm } from 'app/store/slices/exercise/types'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { Input as CustomInput } from 'app/components'
import {
  StyledForm,
  StyledFormItem,
  StyledModal,
  CreateEditFormItem,
  ImageFormItem,
  ShortFormItem,
  HoursFormItem,
} from './components'
import { useNavigate } from 'react-router'
import { useAppSelector } from 'app/hooks'
import getBase64 from 'app/utils/getBase64'
import { selectList } from 'store/slices/muscleGroup'
import { muscleGroupApi } from 'store/slices/muscleGroup/api'
import { API_STATUS } from 'app/constants/api_statuses'
import { ApiGetMuscleGroupError, previewReducer, IExercise, useShowDeleteMuscleGroupError, clearValues, useInitialValues } from './utils'
import style from './utils/modal.module.scss'


const Exercise: FC<IExercise> = ({ initialValues: _initialValues, deleteExercise, isEdit, isFetching, onSubmit, isError, error, errorCode }) => {
  const navigate = useNavigate()
  const [ isEditMode, setEditMode ] = useState(!isEdit && !isFetching)
  const [ isModalVisible, setIsModalVisible ] = useState(false)
  const [ isMuscleGroupSelectOpen, setIsMuscleGroupSelectOpen ] = useState<boolean | undefined>(undefined)
  const [ preview, dispatchPreview ] = useReducer(previewReducer, { visible: false, title: '', url: '' })

  const [ fetchMuscleGroupList, { error: fetchMuscleGroupsError } ] = muscleGroupApi.useLazyListQuery()
  const { data: muscleGroupList, status: muscleGroupListStatus } = useAppSelector(selectList)
  const muscleGroupsItems = useMemo(
    () => muscleGroupList.map(muscleGroup => ({ label: muscleGroup.title, id: muscleGroup.id, value: muscleGroup.id })),
    [ muscleGroupList ],
  )

  const [ createMuscleGroup, { error: createMuscleGroupError } ] = muscleGroupApi.useCreateMutation()
  const [ deleteMuscleGroup, { error: deleteMuscleGroupError } ] = muscleGroupApi.useDeleteMutation()

  const handleAddItem = async (newMuscleGroup: { label: string, id: string }) => {
    try {
      return await createMuscleGroup({ title: newMuscleGroup.label, id: newMuscleGroup.id }).unwrap()
    } catch (createError) {
      console.error(createError)
    }
  }

  const { lang, intl } = useIntlContext()
  const { input_labels, submit_button, payload, modal, notifications } = intl.pages.exercises
  const { title, ok_text, default_content } = intl.modal.common

  const [ form ] = Form.useForm<ExerciseForm>()
  const { initialValues } = useInitialValues(_initialValues, muscleGroupsItems, muscleGroupListStatus, isFetching, isError, form)

  const requestForDeleteMuscleGroupPromise = (muscleGroupName: string) => {
    setIsMuscleGroupSelectOpen(true)

    return new Promise((resolve) => {
      const _modal = Modal.confirm({
        okButtonProps: { danger: true },
        title: intl.rest.muscle_group.delete_muscle_group.title,
        content: intl.rest.muscle_group.delete_muscle_group.content.replace('%name%', muscleGroupName),
        okText: intl.common.yes,
        cancelText: intl.common.no,
        maskStyle: {
          zIndex: 10001,
        },
        wrapClassName: style.modalWrapper,
        onOk: () => {
          resolve(true)
          _modal.destroy()
        },
        onCancel: () => {
          resolve(false)
          _modal.destroy()
        },
        afterClose() {
          setIsMuscleGroupSelectOpen(undefined)
        },
      })
    })
  }

  const handleDeleteMuscleGroup = async (id: string) => {
    try {
      const deletedItemIndexInValues = form.getFieldValue('muscle_groups').findIndex(item => item.value === id)
      const isDeletingConfirmed = await requestForDeleteMuscleGroupPromise(muscleGroupList.find(item => item.id === id)?.title)

      if (isDeletingConfirmed) {
        if (deletedItemIndexInValues !== -1) {
          form.setFieldsValue({
            muscle_groups: form.getFieldValue('muscle_groups').filter(item => item.value !== id),
          })
        }
        setTimeout(() => {
          deleteMuscleGroup({ id })
        }, 1000)
      }
    } catch (deleteError) {
      console.error(deleteError)
    }
  }

  const selectAfter = useMemo(() => (
    <Form.Item name="mass_unit" noStyle>
      <Select disabled={!isEditMode || isFetching}>
        <Select.Option value="kg">{payload.mass_unit.kg[0]}</Select.Option>
        <Select.Option value="lb">{payload.mass_unit.lb[0]}</Select.Option>
      </Select>
    </Form.Item>
  ), [ isEditMode, isFetching, lang ])

  const handleWeightChange = (value: number | null) => form.setFieldsValue({ weight: value })

  const handleRepeatsChange = (value: number | null) => form.setFieldsValue({ repeats: value })

  const handleCancelEditing = () => {
    setEditMode(false)
    form.resetFields()
  }

  const handlePreviewOpen = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }

    dispatchPreview({
      type: 'open',
      payload: {
        title: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        url: file.url || file.preview,
      },
    })
  }

  const handlePreviewClose = () => {
    dispatchPreview({
      type: 'close',
      payload: {},
    })
  }

  const handleSubmit = async (_values) => {
    let { time, image, muscle_groups, ...values } = _values
    values = clearValues(values)
    values = (() => {
      const formData = new FormData()
      Object
        .entries(values)
        .forEach(([ key, value ]) => value !== undefined && value !== null && formData.append(key, `${value}`))

      formData.append('muscle_groups', JSON.stringify(muscle_groups.map(item => item.value)))

      return formData
    })()

    if (time) {
      const [ h, m, s ] = [ time.hour(), time.minute(), time.second() ]
      const timeInSeconds = s + (m * 60) + (h * 60 * 60)
      values.append('time', timeInSeconds)
    }

    if (image && image.length) {
      [ image ] = image
      if (image.originFileObj) {
        values.append('image_uid', image.uid)
        values.append('image', image.originFileObj)
      } else {
        image = { ...image }
        delete image.uploaded_at

        Object
          .entries(image)
          .forEach(([ key, value ]) => {
            values.append(`image_${key}`, value)
          })
      }
    }

    if (initialValues.id) {
      values.append('id', initialValues.id)
    }

    return onSubmit(values)
      .then((res) => {
        if (!res.error && !res.data.error) {
          notification.success({
            message: notifications[isEdit ? 'update' : 'create'].success,
            placement: 'top',
          })
        } 
        if (isEdit && !res.error && !res.data.error) setEditMode(false)
        return res
      })
  }

  const handleDelete = () => deleteExercise(initialValues.id).then((res) => {
    setIsModalVisible(false)
    return res
  })

  useEffect(() => {
    if (error || isError) {
      Modal.error({
        title: title.error,
        content: error || default_content.error,
        okText: ok_text,
        onOk() {
          if (errorCode === 404) navigate('/exercises')
        },
      })
    }
  }, [ !!error, isError ])

  useEffect(() => {
    fetchMuscleGroupList({ lang: isEdit ? lang : undefined, exerciseId: initialValues.id })
  }, [])

  useEffect(() => {
    document.querySelector('#muscle_groups').setAttribute('inputmode', 'none')
  }, [])

  useShowDeleteMuscleGroupError([ fetchMuscleGroupsError, createMuscleGroupError, deleteMuscleGroupError ] as ApiGetMuscleGroupError[])

  const isFormItemDisabled = !isEditMode || isFetching
  const isInActivity = initialValues.is_in_activity

  return (
    <StyledForm preserve={false} form={form} initialValues={initialValues} onFinish={handleSubmit} layout="vertical">
      {isEdit && (
        <DeleteEditPanel
          isEditMode={isEditMode}
          onEditClick={() => setEditMode(true)}
          onDeleteClick={() => setIsModalVisible(true)}
          deleteButtonProps={{ disabled: isFetching }}
          editButtonProps={{ disabled: isFetching }}
        />
      )}
      <Form.Item label={input_labels.title} name="title" required rules={[ { required: true, message: 'Required' } ]}>
        <Input disabled={isFormItemDisabled} size="large" />
      </Form.Item>
      <Form.Item label={input_labels.type} name="type" required rules={[ { required: true, message: 'Required' } ]}>
        <Select disabled={isFormItemDisabled || isInActivity} size="large">
          <Select.Option value="weight">{input_labels.type.options.weight}</Select.Option>
          <Select.Option value="repeats">{input_labels.type.options.repeats}</Select.Option>
          <Select.Option value="distance">{input_labels.type.options.distance}</Select.Option>
          <Select.Option value="time">{input_labels.type.options.time}</Select.Option>
          <Select.Option value="duration">{input_labels.type.options.duration}</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label={input_labels.muscle_groups} name="muscle_groups">
        <SelectWithItemCreating
          disabled={isFormItemDisabled}
          isOpen={isMuscleGroupSelectOpen}
          loading={muscleGroupListStatus === API_STATUS.LOADING}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteMuscleGroup}
          items={muscleGroupsItems}
        />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }} name="each_side" valuePropName="checked">
        <Checkbox disabled={isFormItemDisabled || isInActivity}>
          {input_labels.each_side}
        </Checkbox>
      </Form.Item>
      <HoursFormItem shouldUpdate>
        {({ getFieldValue }) => isExerciseTimeType(getFieldValue('type')) && (
          <Form.Item name="hours" valuePropName="checked">
            <Checkbox disabled={isFormItemDisabled}>
              {input_labels.hours}
            </Checkbox>
          </Form.Item>
        )}
      </HoursFormItem>
      <StyledFormItem shouldUpdate>
        {({ getFieldValue }) => {
          const type = getFieldValue('type')
          const shouldRenderTimeInput = !isExerciseTimeType(type)
          const shouldRenderWeightInput = type !== 'weight'
          return (
            <>
              {shouldRenderTimeInput
                ? (
                  <ShortFormItem $margin name="time" label={input_labels.time}>
                    <TimePicker
                      disabled={isFormItemDisabled || isInActivity}
                      inputReadOnly
                      showNow={false}
                      size="large"
                      allowClear={false}
                      placeholder=""
                    />
                  </ShortFormItem>
                )
                : (
                  <ShortFormItem name="repeats" label={input_labels.repeats} $margin>
                    <CustomInput.Number int onlyPositive disabled={isFormItemDisabled || isInActivity} onChange={handleRepeatsChange} onBlur={handleRepeatsChange} size="large" />
                  </ShortFormItem>
                )}
              {shouldRenderWeightInput
                ? (
                  <ShortFormItem name="weight" label={input_labels.weight}>
                    <CustomInput.Number onlyPositive disabled={isFormItemDisabled || isInActivity} onChange={handleWeightChange} onBlur={handleWeightChange} size="large" addonAfter={selectAfter} />
                  </ShortFormItem>
                )
                : (
                  <ShortFormItem name="repeats" label={input_labels.repeats}>
                    <CustomInput.Number int onlyPositive disabled={isFormItemDisabled || isInActivity} onChange={handleRepeatsChange} onBlur={handleRepeatsChange} size="large" />
                  </ShortFormItem>
                )}
            </>
          )
        }}
      </StyledFormItem>
      <Form.Item label={input_labels.description} name="description">
        <Input.TextArea disabled={isFormItemDisabled} showCount maxLength={300} autoSize={{ minRows: 2, maxRows: 8 }} />
      </Form.Item>
      <ImageFormItem label={input_labels.image} style={{ marginBottom: isEditMode ? '' : '0' }} name="image" valuePropName="fileList" getValueFromEvent={({ fileList }) => fileList}>
        <Upload.Dragger beforeUpload={() => false} onPreview={handlePreviewOpen} listType="picture-card" maxCount={1} accept="image/*" disabled={!isEditMode || isFetching}>
          <PlusOutlined />
        </Upload.Dragger>
      </ImageFormItem>
      <StyledModal
        open={preview.visible}
        title={preview.title}
        footer={null}
        onCancel={handlePreviewClose}
      >
        <img alt="example" style={{ width: '100%' }} src={preview.url} />
      </StyledModal>
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
  )
}

Exercise.defaultProps = {
  initialValues: {
    title: '',
    is_in_workout: false,
    muscle_groups: [],
    type: 'repeats',
    each_side: false,
    mass_unit: 'kg',
    archived: false,
  },
}

export default Exercise
