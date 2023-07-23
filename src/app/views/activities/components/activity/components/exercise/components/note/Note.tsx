import { FC, useState } from 'react'
import styled from 'styled-components'
import { Button, FormInstance } from 'antd'
import { Form, Input } from 'antd'
import { CacheFormData } from 'app/views/activities/components/activity/types'
import { ActivityForm } from 'app/store/slices/activity/types'
import { Dayjs } from 'dayjs'

const AddRemoveNoteButton = styled(Button)`
  margin-top: 8px;
`
export interface INoteProps {
  form: FormInstance<ActivityForm<Dayjs>>;
  cacheFormData: CacheFormData;
  exerciseIndex: number;
  isFormItemDisabled: boolean;
  inputLabels: { add_note: string, remove_note: string };
  placeholder?: string;
}

const Note: FC<INoteProps> = ({ form, cacheFormData, exerciseIndex, isFormItemDisabled, inputLabels, placeholder }) => {
  const [ showNote, setShowNote ] = useState(form.getFieldValue([ 'results', exerciseIndex, 'note' ]))

  const handleRemoveNote = () => {
    setShowNote(false)
    const results = [ ...form.getFieldValue('results') ]
    results[exerciseIndex].note = null
    form.setFieldsValue({ results })
    cacheFormData([ 'results', `${exerciseIndex}`, 'note' ], { ...form.getFieldsValue(), results })
  }

  return (
    <>
      {!showNote
        ? (
          <AddRemoveNoteButton disabled={isFormItemDisabled} size="small" onClick={() => setShowNote(true)}>
            {inputLabels.add_note}
          </AddRemoveNoteButton>
        )
        : (
          <AddRemoveNoteButton disabled={isFormItemDisabled} size="small" onClick={handleRemoveNote}>
            {inputLabels.remove_note}
          </AddRemoveNoteButton>
        )}
      {showNote && (
        <Form.Item name={[ 'results', exerciseIndex, 'note' ]}>
          <Input.TextArea
            disabled={isFormItemDisabled}
            autoFocus
            style={{ marginTop: '10px' }}
            placeholder={placeholder}
            showCount
            maxLength={120}
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
        </Form.Item>
      )}
    </>
  )
}

export default Note
