import { List, notification } from 'antd'
import { ActivityItem } from './components'
import { ActivityDeleteError, ActivityForm, ActivityListItem } from 'app/store/slices/activity/types'
import React, { FC, useContext, useEffect, useState } from 'react'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { SelectableList } from 'app/components'
import { RouterContext } from '@/src/app/contexts/router/RouterContextProvider'

export type ApiDeleteActivityError = {
  data: ActivityDeleteError;
  status: number;
}

type DeleteActivityPayload = { ids: Pick<ActivityForm, 'id'>[] }

export interface IActivityList {
  activities: ActivityListItem[];
  deleteActivities: (ids: DeleteActivityPayload) => any;
  error: FetchBaseQueryError | SerializedError | CustomBaseQueryError;
  isLoading: boolean;
  isDeleting: boolean;
}

const ActivityList: FC<IActivityList> = ({ deleteActivities, error, isLoading, isDeleting, activities }) => {
  const [ activitiesToDelete, setActivitiesToDelete ] = useState({})
  const { loading, loadingRoute } = useContext(RouterContext)
  const [ ,, loadingId ] = (loadingRoute || '').split('/')
  const { intl } = useContext(IntlContext)
  const { payload: exercisePayloadDictionary } = intl.pages.exercises
  const { activities: activityDictionary } = intl.pages
  const { modal } = activityDictionary
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
      ids: Object.keys(toDelete).filter(id => toDelete[id]) as Pick<ActivityForm, 'id'>[],
    }).finally(() => setActivitiesToDelete({}))
  }

  useEffect(() => {
    if (error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: 'Error!', description: (error as ApiDeleteActivityError)?.data?.error.message?.text })
    }
  }, [ error ])

  useEffect(() => {
    if (!error && !isLoading) selectionRef.current.handleCancelSelection()
  }, [ error, isLoading ])

  return (
    <SelectableList
      ref={selectionRef}
      list={activities}
      style={{ paddingBottom: 45 }}
      onDelete={openModal}
      onCancelSelection={closeModal}
      isLoading={isLoading}
      isDeleting={isDeleting}
      createHref="/activities/create"
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
            dataSource={activities}
            renderItem={(item: ActivityListItem) => (
              <SelectableList.Item data-selectable-id={item.id} key={item.id} onContextMenu={onContextMenu} onClick={onSelect} $selected={selected[item.id]}>
                <ActivityItem
                  loadingActivityId={loading && loadingId ? loadingId : null}
                  activityDictionary={activityDictionary}
                  exercisePayloadDictionary={exercisePayloadDictionary}
                  selectionEnabled={selectionEnabled}
                  selected={selected[item.id]}
                  isLoading={activitiesToDelete[item.id]}
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
            text={modal.delete.body}
            selected={selected}
          />
        </>
      )}
    </SelectableList>
  )
}

export default ActivityList
