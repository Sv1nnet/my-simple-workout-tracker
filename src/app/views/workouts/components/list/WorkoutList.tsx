
import { List, notification } from 'antd'
import { WorkoutItem } from './components'
import { GetWorkoutError, WorkoutDeleteError, WorkoutForm, WorkoutListItem } from 'app/store/slices/workout/types'
import { Image } from 'store/slices/exercise/types'
import { FC, useEffect, useState } from 'react'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { CustomBaseQueryError } from 'store/utils/baseQueryWithReauth'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { SelectableList } from 'app/components'
import { useMounted } from 'app/hooks'
import { workoutApi } from 'app/store/slices/workout/api'
import { useNavigate } from 'react-router'
import useItemImagePlaceholder from 'app/hooks/useItemImagePlaceholder'

export type ApiDeleteWorkoutError = {
  data: WorkoutDeleteError;
  status: number;
}

export type ApiGetWorkoutError = {
  data: GetWorkoutError;
  status: number;
}

export type DeleteWorkoutPayload = { ids: WorkoutForm['id'][] } 

export interface IWorkoutList {
  workouts: WorkoutListItem[];
  deleteWorkouts: (ids: DeleteWorkoutPayload) => any;
  copyWorkouts: (ids: DeleteWorkoutPayload) => any;
  error: FetchBaseQueryError | SerializedError | CustomBaseQueryError;
  isLoading: boolean;
  isDeleting: boolean;
  isCopying: boolean;
  containerRef: HTMLElement | null;
}

const WorkoutList: FC<IWorkoutList> = ({ deleteWorkouts, copyWorkouts, error, isLoading, isDeleting, isCopying, workouts, containerRef }) => {
  const [ itemImagePlaceholder ] = useItemImagePlaceholder()

  const [ isSelectionDisabled, setIsSelectionDisabled ] = useState(false)
  const [ workoutsToDelete, setWorkoutsToDelete ] = useState({})
  const [ loadingId, setLoadingId ] = useState(null)

  const { isMounted, useHandleMounted } = useMounted()
  const [ loadItem, { data, isLoading: isItemLoading, isSuccess, error: itemLoadingError } ] = workoutApi.useLazyGetQuery()
  const navigate = useNavigate()

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
      ids: Object.keys(toDelete).filter(id => toDelete[id]),
    }).then((res) => {
      if (isMounted() && res?.data?.success) {
        setWorkoutsToDelete({})
        selectionRef.current?.cancelSelection()
      }
    })
  }

  const handleCopy = () => {
    const toCopy = selectionRef.current.selected

    return copyWorkouts({
      ids: Object.keys(toCopy).filter(id => toCopy[id]),
    }).then((res) => {
      if (isMounted() && res?.data?.success) {
        setWorkoutsToDelete({})
        selectionRef.current?.cancelSelection()
      }
      return res
    })
  }

  const handleLoadWorkout = (id: string) => {
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
      openNotification({ message: modal.common.title.error, description: (error as ApiDeleteWorkoutError)?.data?.error?.message?.text?.[lang || 'eng'] })
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
        description: (itemLoadingError as ApiGetWorkoutError)?.data?.error?.message?.text?.[lang || 'eng'],
      })
    }
  }, [ itemLoadingError ])

  useEffect(() => {
    if (!error && !isLoading && !isDeleting && !isCopying && isMounted()) selectionRef.current.cancelSelection()
  }, [ error, isLoading, isDeleting, isCopying ])

  return (
    <SelectableList
      ref={selectionRef}
      list={workouts}
      style={{ paddingBottom: 45, paddingInline: 0 }}
      onDelete={openModal}
      onCopy={handleCopy}
      onCancelSelection={closeModal}
      isLoading={isLoading}
      isDeleting={isDeleting}
      isCopying={isCopying}
      isDisabled={isSelectionDisabled}
      createHref="/workouts/create"
    >
      {({
        selected,
        isSelectionEnabled,
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
              <SelectableList.Item
                data-selectable-id={item.id}
                key={item.id}
                onContextMenu={onContextMenu}
                onClick={onSelect}
                $selected={selected[item.id]}
                $noPadding
                {...onTouchHandlers}
              >
                <WorkoutItem
                  itemImagePlaceholder={itemImagePlaceholder}
                  loadWorkout={handleLoadWorkout}
                  payloadDictionary={payload}
                  loadingWorkoutId={loadingId}
                  workoutDictionary={workoutDictionary}
                  actionLabels={intl.pages.workouts.action_labels}
                  isSelectionEnabled={isSelectionEnabled}
                  isSelected={selected[item.id]}
                  isLoading={workoutsToDelete[item.id] && isDeleting}
                  listEl={containerRef}
                  setIsSelectionDisabled={setIsSelectionDisabled}
                  {...item}
                />
              </SelectableList.Item>
            )}
          />
          <SelectableList.Modal
            okText={workoutModal.delete.ok_button}
            cancelText={workoutModal.delete.cancel_button}
            open={isModalVisible} 
            onOk={handleDelete} 
            okButtonProps={{ danger: true }}
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
