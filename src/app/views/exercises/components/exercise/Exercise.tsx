import { useRouter } from 'next/router'
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  Checkbox,
  Modal,
} from 'antd'
import { FC, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { DeleteEditPanel, TimePicker } from 'app/components'
import { Dayjs } from 'dayjs'
import { isExerciseTimeType, secondsToDayjs } from 'app/utils/time'
import { ToggleEdit } from 'app/components'
import { ExerciseForm, Image } from 'app/store/slices/exercise/types'
import routes from 'app/constants/end_points'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'
import { Input as CustomInput } from 'app/components'
import { RouterContext } from 'app/contexts/router/RouterContextProvider'
import {
  StyledForm,
  StyledFormItem,
  StyledModal,
  CreateEditFormItem,
  ImageFormItem,
  ShortFormItem,
  HoursFormItem,
} from './components'

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

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
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
  const router = useRouter()
  const [ isEditMode, setEditMode ] = useState(!isEdit && !isFetching)
  const [ isModalVisible, setIsModalVisible ] = useState(false)
  const [ preview, dispatchPreview ] = useReducer(previewReducer, { visible: false, title: '', url: '' })
  const { intl } = useContext(IntlContext)
  const { loading } = useContext(RouterContext)
  const { input_labels, submit_button, payload, modal } = intl.pages.exercises
  const { title, ok_text, default_content } = intl.modal.common

  const [ form ] = Form.useForm<ExerciseForm>()
  const initialValues = useMemo(() => {
    const exercise = { ..._initialValues }
    let time: number | Dayjs = exercise.time
    if (time && typeof time !== 'object') {
      time = secondsToDayjs(time)
      exercise.time = time
    }

    if (exercise.image) {
      exercise.image = {
        ...exercise.image,
        url: `${routes.base}${(exercise.image as Image).url}`,
      }
      exercise.image = [ (exercise.image as Image) ]
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

  const mountedRef = useRef(false)

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
        if (isEdit && !res.error && !res.data.error) setEditMode(false)
        return res
      })
  }

  const handleDelete = () => deleteExercise(initialValues.id).then((res) => {
    setIsModalVisible(false)
    return res
  })

  useEffect(() => {
    if (mountedRef.current) {
      form.setFieldsValue(initialValues)
    }
  }, [ initialValues ])

  useEffect(() => {
    if (error || isError) {
      Modal.error({
        title: title.error,
        content: error || default_content.error,
        okText: ok_text,
        onOk() {
          if (errorCode === 404) router.push('/exercises')
        },
      })
    }
  }, [ !!error, isError ])

  useEffect(() => {
    mountedRef.current = true
  }, [])

  const isFormItemDisabled = !isEditMode || isFetching || loading

  return (
    <>
      <StyledForm preserve={false} form={form} initialValues={initialValues} onFinish={handleSubmit} layout="vertical">
        {isEdit && (
          <DeleteEditPanel
            isEditMode={isEditMode}
            onEditClick={() => setEditMode(true)}
            onDeleteClick={() => setIsModalVisible(true)}
            deleteButtonProps={{ disabled: isFetching || loading }}
          />
        )}
        <Form.Item label={input_labels.title} name="title" required rules={[ { required: true, message: 'Required' } ]}>
          <Input disabled={isFormItemDisabled} size="large" />
        </Form.Item>
        <Form.Item label={input_labels.type} name="type" required rules={[ { required: true, message: 'Required' } ]}>
          <Select disabled={isFormItemDisabled} size="large">
            <Select.Option value="repeats">{input_labels.type.options.repeats}</Select.Option>
            <Select.Option value="time">{input_labels.type.options.time}</Select.Option>
            <Select.Option value="duration">{input_labels.type.options.duration}</Select.Option>
            <Select.Option value="distance">{input_labels.type.options.distance}</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }} name="each_side" valuePropName="checked">
          <Checkbox disabled={isFormItemDisabled}>
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
            return (
              <>
                {shouldRenderTimeInput
                  ? (
                    <ShortFormItem name="time" label={input_labels.time}>
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
                    <ShortFormItem name="repeats" label={input_labels.repeats} $fullWidth $margin>
                      <CustomInput.Number int positive disabled={isFormItemDisabled} onChange={handleRepeatsChange} onBlur={handleRepeatsChange} size="large" />
                    </ShortFormItem>
                  )}
                <ShortFormItem name="weight" label={input_labels.weight} $fullWidth={!shouldRenderTimeInput}>
                  <CustomInput.Number positive disabled={isFormItemDisabled} onChange={handleWeightChange} onBlur={handleWeightChange} size="large" addonAfter={selectAfter} />
                </ShortFormItem>
              </>
            )
          }}
        </StyledFormItem>
        <Form.Item label={input_labels.description} name="description">
          <Input.TextArea disabled={isFormItemDisabled} showCount maxLength={300} autoSize={{ minRows: 2, maxRows: 8 }} />
        </Form.Item>
        <ImageFormItem label={input_labels.image} style={{ marginBottom: isEditMode ? '' : '0' }} name="image" valuePropName="fileList" getValueFromEvent={({ fileList }) => fileList}>
          <Upload.Dragger onPreview={handlePreviewOpen} listType="picture-card" maxCount={1} accept="image/*" disabled={!isEditMode || isFetching}>
            <PlusOutlined />
          </Upload.Dragger>
        </ImageFormItem>
        <StyledModal
          visible={preview.visible}
          title={preview.title}
          footer={null}
          onCancel={handlePreviewClose}
        >
          <img alt="example" style={{ width: '100%' }} src={preview.url} />
        </StyledModal>
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

Exercise.defaultProps = {
  initialValues: {
    title: '',
    type: 'repeats',
    each_side: false,
    mass_unit: 'kg',
  },
}

export default Exercise
