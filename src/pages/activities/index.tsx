import type { NextPage } from 'next'
import { FC, useState } from 'react'
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
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { Dayjs } from 'dayjs'
import { useRouterContext } from '@/src/app/contexts/router/RouterContextProvider'
import respondAfterTimeoutInMs, { Timeout } from '@/src/app/utils/respondAfterTimeoutInMs'
import { API_STATUS } from '@/src/app/constants/api_statuses'
import { EndlessScrollableContainer } from '@/src/app/components'

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
  const [ page, setPage ] = useState(1)
  const { add } = useIntlContext().intl.pages.workouts.list_buttons
  const { loading, loadingRoute } = useRouterContext()
  const [ loadActivities, { error, isError, isFetching } ] = activityApi.useLazyListQuery()
  const { data: activitiesInStore, total, status } = useAppSelector(selectList)
  const [
    deleteActivities,
    {
      isLoading: isDeleting,
      error: deleteError,
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
      dispatch(updateList({
        total: res.data.total,
        list: activitiesInStore.filter(activity => !ids.includes(activity.id)),
      }))
      return res
    })

  const handleScroll = (e) => {
    if (activitiesInStore.length < total && e) {
      const { target } = e
      if (target.scrollHeight - (target.offsetHeight + target.scrollTop) <= 100 && !isFetching) {
        setPage(page + 1)
        loadActivities({ page: page + 1, byPage: 30 })
      }
    }
  }

  useShowListErrorNotification({ isError, error: (error as ApiGetListError) })

  return (
    <EndlessScrollableContainer callOnMount onScroll={handleScroll}>
      <AddButton loading={loading && loadingRoute === CREATE_ROUTE} href={CREATE_ROUTE} text={add} />
      <ActivityList
        deleteActivities={handeDeleteActivities}
        error={deleteError}
        isLoading={status === API_STATUS.LOADING}
        isDeleting={isDeleting}
        activities={activitiesInStore ?? []}
      />
    </EndlessScrollableContainer>
  )
}

Activities.Layout = MainTemplate
Activities.layoutProps = { tab: 'activities' }

export default Activities

const timeout = new Timeout()

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    const res = await respondAfterTimeoutInMs({ timeout, ctx, route: `${routes.activity.v1.list.full}?page=1&byPage=30` })

    return handleJwtStatus(res, () => ({
      props: {
        activities: res.data,
      },
    }))
  }
  return { props: {} }
})
