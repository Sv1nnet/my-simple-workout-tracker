import type { NextPage } from 'next'
import { FC, useContext, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from 'layouts/main'
import handleJwtStatus from 'app/utils/handleJwtStatus'
import { ActivityList } from 'app/views'
import { ActivityListItem, GetActivityListError, GetActivityListSuccess } from 'app/store/slices/activity/types'
import routes from 'app/constants/end_points'
import { activityApi } from 'store/slices/activity/api'
import { notification } from 'antd'
import { selectList, updateList } from 'store/slices/activity'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { AddButton } from 'app/components/list_buttons'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'
import { Dayjs } from 'dayjs'

export type ExerciseResultsDetails = {
  weight?: number,
  repeats?: number,
  mass_unit?: string,
  time?: string | number | number[] | Dayjs,
}

export interface IActivities {
  activities: ActivityListItem[];
}

export type ApiGetActivitiesListError = {
  data: GetActivityListError;
  status: number;
}

const Activities: NextPage<IActivities> & { Layout: FC, layoutProps?: {} } = ({ activities: _activities }) => {
  const { add } = useContext(IntlContext).intl.pages.workouts.list_buttons
  const dispatch = useAppDispatch()
  const [ loadActivities, { error, isError } ] = activityApi.useLazyListQuery()
  const { data: activitiesInStore } = useAppSelector(selectList)
  const [
    deleteActivities,
    {
      isError: isDeleteError,
      isLoading: isDeleteLoading,
      error: deleteError,
      status: deleteStatus,
      isUninitialized: isDeleteUninitialized,
    },
  ] = activityApi.useDeleteManyMutation()

  const getActivities = () => isDeleteUninitialized ? _activities : activitiesInStore

  const handeDeleteActivities = args => deleteActivities(args)
    .then(async (res) => {
      loadActivities()
      return res
    })

  useEffect(() => {
    if (!_activities) {
      loadActivities()
      return
    }
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
        deleteActivities={handeDeleteActivities}
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
