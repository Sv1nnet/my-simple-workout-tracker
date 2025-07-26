import { FC, useEffect, useState } from 'react'
import { List, notification } from 'antd'
import { ActivityItem, ListContainer } from './components'
import { ActivityDeleteError, ActivityForm, ActivityListItem, GetActivityError } from 'app/store/slices/activity/types'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { SelectableList } from 'app/components'
import { useAppSelector, useMounted } from 'app/hooks'
import { activityApi } from 'app/store/slices/activity/api'
import { useNavigate } from 'react-router'
import { selectList } from 'app/store/slices/workout'
import { API_STATUS } from 'app/constants/api_statuses'
import { workoutApi } from 'app/store/slices/workout/api'

export type ApiDeleteActivityError = {
  data: ActivityDeleteError;
  status: number;
}

export type ApiGetActivityError = {
  data: GetActivityError;
  status: number;
}

type DeleteActivityPayload = { ids: ActivityForm['id'][] }

export interface IActivityList {
  containerRef: HTMLElement | null
  activities: ActivityListItem[];
  deleteActivities: (ids: DeleteActivityPayload) => any;
  error: FetchBaseQueryError | SerializedError | CustomBaseQueryError;
  isLoading: boolean;
  isDeleting: boolean;
}

const ActivityList: FC<IActivityList> = ({ containerRef, deleteActivities, error, isLoading, isDeleting, activities }) => {
  const { status: workoutListStatus } = useAppSelector(selectList)
  const [ fetchWorkoutList ] = workoutApi.useLazyListQuery()
  const [ loadItem, { data, isLoading: isItemLoading, isSuccess, error: itemLoadingError } ] = activityApi.useLazyGetQuery()
  const navigate = useNavigate()
  const [ loadingId, setLoadingId ] = useState(null)
  const [ isSelectionDisabled, setIsSelectionDisabled ] = useState(false)
  const { isMounted, useHandleMounted } = useMounted()
  const [ activitiesToDelete, setActivitiesToDelete ] = useState({})
  const { intl, lang } = useIntlContext()
  const { modal, common } = intl
  const { payload: exercisePayloadDictionary } = intl.pages.exercises
  const { activities: activityDictionary } = intl.pages
  const { modal: activityModal, list_buttons: activityListButtons } = activityDictionary
  const {
    isModalVisible,
    selectionRef,
    openModal,
    closeModal,
  } = SelectableList.Modal.useModalUtils()

  const handleDelete = () => {
    closeModal()

    const toDelete = selectionRef.current.selected
    setActivitiesToDelete(toDelete)

    return deleteActivities({
      ids: Object.keys(toDelete).filter(id => toDelete[id]) as ActivityForm['id'][],
    }).then((res) => {
      if (isMounted() && res?.data?.success) {
        setActivitiesToDelete({})
        selectionRef.current?.cancelSelection()
      }
    })
  }

  const handleLoadActivity = (id: string) => {
    if (workoutListStatus !== API_STATUS.LOADED && workoutListStatus !== API_STATUS.LOADING) {
      fetchWorkoutList().then((res) => {
        loadItem({ id })
        return res
      })
    } else {
      loadItem({ id })
    }
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
      openNotification({
        message: modal.common.title.error,
        description: (error as ApiDeleteActivityError)?.data?.error?.message?.text?.[lang || 'eng'],
      })
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
        description: (itemLoadingError as ApiGetActivityError)?.data?.error?.message?.text?.[lang || 'eng'],
      })
    }
  }, [ itemLoadingError ])

  useEffect(() => {
    if (!error && !isLoading && !isDeleting && isMounted()) selectionRef.current.cancelSelection()
  }, [ error, isLoading, isDeleting ])

  return (
    <SelectableList
      ref={selectionRef}
      list={activities}
      style={{ paddingBottom: 45, paddingInline: 0 }}
      onDelete={openModal}
      onCancelSelection={closeModal}
      isLoading={isLoading}
      isDeleting={isDeleting}
      createTooltipTitle={activityListButtons.start}
      isDisabled={isSelectionDisabled}
      createHref="/activities/create"
    >
      {({
        selected,
        isSelectionEnabled,
        onSelect,
        onContextMenu,
        onTouchHandlers,
      }) => (
        <ListContainer>
          <List
            itemLayout="horizontal"
            dataSource={activities}
            locale={{ emptyText: isLoading ? common.loading : common.no_data }}
            renderItem={(item: ActivityListItem) => (
              <SelectableList.Item
                data-selectable-id={item.id}
                key={item.id}
                onContextMenu={onContextMenu}
                onClick={onSelect}
                $selected={selected[item.id]}
                {...onTouchHandlers}
              >
                <ActivityItem
                  loadingActivityId={loadingId}
                  loadActivity={handleLoadActivity}
                  activityDictionary={activityDictionary}
                  exercisePayloadDictionary={exercisePayloadDictionary}
                  isSelectionEnabled={isSelectionEnabled}
                  selected={selected[item.id]}
                  isLoading={activitiesToDelete[item.id] && isDeleting}
                  listEl={containerRef}
                  setIsSelectionDisabled={setIsSelectionDisabled}
                  {...item}
                />
              </SelectableList.Item>
            )}
          />
          <SelectableList.Modal
            okButtonProps={{ danger: true }}
            okText={activityModal.delete.ok_button}
            cancelText={activityModal.delete.cancel_button}
            open={isModalVisible} 
            onOk={handleDelete} 
            onCancel={closeModal}
            text={activityModal.delete.body}
            selected={selected}
          />
        </ListContainer>
      )}
    </SelectableList>
  )
}

export default ActivityList
