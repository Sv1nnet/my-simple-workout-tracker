import { List, notification } from 'antd'
import { ExerciseItem } from './components'
import { ExerciseDeleteError, ExerciseForm, ExerciseListItem, GetExerciseError, Image } from 'app/store/slices/exercise/types'
import { FC, useEffect, useState } from 'react'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { SelectableList } from 'app/components'
import { useMounted } from 'app/hooks'
import { useNavigate } from 'react-router'
import { exerciseApi } from 'app/store/slices/exercise/api'

export type ApiDeleteExerciseError = {
  data: ExerciseDeleteError;
  status: number;
}

export type ApiGetExerciseError = {
  data: GetExerciseError;
  status: number;
}

type DeleteExercisePayload = { ids: Pick<ExerciseForm, 'id'>[] } 
type CopyExercisePayload = { ids: Pick<ExerciseForm, 'id'>[] } 
type Exercise = (ExerciseListItem & { id: string })

export interface IExerciseList {
  exercises: Exercise[];
  deleteExercises: (ids: DeleteExercisePayload) => any;
  copyExercises: (ids: CopyExercisePayload) => any;
  error: FetchBaseQueryError | SerializedError | CustomBaseQueryError;
  isLoading: boolean;
  isDeleting: boolean;
  isCopying: boolean;
}

const ExerciseList: FC<IExerciseList> = ({ deleteExercises, copyExercises, error, isLoading, isDeleting, isCopying, exercises }) => {
  const { isMounted, useHandleMounted } = useMounted()
  const [ exercisesToDelete, setExercisesToDelete ] = useState({})
  const [ loadItem, { data, isLoading: isItemLoading, isSuccess, error: itemLoadingError } ] = exerciseApi.useLazyGetQuery()
  const [ loadingId, setLoadingId ] = useState(null)
  const navigate = useNavigate()
  const { intl, lang } = useIntlContext()
  const { modal, common } = intl
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
      return res
    })
  }

  const handleCopy = () => {
    const toCopy = selectionRef.current.selected

    return copyExercises({
      ids: Object.keys(toCopy).filter(id => toCopy[id]) as Pick<ExerciseForm, 'id'>[],
    }).then((res) => {
      if (isMounted() && res?.data?.success) {
        setExercisesToDelete({})
        selectionRef.current?.handleCancelSelection()
      }
      return res
    })
  }

  const handleLoadExercise = (id: string) => {
    loadItem({ id })
    setLoadingId(id)
  }

  useHandleMounted()

  useEffect(() => {
    if (!isItemLoading && isSuccess && data.success) {
      navigate(data.data.id)
    }
  }, [ isSuccess, data ])

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
    if (itemLoadingError) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({
        message: modal.common.title.error,
        description: (itemLoadingError as ApiGetExerciseError)?.data?.error?.message?.text?.[lang || 'eng'],
      })
    }
  }, [ itemLoadingError ])

  useEffect(() => {
    if (!error && !isLoading && !isDeleting && !isCopying && isMounted()) selectionRef.current.handleCancelSelection()
  }, [ error, isLoading, isDeleting ])

  return (
    <SelectableList
      ref={selectionRef}
      list={exercises}
      style={{ paddingBottom: 45 }}
      onDelete={openModal}
      onCopy={handleCopy}
      onCancelSelection={closeModal}
      isLoading={isLoading}
      isDeleting={isDeleting}
      isCopying={isCopying}
      createHref="/exercises/create"
    >
      {({
        selected,
        selectionEnabled,
        onSelect,
        onContextMenu,
        onTouchHandlers,
      }) => (
        <>
          <List
            itemLayout="horizontal"
            dataSource={exercises}
            locale={{ emptyText: isLoading ? common.loading : common.no_data }}
            renderItem={(item: Omit<Exercise, 'image'> & { image: Image }) => (
              <SelectableList.Item data-selectable-id={item.id} key={item.id} onContextMenu={onContextMenu} onClick={onSelect} $selected={selected[item.id]} {...onTouchHandlers}>
                <ExerciseItem
                  loadingExerciseId={loadingId}
                  loadExercise={handleLoadExercise}
                  payloadDictionary={payload}
                  selectionEnabled={selectionEnabled}
                  selected={selected[item.id]}
                  isLoading={exercisesToDelete[item.id] && isDeleting}
                  {...item}
                />
              </SelectableList.Item>
            )}
          />
          <SelectableList.Modal 
            okText={exerciseModal.delete.ok_button}
            cancelText={exerciseModal.delete.cancel_button}
            open={isModalVisible} 
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
