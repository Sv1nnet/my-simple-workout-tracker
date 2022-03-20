
import styled from 'styled-components'
import { List, Modal, notification } from 'antd'
import { ExerciseItem } from './components'
import { ExerciseDeleteError, ExerciseForm, Image } from '@/src/app/store/slices/exercise/types'
import React, { FC, useContext, useEffect, useState } from 'react'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'
import { ListControls } from 'app/components'
import { CustomBaseQueryError } from '@/src/app/store/utils/baseQueryWithReauth'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'

export type ApiDeleteExerciseError = {
  data: ExerciseDeleteError;
  status: number;
}

const ListContainer = styled.div`
  padding: 15px;
  padding-top: 0;
`

type DeleteExercisePayload = { ids: Pick<ExerciseForm, 'id'>[] } 

export interface IExerciseList {
  exercises: ExerciseForm[];
  deleteExercises: (ids: DeleteExercisePayload) => any;
  error: FetchBaseQueryError | SerializedError | CustomBaseQueryError;
  isLoading: boolean;
}

const ExerciseList: FC<IExerciseList> = ({ deleteExercises, error, isLoading, exercises }) => {
  const { payload, modal } = useContext(IntlContext).intl.pages.exercises
  const [ selected, setSelected ] = useState({})
  const [ selectionEnabled, setSelectionEnabled ] = useState(false)
  const [ allSelected, setAllSelected ] = useState(false)
  const [ isModalVisible, setModalVisible ] = useState(false)

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectionEnabled) {
      e.preventDefault()
      setSelectionEnabled(true)

      const { dataset } = e.currentTarget
      const { exerciseId } = dataset

      if (!selected[exerciseId]) setSelected({ ...selected, [exerciseId]: true })
      else setSelected({ ...selected, [exerciseId]: false })
    }
  }

  const handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    const { dataset } = e.currentTarget
    const { exerciseId } = dataset

    if (!selected[exerciseId]) {
      const newSelected = { ...selected, [exerciseId]: true }
      const selectedKeys = Object
        .keys(newSelected)
        .filter(sel => newSelected[sel])

      if (selectedKeys.length && selectedKeys.length === exercises.length) setAllSelected(true)
      setSelected({ ...selected, [exerciseId]: true })
    } else {
      setSelected({ ...selected, [exerciseId]: false })
      if (allSelected) setAllSelected(false)
    }
  }

  const handleSelectDeselectAll = (shouldSelect: boolean) => {
    setSelected(exercises.reduce((acc, { id }) => { acc[id] = shouldSelect; return acc }, {}))
    setAllSelected(shouldSelect)
  }

  const handleCancelSelection = () => {
    handleSelectDeselectAll(false)
    setSelectionEnabled(false)
    setModalVisible(false)
  }

  const openDeleteModal = () => setModalVisible(true)

  const handleDelete = () => {
    setModalVisible(false)
    return deleteExercises({
      ids: Object.keys(selected).filter(id => selected[id]) as Pick<ExerciseForm, 'id'>[],
    })
  }

  useEffect(() => {
    if (error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: 'Error!', description: (error as ApiDeleteExerciseError)?.data?.error.message })
    }
  }, [ error ])

  useEffect(() => {
    if (!error && !isLoading) handleCancelSelection()
  }, [ error, isLoading ])

  return (
    <ListContainer>
      <List
        itemLayout="horizontal"
        dataSource={exercises}
        renderItem={(item: Omit<ExerciseForm, 'image'> & { image: Image }) => (
          <List.Item data-exercise-id={item.id} key={item.id} onContextMenu={handleContextMenu} onClick={handleSelect}>
            <ExerciseItem
              payloadDictionary={payload}
              selectionEnabled={selectionEnabled}
              selected={selected[item.id]}
              {...item}
            />
          </List.Item>
        )}
      />
      <ListControls
        isDeleteFetching={isLoading}
        selected={selected}
        allSelected={allSelected}
        onSelect={handleSelectDeselectAll}
        isSelectionActive={selectionEnabled}
        onCancel={handleCancelSelection}
        onDelete={openDeleteModal}
      />
      <Modal 
        okText={modal.delete.ok_button}
        cancelText={modal.delete.cancel_button}
        visible={isModalVisible} 
        onOk={handleDelete} 
        onCancel={handleCancelSelection}
      >
        {`${modal.delete.body} (${Object.values(selected).filter(Boolean).length})`}
      </Modal>
    </ListContainer>
  )
}

export default ExerciseList
