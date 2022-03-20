import styled from 'styled-components'
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
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { TimePicker } from 'app/components'
import { Dayjs } from 'dayjs'
import { timeToDayjs } from 'app/utils/time'
import { ExerciseForm, Image } from 'app/store/slices/exercise/types'
import routes from 'app/constants/end_points'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'

const StyledForm = styled(Form)`
  position: relative;
  padding: 15px;
`
const StyledFormItem = styled(Form.Item)`
  margin-bottom: 0;

  & > .ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content {
    display: flex;
    justify-content: space-around;
  }

  .ant-picker {
    width: 100%;
  }
`
const ShortFormItem = styled(Form.Item)`
  display: ${({ $fullWidth }) => $fullWidth ? 'block' : 'inline-block'};
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'calc(50% - 8px)'};
  margin-right: ${({ $margin }) => $margin ? '8px' : ''};
`

const ImageFormItem = styled(Form.Item)`
  transition: none;

  .ant-form-item-control-input-content > span {
    display: flex;
    & .ant-upload-btn {
      padding: 35px 0;
    }
    & .ant-upload-list-picture-card {
      order: -1;
    }
  }
`

const CreateEditFormItem = styled(Form.Item)`
  margin-bottom: 0;
`

const ToggleEdit = styled(Button)`
  ${({ $enable }) => $enable ? `
    position: absolute;
    z-index: 1;
    top: 6px;
    right: 15px;
  ` : `
    margin-top: 15px;
  `}
`

const StyledModal = styled(Modal)`
  .ant-modal-header {
    padding-right: 52px;
  }
`

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
  error?: string;
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

const FLOAT_REGEXP = /(^\d+$)|(^\d{1,}(\.|,)$)|(^\d+(\.|,)\d{1,}$)|(^(\.|,)\d{1,}$)/
const INT_REGEXP = /^\d+$/

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

const Exercise: FC<IExercise> = ({ initialValues: _initialValues, isEdit, isFetching, onSubmit, error }) => {
  const [ weight, setWeight ] = useState(null)
  const [ repeats, setRepeats ] = useState(null)
  const [ isEditMode, setEditMode ] = useState(!isEdit && !isFetching)
  const [ preview, dispatchPreview ] = useReducer(previewReducer, { visible: false, title: '', url: '' })
  const { input_labels, submit_button, payload, modal } = useContext(IntlContext).intl.pages.exercises

  const [ form ] = Form.useForm<ExerciseForm>()
  const initialValues = useMemo(() => {
    const exercise = { ..._initialValues }
    let time: number | Dayjs = exercise.time
    if (time && typeof time !== 'object') {
      time = timeToDayjs(time)
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

  const handleWeightChange = ({ target }) => {
    let { value } = target
    if (value === '' || FLOAT_REGEXP.test(value)) {
      value = value.replace(',', '.')
      form.setFieldsValue({ weight: value })
      setWeight(value)
    } else {
      form.setFieldsValue({ weight: weight })
      setWeight(weight)
    }
  }

  const handleWeightBlur = ({ target }) => {
    let { value } = target
    if (value === '' || FLOAT_REGEXP.test(value)) {
      value = value ? parseFloat(value) : value
      form.setFieldsValue({ weight: value })
      setWeight(value)
    } else {
      form.setFieldsValue({ weight })
      setWeight(weight)
    }
  }

  const handleRepeatsChange = ({ target }) => {
    let { value } = target
    if (value === '' || INT_REGEXP.test(value)) {
      form.setFieldsValue({ repeats: value })
      setRepeats(value)
    } else {
      form.setFieldsValue({ repeats })
      setRepeats(repeats)
    }
  }

  const handleRepeatsBlur = ({ target }) => {
    let { value } = target
    if (value === '' || INT_REGEXP.test(value)) {
      value = value ? parseInt(value, 10) : value
      form.setFieldsValue({ repeats: value })
      setWeight(value)
    } else {
      form.setFieldsValue({ repeats })
      setWeight(repeats)
    }
  }

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

  useEffect(() => {
    if (mountedRef.current) {
      form.setFieldsValue(initialValues)
    }
  }, [ initialValues ])

  useEffect(() => {
    if (error) {
      Modal.error({
        title: modal.title.error,
        content: error || modal.default_content,
        okText: modal.ok_text,
      })
    }
  }, [ !!error ])

  useEffect(() => {
    mountedRef.current = true
  }, [])

  return (
    <>
      <StyledForm form={form} initialValues={initialValues} onFinish={handleSubmit} layout="vertical">
        {!isEditMode && <ToggleEdit onClick={() => setEditMode(true)} $enable><EditOutlined /></ToggleEdit>}
        <Form.Item label={input_labels.title} name="title" required rules={[ { required: true, message: 'Required' } ]}>
          <Input disabled={!isEditMode || isFetching} size="large" />
        </Form.Item>
        <Form.Item label={input_labels.type} name="type" required rules={[ { required: true, message: 'Required' } ]}>
          <Select disabled={!isEditMode || isFetching} size="large">
            <Select.Option value="repeats">{input_labels.type.options.repeats}</Select.Option>
            <Select.Option value="time">{input_labels.type.options.time}</Select.Option>
            <Select.Option value="duration">{input_labels.type.options.duration}</Select.Option>
            <Select.Option value="distance">{input_labels.type.options.distance}</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="each_side" valuePropName="checked">
          <Checkbox disabled={!isEditMode || isFetching}>
            {input_labels.each_side}
          </Checkbox>
        </Form.Item>
        <StyledFormItem shouldUpdate>
          {({ getFieldValue }) => {
            const type = getFieldValue('type')
            const shouldRenderTimeInput = !(type === 'time' || type === 'duration')
            return (
              <>
                {shouldRenderTimeInput
                  ? (
                    <ShortFormItem name="time" label={input_labels.time}>
                      <TimePicker disabled={!isEditMode || isFetching} showNow={false} size="large" placeholder="" />
                    </ShortFormItem>
                  )
                  : (
                    <ShortFormItem name="repeats" label={input_labels.repeats} $fullWidth $margin>
                      <Input disabled={!isEditMode || isFetching} onChange={handleRepeatsChange} onBlur={handleRepeatsBlur} size="large" />
                    </ShortFormItem>
                  )}
                <ShortFormItem name="weight" label={input_labels.weight} $fullWidth={!shouldRenderTimeInput}>
                  <Input disabled={!isEditMode || isFetching} onChange={handleWeightChange} onBlur={handleWeightBlur} size="large" addonAfter={selectAfter} />
                </ShortFormItem>
              </>
            )
          }}
        </StyledFormItem>
        <Form.Item label={input_labels.description} name="description">
          <Input.TextArea disabled={!isEditMode || isFetching} showCount maxLength={300} autoSize={{ minRows: 2, maxRows: 8 }} />
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
              <Button type="primary" htmlType="submit" size="large" block loading={isFetching}>
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
