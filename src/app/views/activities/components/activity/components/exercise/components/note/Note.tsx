import { useState } from 'react'
import styled from 'styled-components'
import { Button } from 'antd'
import { Form, Input } from 'antd'

const AddRemoveNoteButton = styled(Button)`
  margin-top: 10px;
`

const Note = ({ form, exerciseIndex, isFormItemDisabled, inputLabels, placeholder }) => {
  const [ showNote, setShowNote ] = useState(form.getFieldValue([ 'results', exerciseIndex, 'note' ]))

  const handleHideNote = () => {
    setShowNote(false)
    const results = [ ...form.getFieldValue('results') ]
    results[exerciseIndex].note = null
    form.setFieldsValue({ results })
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
          <AddRemoveNoteButton disabled={isFormItemDisabled} size="small" onClick={handleHideNote}>
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
