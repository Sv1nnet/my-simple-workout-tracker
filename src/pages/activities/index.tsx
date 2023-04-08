import type { NextPage } from 'next'
import { FC, useEffect, useRef, useState } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from 'layouts/main'
import handleJwtStatus from 'app/utils/handleJwtStatus'
import { ActivityList } from 'app/views'
import { ActivityListItem } from 'app/store/slices/activity/types'
import { activityApi } from 'store/slices/activity/api'
import { selectList, updateList } from 'store/slices/activity'
import { ApiGetListError, useAppSelector, useLoadList, useShowListErrorNotification } from 'app/hooks'
import { SearchPanel } from 'app/components/list_buttons'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { Dayjs } from 'dayjs'
import { useRouterContext } from 'app/contexts/router/RouterContextProvider'
import { API_STATUS } from 'app/constants/api_statuses'
import { EndlessScrollableContainer } from 'app/components'
import { useSearchPanelUtils } from '@/src/app/components/list_buttons/search_panel/SearchPanel'
import { Ref } from '@/src/app/components/endless_scrollable_container/EndlessScrollableContainer'
import { useListContext } from '@/src/app/contexts/list/ListContextProvider'

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
  const $container = useRef<Ref>(null)
  const { listEl, setListEl } = useListContext($container.current)
  const { add } = useIntlContext().intl.pages.workouts.list_buttons
  const { loading, loadingRoute } = useRouterContext()
  const [ loadActivities, { error, isError, isFetching } ] = activityApi.useLazyListQuery()
  const { data: activitiesInStore = [], total, status } = useAppSelector(selectList)
  const prevRequestRef = useRef<ReturnType<typeof loadActivities>>(null)

  const { searchValue, filteredList: activitiesToShow, onSearchInputChange } = useSearchPanelUtils(
    activitiesInStore,
    {
      onChange(_searchValue) {
        prevRequestRef.current?.abort()
        prevRequestRef.current = loadActivities({ page: 1, byPage: 50, searchValue: _searchValue })

        prevRequestRef.current.unwrap()
          .then((res) => {
            setPage(1)
            return res
          })
      },
    },
    {
      onChangeDelay: 350,
      shouldTrim: true,
      shouldLowerCase: true,
    },
  )

  const { dispatch } = useLoadList({
    loading,
    updateList,
    listFromComponent: _activities,
    loadList: () => loadActivities({ page: 1, byPage: 50, searchValue }),
  })

  const [
    deleteActivities,
    {
      isLoading: isDeleting,
      error: deleteError,
    },
  ] = activityApi.useDeleteManyMutation()

  const handleDeleteActivities = ({ ids }) => deleteActivities({ ids })
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
        loadActivities({ page: page + 1, byPage: 50, searchValue })
          .unwrap()
          .then((res) => {
            setPage(page + 1)
            return res
          })
      }
    }
  }

  useShowListErrorNotification({ isError, error: (error as ApiGetListError) })

  useEffect(() => {
    if ((listEl as Ref)?.$el !== $container.current?.$el) {
      setListEl($container.current)
    }
  }, [ $container.current, listEl ])

  return (
    <EndlessScrollableContainer ref={$container} callOnMount onScroll={handleScroll}>
      <SearchPanel
        onChange={onSearchInputChange}
        loading={loading && loadingRoute === CREATE_ROUTE}
        href={CREATE_ROUTE}
        addButtonText={add}
      />
      <ActivityList
        deleteActivities={handleDeleteActivities}
        error={deleteError}
        isLoading={status === API_STATUS.LOADING}
        isDeleting={isDeleting}
        activities={activitiesToShow}
      />
    </EndlessScrollableContainer>
  )
}

Activities.Layout = MainTemplate
Activities.layoutProps = { tab: 'activities' }

export default Activities

// const timeout = new Timeout()
// TODO: implement fetching activities by query
export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    // const res = await respondAfterTimeoutInMs({ timeout, ctx, route: `${routes.activity.v1.list.full}?page=1&byPage=50` })

    return handleJwtStatus({}, () => ({
      props: {
        // activities: res.data,
        activities: null,
      },
    }))
  }
  return { props: {} }
})