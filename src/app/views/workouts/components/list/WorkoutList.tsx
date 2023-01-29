
import { List, notification } from 'antd'
import { WorkoutItem } from './components'
import { Workout, WorkoutDeleteError, WorkoutForm, WorkoutListItem } from '@/src/app/store/slices/workout/types'
import { Image } from 'store/slices/exercise/types'
import React, { FC, useContext, useEffect, useState } from 'react'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'
import { CustomBaseQueryError } from 'store/utils/baseQueryWithReauth'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { SelectableList } from 'app/components'
import { useRouterContext } from '@/src/app/contexts/router/RouterContextProvider'
import { useMounted } from '@/src/app/hooks'

export type ApiDeleteWorkoutError = {
  data: WorkoutDeleteError;
  status: number;
}

type DeleteWorkoutPayload = { ids: Pick<WorkoutForm, 'id'>[] } 

export interface IWorkoutList {
  workouts: WorkoutListItem[];
  deleteWorkouts: (ids: DeleteWorkoutPayload) => any;
  error: FetchBaseQueryError | SerializedError | CustomBaseQueryError;
  isLoading: boolean;
  isDeleting: boolean;
}

const WorkoutList: FC<IWorkoutList> = ({ deleteWorkouts, error, isLoading, isDeleting, workouts }) => {
  const { isMounted, useHandleMounted } = useMounted()
  const [ workoutsToDelete, setWorkoutsToDelete ] = useState({})
  const { loading, loadingRoute } = useRouterContext()
  const [ ,, loadingId ] = (loadingRoute || '').split('/')
  const { intl, lang } = useContext(IntlContext)
  const { modal } = intl
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
    if (!error && !isLoading && !isDeleting && isMounted()) selectionRef.current.handleCancelSelection()
  }, [ error, isLoading, isDeleting ])

  return (
    <SelectableList
      ref={selectionRef}
      list={workouts}
      style={{ paddingBottom: 45 }}
      onDelete={openModal}
      onCancelSelection={closeModal}
      isLoading={isLoading}
      isDeleting={isDeleting}
      createHref="/workouts/create"
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
            dataSource={workouts}
            renderItem={(item: Omit<WorkoutListItem & { id: number | string }, 'image'> & { image: Image }) => (
              <SelectableList.Item data-selectable-id={item.id} key={item.id} onContextMenu={onContextMenu} onClick={onSelect} $selected={selected[item.id]}>
                <WorkoutItem
                  payloadDictionary={payload}
                  loadingWorkoutId={loading && loadingId ? loadingId : null}
                  workoutDictionary={workoutDictionary}
                  selectionEnabled={selectionEnabled}
                  selected={selected[item.id]}
                  isLoading={workoutsToDelete[item.id] && (isDeleting || loading)}
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
