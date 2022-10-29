import { List, notification } from 'antd'
import { ExerciseItem } from './components'
import { ExerciseDeleteError, ExerciseForm, ExerciseListItem, Image } from 'app/store/slices/exercise/types'
import React, { FC, useContext, useEffect, useState } from 'react'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { SelectableList } from 'app/components'
import { RouterContext } from '@/src/app/contexts/router/RouterContextProvider'

export type ApiDeleteExerciseError = {
  data: ExerciseDeleteError;
  status: number;
}

type DeleteExercisePayload = { ids: Pick<ExerciseForm, 'id'>[] } 
type Exercise = (ExerciseListItem & { id: string })

export interface IExerciseList {
  exercises: Exercise[];
  deleteExercises: (ids: DeleteExercisePayload) => any;
  error: FetchBaseQueryError | SerializedError | CustomBaseQueryError;
  isLoading: boolean;
  isDeleting: boolean;
}

const ExerciseList: FC<IExerciseList> = ({ deleteExercises, error, isLoading, isDeleting, exercises }) => {
  const [ exercisesToDelete, setExercisesToDelete ] = useState({})
  const { loading, loadingRoute } = useContext(RouterContext)
  const [ ,, loadingId ] = (loadingRoute || '').split('/')
  const { intl, lang } = useContext(IntlContext)
  const { payload, modal } = intl.pages.exercises
  const {
    isModalVisible,
    selectionRef,
    openModal,
    closeModal,
  } = SelectableList.Modal.useModalUtils()

  const handleDelete = () => {
    closeModal()

    const toDelete = selectionRef.current.selected
    setExercisesToDelete(toDelete)

    return deleteExercises({
      ids: Object.keys(toDelete).filter(id => toDelete[id]) as Pick<ExerciseForm, 'id'>[],
    }).finally(() => setExercisesToDelete({}))
  }

  useEffect(() => {
    if (error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: modal.common.title.error, description: (error as ApiDeleteExerciseError)?.data?.error?.message?.text[lang || 'eng'] })
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
      isDeleting={isDeleting}
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
                  loadingExerciseId={loading && loadingId ? loadingId : null}
                  payloadDictionary={payload}
                  selectionEnabled={selectionEnabled}
                  selected={selected[item.id]}
                  isLoading={exercisesToDelete[item.id]}
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
