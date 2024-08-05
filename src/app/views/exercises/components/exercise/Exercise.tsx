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
import { DeleteEditPanel, TimePicker } from 'app/components'
import { Dayjs } from 'dayjs'
import { isExerciseTimeType, secondsToDayjs } from 'app/utils/time'
import { ToggleEdit } from 'app/components'
import { ExerciseForm, Image } from 'app/store/slices/exercise/types'
import routes from 'app/constants/end_points'
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
import { useMounted } from 'app/hooks'
import getBase64 from 'app/utils/getBase64'

export type InitialValues = {
  title: string;
  each_side: boolean;
  type?: 'repeats' | 'time' | 'duration' | 'distance';
  time?: number | Dayjs;
  repeats?: number;
  weight?: number;
  description?: string;
  image?: {
    uid: string,
    url: string,
    name: string,
  };
}

export interface IExercise {
  id?: string;
  isEdit?: boolean;
  isFetching?: boolean;
  initialValues?: ExerciseForm;
  isError: boolean;
  error?: string;
  errorCode?: number;
  errorAppCode?: number;
  deleteExercise?: Function;
  onSubmit: Function;
}

const previewReducer = (state, { type, payload }) => {
  switch (type) {
    case 'open':
      return {
        ...state,
        visible: true,
        title: payload.title,
        url: payload.url,
      }
    case 'close': 
      return {
        ...state,
        visible: false,
        title: '',
        url: '',
      }
    default:
      return state
  }
}

const Exercise: FC<IExercise> = ({ initialValues: _initialValues, deleteExercise, isEdit, isFetching, onSubmit, isError, error, errorCode }) => {
  const { isMounted, useHandleMounted } = useMounted()
  const navigate = useNavigate()
  const [ isEditMode, setEditMode ] = useState(!isEdit && !isFetching)
  const [ isModalVisible, setIsModalVisible ] = useState(false)
  const [ preview, dispatchPreview ] = useReducer(previewReducer, { visible: false, title: '', url: '' })
  const { intl } = useIntlContext()
  const { input_labels, submit_button, payload, modal, notifications } = intl.pages.exercises
  const { title, ok_text, default_content } = intl.modal.common

  const [ form ] = Form.useForm<ExerciseForm>()
  const initialValues = useMemo(() => {
    const {
      is_in_workout: _is_in_workout,
      ...exercise
    } = { ..._initialValues }

    let time: number | Dayjs = exercise.time
    if (time && typeof time !== 'object') {
      time = secondsToDayjs(time)
      exercise.time = time
    }

    if (exercise.image) {
      const image = exercise.image as Image
      exercise.image = {
        ...image,
        url: image.url
          ? image.url.startsWith('data:image/')
            ? image.url
            : `${routes.base}${image.url}`
          : '',
      }
      exercise.image = [ image ]
      return exercise
    }
    return exercise
  }, [ _initialValues ])

  const selectAfter = useMemo(() => (
    <Form.Item name="mass_unit" noStyle>
      <Select disabled={!isEditMode || isFetching}>
        <Select.Option value="kg">{payload.mass_unit.kg[0]}</Select.Option>
        <Select.Option value="lb">{payload.mass_unit.lb[0]}</Select.Option>
      </Select>
    </Form.Item>
  ), [ isEditMode, isFetching ])

  const handleWeightChange = value => form.setFieldsValue({ weight: value })

  const handleRepeatsChange = value => form.setFieldsValue({ repeats: value })

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
    let { time, image, ...values } = _values
    values = (() => {
      const formData = new FormData()
      Object
        .entries(values)
        .forEach(([ key, value ]) => value !== undefined && formData.append(key, `${value}`))

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
    if (isMounted() && !isFetching && !isError) form.setFieldsValue(initialValues)
  }, [ initialValues, isFetching ])

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

  useHandleMounted()

  const isFormItemDisabled = !isEditMode || isFetching

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
        <Select disabled={isFormItemDisabled || _initialValues.is_in_workout} size="large">
          <Select.Option value="weight">{input_labels.type.options.weight}</Select.Option>
          <Select.Option value="repeats">{input_labels.type.options.repeats}</Select.Option>
          <Select.Option value="distance">{input_labels.type.options.distance}</Select.Option>
          <Select.Option value="time">{input_labels.type.options.time}</Select.Option>
          <Select.Option value="duration">{input_labels.type.options.duration}</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }} name="each_side" valuePropName="checked">
        <Checkbox disabled={isFormItemDisabled || _initialValues.is_in_workout}>
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
                      disabled={isFormItemDisabled}
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
                    <CustomInput.Number int onlyPositive disabled={isFormItemDisabled} onChange={handleRepeatsChange} onBlur={handleRepeatsChange} size="large" />
                  </ShortFormItem>
                )}
              {shouldRenderWeightInput
                ? (
                  <ShortFormItem name="weight" label={input_labels.weight}>
                    <CustomInput.Number onlyPositive disabled={isFormItemDisabled} onChange={handleWeightChange} onBlur={handleWeightChange} size="large" addonAfter={selectAfter} />
                  </ShortFormItem>
                )
                : (
                  <ShortFormItem name="repeats" label={input_labels.repeats}>
                    <CustomInput.Number int onlyPositive disabled={isFormItemDisabled} onChange={handleRepeatsChange} onBlur={handleRepeatsChange} size="large" />
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
    type: 'repeats',
    each_side: false,
    mass_unit: 'kg',
    archived: false,
  },
}

export default Exercise
