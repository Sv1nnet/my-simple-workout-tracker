
import { List, notification } from 'antd'
import { WorkoutItem } from './components'
import { Workout, WorkoutDeleteError, WorkoutForm, WorkoutListItem } from 'app/store/slices/workout/types'
import { Image } from 'store/slices/exercise/types'
import { FC, useEffect, useState } from 'react'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { CustomBaseQueryError } from 'store/utils/baseQueryWithReauth'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { SelectableList } from 'app/components'
import { useMounted } from 'app/hooks'

export type ApiDeleteWorkoutError = {
  data: WorkoutDeleteError;
  status: number;
}

type DeleteWorkoutPayload = { ids: Pick<WorkoutForm, 'id'>[] } 

export interface IWorkoutList {
  workouts: WorkoutListItem[];
  deleteWorkouts: (ids: DeleteWorkoutPayload) => any;
  copyWorkouts: (ids: DeleteWorkoutPayload) => any;
  error: FetchBaseQueryError | SerializedError | CustomBaseQueryError;
  isLoading: boolean;
  isDeleting: boolean;
  isCopying: boolean;
}

const WorkoutList: FC<IWorkoutList> = ({ deleteWorkouts, copyWorkouts, error, isLoading, isDeleting, isCopying, workouts }) => {
  const { isMounted, useHandleMounted } = useMounted()
  const [ workoutsToDelete, setWorkoutsToDelete ] = useState({})
  // const [ ,, loadingId ] = (loadingRoute || '').split('/')
  const { intl, lang } = useIntlContext()
  const { modal, common } = intl
  const { payload } = intl.pages.exercises
  const { workouts: workoutDictionary } = intl.pages
  const { modal: workoutModal } = workoutDictionary
  const {
    isModalVisible,
    selectionRef,
    openModal,
    closeModal,
  } = SelectableList.Modal.useModalUtils()

  const handleDelete = () => {
    closeModal()

    const toDelete = selectionRef.current.selected
    setWorkoutsToDelete(toDelete)

    return deleteWorkouts({
      ids: Object.keys(toDelete).filter(id => toDelete[id]) as Pick<Workout, 'id'>[],
    }).then((res) => {
      if (isMounted() && res?.data?.success) {
        setWorkoutsToDelete({})
        selectionRef.current?.handleCancelSelection()
      }
    })
  }

  const handleCopy = () => {
    const toCopy = selectionRef.current.selected

    return copyWorkouts({
      ids: Object.keys(toCopy).filter(id => toCopy[id]) as Pick<WorkoutForm, 'id'>[],
    }).then((res) => {
      if (isMounted() && res?.data?.success) {
        setWorkoutsToDelete({})
        selectionRef.current?.handleCancelSelection()
      }
      return res
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
      openNotification({ message: modal.common.title.error, description: (error as ApiDeleteWorkoutError)?.data?.error?.message?.text?.[lang || 'eng'] })
    }
  }, [ error ])

  useEffect(() => {
    if (!error && !isLoading && !isDeleting && !isCopying && isMounted()) selectionRef.current.handleCancelSelection()
  }, [ error, isLoading, isDeleting, isCopying ])

  return (
    <SelectableList
      ref={selectionRef}
      list={workouts}
      style={{ paddingBottom: 45 }}
      onDelete={openModal}
      onCopy={handleCopy}
      onCancelSelection={closeModal}
      isLoading={isLoading}
      isDeleting={isDeleting}
      isCopying={isCopying}
      createHref="/workouts/create"
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
            dataSource={workouts}
            locale={{ emptyText: isLoading ? common.loading : common.no_data }}
            renderItem={(item: Omit<WorkoutListItem & { id: number | string }, 'image'> & { image: Image }) => (
              <SelectableList.Item data-selectable-id={item.id} key={item.id} onContextMenu={onContextMenu} onClick={onSelect} $selected={selected[item.id]} {...onTouchHandlers}>
                <WorkoutItem
                  payloadDictionary={payload}
                  loadingWorkoutId={/*loading && loadingId ? loadingId :*/ null}
                  workoutDictionary={workoutDictionary}
                  selectionEnabled={selectionEnabled}
                  selected={selected[item.id]}
                  isLoading={workoutsToDelete[item.id] && (isDeleting/* || loading*/)}
                  {...item}
                />
              </SelectableList.Item>
            )}
          />
          <SelectableList.Modal
            okText={workoutModal.delete.ok_button}
            cancelText={workoutModal.delete.cancel_button}
            visible={isModalVisible} 
            onOk={handleDelete} 
            onCancel={closeModal}
            text={workoutModal.delete.body_many}
            selected={selected}
          />
        </>
      )}
    </SelectableList>
  )
}

export default WorkoutList
