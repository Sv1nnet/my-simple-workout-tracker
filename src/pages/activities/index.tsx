import type { NextPage } from 'next'
import { FC, useContext, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from 'layouts/main'
import handleJwtStatus from 'app/utils/handleJwtStatus'
import { ActivityList } from 'app/views'
import { ActivityForm, GetActivityListError, GetActivityListSuccess } from 'app/store/slices/activity/types'
import routes from 'app/constants/end_points'
import { activityApi } from 'store/slices/activity/api'
import { notification } from 'antd'
import { updateList } from 'store/slices/activity'
import { useAppDispatch } from 'app/hooks'
import { AddButton } from 'app/components/list_buttons'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'

export interface IActivities {
  activities: ActivityForm[];
}

export type ApiGetActivitiesListError = {
  data: GetActivityListError;
  status: number;
}

const Activities: NextPage<IActivities> & { Layout: FC, layoutProps?: {} } = ({ activities: _activities }) => {
  const { add } = useContext(IntlContext).intl.pages.workouts.list_buttons
  const dispatch = useAppDispatch()
  const [ loadActivities, { data: { data } = { data: [] }, error, isError } ] = activityApi.useLazyListQuery()
  const [
    deleteActivities,
    {
      data: { data: deleteData } = { data: [] },
      isError: isDeleteError,
      isLoading: isDeleteLoading,
      error: deleteError,
      status: deleteStatus,
    },
  ] = activityApi.useDeleteManyMutation()

  const getActivities = () => {
    if (deleteStatus !== 'fulfilled') {
      return !data.length && _activities ? _activities : data
    }
    return deleteData
  }

  useEffect(() => {
    if (!_activities || _activities.length === 0) loadActivities()
    dispatch(updateList(getActivities()))
  }, [])

  useEffect(() => {
    if (isError && error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: 'Error!', description: (error as ApiGetActivitiesListError)?.data?.error?.message })
    }
  }, [ error ])

  useEffect(() => {
    if (deleteStatus === 'fulfilled' && !isDeleteLoading && !deleteError) loadActivities()
  }, [ isDeleteLoading, deleteStatus, isDeleteError ])

  return (
    <>
      <AddButton href="/activities/create" text={add} />
      <ActivityList
        deleteActivities={deleteActivities}
        error={deleteError}
        isLoading={isDeleteLoading}
        activities={getActivities() ?? []}
      />
    </>
  )
}

Activities.Layout = MainTemplate
Activities.layoutProps = { tab: 'activities' }

export default Activities

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    let res: GetActivityListSuccess | GetActivityListError = await fetch(`${routes.activity.v1.list.full}`, {
      headers: {
        Authorization: `Bearer ${ctx.req.session.token}`,
      },
    }).then(r => r.json())

    return handleJwtStatus(res, () => ({
      props: {
        activities: res.data,
      },
    }))
  }
  return { props: {} }
})
