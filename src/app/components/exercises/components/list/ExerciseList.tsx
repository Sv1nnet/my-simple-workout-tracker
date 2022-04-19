import { List, notification } from 'antd'
import { ExerciseItem } from './components'
import { ExerciseDeleteError, ExerciseForm, Image } from 'app/store/slices/exercise/types'
import React, { FC, useContext, useEffect } from 'react'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { SelectableList } from 'app/components'

export type ApiDeleteExerciseError = {
  data: ExerciseDeleteError;
  status: number;
}

type DeleteExercisePayload = { ids: Pick<ExerciseForm, 'id'>[] } 
type Exercise = (ExerciseForm & { id: string })

export interface IExerciseList {
  exercises: Exercise[];
  deleteExercises: (ids: DeleteExercisePayload) => any;
  error: FetchBaseQueryError | SerializedError | CustomBaseQueryError;
  isLoading: boolean;
}

const ExerciseList: FC<IExerciseList> = ({ deleteExercises, error, isLoading, exercises }) => {
  const { payload, modal } = useContext(IntlContext).intl.pages.exercises
  const {
    isModalVisible,
    selectionRef,
    openModal,
    closeModal,
  } = SelectableList.Modal.useModalUtils()

  const handleDelete = () => {
    closeModal()
    return deleteExercises({
      ids: Object.keys(selectionRef.current.selected).filter(id => selectionRef.current.selected[id]) as Pick<ExerciseForm, 'id'>[],
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
      openNotification({ message: 'Error!', description: (error as ApiDeleteExerciseError)?.data?.error.message?.text })
    }
  }, [ error ])

  useEffect(() => {
    if (!error && !isLoading) selectionRef.current.handleCancelSelection()
  }, [ error, isLoading ])

  return (
    <SelectableList
      ref={selectionRef}
      list={exercises}
      onDelete={openModal}
      onCancelSelection={closeModal}
      isLoading={isLoading}
      createHref="/exercises/create"
    >
      {({
        selected,
        selectionEnabled,
        onSelect,
        onContextMenu,
      }) => (
        <>
          <List
            itemLayout="horizontal"
            dataSource={exercises}
            renderItem={(item: Omit<Exercise, 'image'> & { image: Image }) => (
              <SelectableList.Item data-selectable-id={item.id} key={item.id} onContextMenu={onContextMenu} onClick={onSelect} $selected={selected[item.id]}>
                <ExerciseItem
                  payloadDictionary={payload}
                  selectionEnabled={selectionEnabled}
                  selected={selected[item.id]}
                  {...item}
                />
              </SelectableList.Item>
            )}
          />
          <SelectableList.Modal 
            okText={modal.delete.ok_button}
            cancelText={modal.delete.cancel_button}
            visible={isModalVisible} 
            onOk={handleDelete} 
            onCancel={closeModal}
            text={modal.delete.body_many}
            selected={selected}
          />
        </>
      )}
    </SelectableList>
  )
}

export default ExerciseList
