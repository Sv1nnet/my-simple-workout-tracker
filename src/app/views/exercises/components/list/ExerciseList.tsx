import { List, notification } from 'antd'
import { ExerciseItem } from './components'
import { ExerciseDeleteError, ExerciseForm, ExerciseListItem, Image } from 'app/store/slices/exercise/types'
import React, { FC, useEffect, useState } from 'react'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { SelectableList } from 'app/components'
import { useRouterContext } from '@/src/app/contexts/router/RouterContextProvider'
import { useMounted } from '@/src/app/hooks'

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
  const { isMounted, useHandleMounted } = useMounted()
  const [ exercisesToDelete, setExercisesToDelete ] = useState({})
  const { loading, loadingRoute } = useRouterContext()
  const [ ,, loadingId ] = (loadingRoute || '').split('/')
  const { intl, lang } = useIntlContext()
  const { modal } = intl
  const { payload, modal: exerciseModal } = intl.pages.exercises
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
    }).then((res) => {
      if (isMounted() && res?.data?.success) {
        setExercisesToDelete({})
        selectionRef.current?.handleCancelSelection()
      }
    })
  }

  useHandleMounted()

  useEffect(() => {
    if (error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: modal.common.title.error, description: (error as ApiDeleteExerciseError)?.data?.error?.message?.text?.[lang || 'eng'] })
    }
  }, [ error ])

  useEffect(() => {
    if (!error && !isLoading && !isDeleting && isMounted()) selectionRef.current.handleCancelSelection()
  }, [ error, isLoading, isDeleting ])

  return (
    <SelectableList
      ref={selectionRef}
      list={exercises}
      style={{ paddingBottom: 45 }}
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
                  isLoading={exercisesToDelete[item.id] && (isDeleting || loading)}
                  {...item}
                />
              </SelectableList.Item>
            )}
          />
          <SelectableList.Modal 
            okText={exerciseModal.delete.ok_button}
            cancelText={exerciseModal.delete.cancel_button}
            visible={isModalVisible} 
            onOk={handleDelete} 
            onCancel={closeModal}
            text={exerciseModal.delete.body_many}
            selected={selected}
          />
        </>
      )}
    </SelectableList>
  )
}

export default ExerciseList
