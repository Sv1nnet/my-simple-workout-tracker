
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
import { RouterContext } from '@/src/app/contexts/router/RouterContextProvider'

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
  const [ workoutsToDelete, setWorkoutsToDelete ] = useState({})
  const { loading, loadingRoute } = useContext(RouterContext)
  const [ ,, loadingId ] = (loadingRoute || '').split('/')
  const { intl } = useContext(IntlContext)
  const { payload } = intl.pages.exercises
  const { workouts: workoutDictionary } = intl.pages
  const { modal } = workoutDictionary
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
    }).finally(() => setWorkoutsToDelete({}))
  }

  useEffect(() => {
    if (error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: 'Error!', description: (error as ApiDeleteWorkoutError)?.data?.error.message?.text })
    }
  }, [ error ])

  useEffect(() => {
    if (!error && !isLoading) selectionRef.current.handleCancelSelection()
  }, [ error, isLoading ])

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
                  isLoading={workoutsToDelete[item.id]}
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

export default WorkoutList
