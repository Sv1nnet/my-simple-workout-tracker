import type { NextPage } from 'next'
import { FC, useContext, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from 'layouts/main'
import handleJwtStatus from 'app/utils/handleJwtStatus'
import { ActivityList } from 'app/views'
import { ActivityListItem } from 'app/store/slices/activity/types'
import routes from 'app/constants/end_points'
import { activityApi } from 'store/slices/activity/api'
import { selectList, updateList } from 'store/slices/activity'
import { ApiGetListError, useAppSelector, useLoadList, useShowListErrorNotification } from 'app/hooks'
import { AddButton } from 'app/components/list_buttons'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'
import { Dayjs } from 'dayjs'
import { RouterContext } from '@/src/app/contexts/router/RouterContextProvider'
import respondAfterTimeoutInMs, { Timeout } from '@/src/app/utils/respondAfterTimeoutInMs'
import { API_STATUS } from '@/src/app/constants/api_statuses'

export type ExerciseResultsDetails = {
  weight?: number,
  repeats?: number,
  mass_unit?: string,
  time?: string | number | number[] | Dayjs,
}

export interface IActivities {
  activities: ActivityListItem[];
}

const CREATE_ROUTE = '/activities/create'

const Activities: NextPage<IActivities> & { Layout: FC, layoutProps?: {} } = ({ activities: _activities }) => {
  const { add } = useContext(IntlContext).intl.pages.workouts.list_buttons
  const { loading, loadingRoute } = useContext(RouterContext)
  const [ loadActivities, { error, isError } ] = activityApi.useLazyListQuery()
  const { data: activitiesInStore, status } = useAppSelector(selectList)
  const [
    deleteActivities,
    {
      isError: isDeleteError,
      isLoading: isDeleting,
      error: deleteError,
      status: deleteStatus,
    },
  ] = activityApi.useDeleteManyMutation()

  const { dispatch } = useLoadList({
    loading,
    updateList,
    listFromComponent: _activities,
    loadList: loadActivities,
  })

  const handeDeleteActivities = ({ ids }) => deleteActivities({ ids })
    .then((res: any) => {
      if (res.error) return res.error
      dispatch(updateList(activitiesInStore.filter(activity => !ids.includes(activity.id))))
      return res
    })

  useShowListErrorNotification({ isError, error: (error as ApiGetListError) })

  useEffect(() => {
    if (deleteStatus === 'fulfilled' && !isDeleting && !deleteError) loadActivities()
  }, [ isDeleting, deleteStatus, isDeleteError ])

  return (
    <>
      <AddButton loading={loading && loadingRoute === CREATE_ROUTE} href={CREATE_ROUTE} text={add} />
      <ActivityList
        deleteActivities={handeDeleteActivities}
        error={deleteError}
        isLoading={status === API_STATUS.LOADING}
        isDeleting={isDeleting}
        activities={activitiesInStore ?? []}
      />
    </>
  )
}

Activities.Layout = MainTemplate
Activities.layoutProps = { tab: 'activities' }

export default Activities

const timeout = new Timeout()

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    const res = await respondAfterTimeoutInMs({ timeout, ctx, route: routes.activity.v1.list.full })

    return handleJwtStatus(res, () => ({
      props: {
        activities: res.data,
      },
    }))
  }
  return { props: {} }
})
