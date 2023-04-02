import React, { FC, useEffect, useState } from 'react'
import { List, notification } from 'antd'
import { ActivityItem } from './components'
import { ActivityDeleteError, ActivityForm, ActivityListItem } from 'app/store/slices/activity/types'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { SelectableList } from 'app/components'
import { useRouterContext } from '@/src/app/contexts/router/RouterContextProvider'
import { useMounted } from '@/src/app/hooks'

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
  const { isMounted, useHandleMounted } = useMounted()
  const [ activitiesToDelete, setActivitiesToDelete ] = useState({})
  const { loading, loadingRoute } = useRouterContext()
  const [ ,, loadingId ] = (loadingRoute || '').split('/')
  const { intl, lang } = useIntlContext()
  const { modal, common } = intl
  const { payload: exercisePayloadDictionary } = intl.pages.exercises
  const { activities: activityDictionary } = intl.pages
  const { modal: activityModal } = activityDictionary
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
    }).then((res) => {
      if (isMounted() && res?.data?.success) {
        setActivitiesToDelete({})
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
      openNotification({ message: modal.common.title.error, description: (error as ApiDeleteActivityError)?.data?.error?.message?.text?.[lang || 'eng'] })
    }
  }, [ error ])

  useEffect(() => {
    if (!error && !isLoading && !isDeleting && isMounted()) selectionRef.current.handleCancelSelection()
  }, [ error, isLoading, isDeleting ])

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
            locale={{ emptyText: isLoading ? common.loading : common.no_data }}
            renderItem={(item: ActivityListItem) => (
              <SelectableList.Item data-selectable-id={item.id} key={item.id} onContextMenu={onContextMenu} onClick={onSelect} $selected={selected[item.id]}>
                <ActivityItem
                  loadingActivityId={loading && loadingId ? loadingId : null}
                  activityDictionary={activityDictionary}
                  exercisePayloadDictionary={exercisePayloadDictionary}
                  selectionEnabled={selectionEnabled}
                  selected={selected[item.id]}
                  isLoading={activitiesToDelete[item.id] && (isDeleting || loading)}
                  {...item}
                />
              </SelectableList.Item>
            )}
          />
          <SelectableList.Modal 
            okText={activityModal.delete.ok_button}
            cancelText={activityModal.delete.cancel_button}
            visible={isModalVisible} 
            onOk={handleDelete} 
            onCancel={closeModal}
            text={activityModal.delete.body}
            selected={selected}
          />
        </>
      )}
    </SelectableList>
  )
}

export default ActivityList
