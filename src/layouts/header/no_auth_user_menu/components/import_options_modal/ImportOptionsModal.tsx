import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useToggle } from 'app/hooks'
import { Checkbox, Divider, Typography, notification } from 'antd'
import { MouseEvent, MouseEventHandler, useState } from 'react'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import saveTextFile from 'app/utils/saveTextFile'
import browserDB from 'app/store/utils/BrowserDB'
import { InputContainer, NoteTextContainer, StyledModal } from './components/styled'
import styled from 'styled-components'


export type ImportOptionsProps = {
  isOpen: boolean;
  open?: MouseEventHandler;
  close?: MouseEventHandler;
  onOk?: MouseEventHandler;
}

const { Text } = Typography

const CheckboxLabel = styled.span`
  display: inline-block;
  width: 95px;
`

const ImportOptionsModal = ({ isOpen, onOk, close }: ImportOptionsProps) => {
  const { intl: { header } } = useIntlContext()
  const { state: indeterminate, setFalse: setNotIndeterminate, setState: setIndeterminate } = useToggle(false)
  const { state: checkAll, setState: setCheckAll } = useToggle(true)
  const { state: isDownloading, setTrue: setIsDownloading, setFalse: setIsNotDownloading } = useToggle(false)

  const [ listToExport, setListToExport ] = useState(() => ({
    muscleGroups: true,
    exercises: true,
    workouts: true,
    activities: true,
  }))

  const handleOk = async (e: MouseEvent<HTMLElement>) => {
    
    const { db } = browserDB
    const tables = browserDB.getTables()
    
    try {
      if (db) {
        setIsDownloading()

        await saveTextFile({
          data: JSON.stringify({
            muscleGroups: listToExport.muscleGroups ? await db.getAll(tables.muscleGroupsTable) : [],
            exercises: listToExport.exercises ? await db.getAll(tables.exercisesTable) : [],
            workouts: listToExport.workouts ? await db.getAll(tables.workoutsTable) : [],
            activities: listToExport.activities ? await db.getAll(tables.activitiesTable) : [],
          }),
          fileName: 'my-simple-workout-tracker-data.txt',
          dialogTitle: header.import_options_modal.export,
        })
      } else {
        throw new Error('Local DB is not initialized')
      }
    } catch (error) {
      notification.error({
        message: header.import_options_modal.error.massage,
        description: header.import_options_modal.error.description,
      })
    } finally {
      setIsNotDownloading()
    }

    onOk?.(e)
    close?.(e)
  }

  const handleChange = (e: CheckboxChangeEvent) => {
    const { checked, name } = e.target

    const newListToExport = {
      ...listToExport,
      ...(
        name === 'activities'
          ? { exercises: true, workouts: true }
          : name === 'workouts'
            ? { exercises: true }
            : {}
      ),
      [name]: checked,
    }
    
    setListToExport(newListToExport)

    const checkedCount = Object.values(newListToExport).filter(Boolean).length
    const totalOptionsCount = Object.keys(newListToExport).length
    setIndeterminate(!!checkedCount && checkedCount < totalOptionsCount)
    setCheckAll(checkedCount === totalOptionsCount)
  }

  const handleCheckAllChange = (e: CheckboxChangeEvent) => {
    setListToExport(e.target.checked ? {
      muscleGroups: true,
      exercises: true,
      workouts: true,
      activities: true,
    } : {
      muscleGroups: false,
      exercises: false,
      workouts: false,
      activities: false,
    })
    setNotIndeterminate()
    setCheckAll(e.target.checked)
  }

  const isExercisesChecked = listToExport.exercises
  const isWorkoutsChecked = listToExport.workouts
  const isActivitiesChecked = listToExport.activities

  return (
    <StyledModal
      title={header.import_options_modal.title}
      open={isOpen}
      okButtonProps={{
        disabled: !isWorkoutsChecked && !isActivitiesChecked && !isExercisesChecked,
        loading: isDownloading,
      }}
      okText={header.import_options_modal.export}
      onOk={handleOk}
      cancelText={header.import_options_modal.cancel}
      onCancel={close}
      closable
    >
      <Checkbox indeterminate={indeterminate} onChange={handleCheckAllChange} checked={checkAll}>
        {header.import_options_modal.check_all}
      </Checkbox>
      <Divider style={{ marginBlock: 12 }} />
      <div>
        <InputContainer>
          <Checkbox disabled={isExercisesChecked} checked={listToExport.muscleGroups} name="muscleGroups" onChange={handleChange}>
            <CheckboxLabel>{header.muscle_groups}</CheckboxLabel>
          </Checkbox>
          <NoteTextContainer type="secondary">
            <Text disabled={!isExercisesChecked}>
              {header.import_options_modal.muscle_groups_required_reason}
            </Text>
          </NoteTextContainer>
        </InputContainer>
        <InputContainer>
          <Checkbox disabled={isWorkoutsChecked} checked={listToExport.exercises} name="exercises" onChange={handleChange}>
            <CheckboxLabel>{header.exercises}</CheckboxLabel>
          </Checkbox>
          <NoteTextContainer type="secondary">
            <Text disabled={!isWorkoutsChecked && !isActivitiesChecked}>
              {header.import_options_modal.exercises_required_reason}
            </Text>
          </NoteTextContainer>
        </InputContainer>
        <InputContainer>
          <Checkbox disabled={isActivitiesChecked} checked={listToExport.workouts} name='workouts' onChange={handleChange}>
            <CheckboxLabel>{header.workouts}</CheckboxLabel>
          </Checkbox>
          <NoteTextContainer>
            <Text disabled={!isActivitiesChecked}>
              {header.import_options_modal.workouts_required_reason}
            </Text>
          </NoteTextContainer>
        </InputContainer>
        <div>
          <Checkbox checked={listToExport.activities} name='activities' onChange={handleChange}>
            <CheckboxLabel>{header.activities}</CheckboxLabel>
          </Checkbox>
        </div>
      </div>
    </StyledModal>
  )
}

export default ImportOptionsModal