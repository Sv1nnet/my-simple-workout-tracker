import type { NextPage } from 'next'
import { FC, useEffect, useRef } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from 'layouts/main'
import handleJwtStatus from 'app/utils/handleJwtStatus'
import { WorkoutList } from 'app/views'
import routes from 'app/constants/end_points'
import { workoutApi } from 'app/store/slices/workout/api'
import { GetWorkoutListError, WorkoutListItem } from '@/src/app/store/slices/workout/types'
import { SearchPanel } from 'app/components/list_buttons'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { selectList, updateList } from '@/src/app/store/slices/workout'
import { ApiGetListError, useAppSelector, useLoadList, useShowListErrorNotification } from '@/src/app/hooks'
import { useRouterContext } from '@/src/app/contexts/router/RouterContextProvider'
import respondAfterTimeoutInMs, { Timeout } from '@/src/app/utils/respondAfterTimeoutInMs'
import { API_STATUS } from '@/src/app/constants/api_statuses'
import { useSearchPanelUtils } from '@/src/app/components/list_buttons/search_panel/SearchPanel'
import EndlessScrollableContainer, { Ref } from '@/src/app/components/endless_scrollable_container/EndlessScrollableContainer'
import { useListContext } from '@/src/app/contexts/list/ListContextProvider'

export interface IWorkouts {
  workouts: WorkoutListItem[];
}

export type ApiGetWorkoutListError = {
  data: GetWorkoutListError;
  status: number;
}

const CREATE_ROUTE = '/workouts/create'

const Workouts: NextPage<IWorkouts> & { Layout: FC, layoutProps?: {} } = ({ workouts: _workouts }) => {
  const { add } = useIntlContext().intl.pages.workouts.list_buttons
  const { loading, loadingRoute } = useRouterContext()
  const $container = useRef<Ref>(null)
  const { listEl, setListEl } = useListContext($container.current)
  const [ loadWorkouts, { error, isError } ] = workoutApi.useLazyListQuery()
  const { data: workoutsInStore = [], status } = useAppSelector(selectList)
  const { filteredList: workoutsToShow, onSearchInputChange } = useSearchPanelUtils(
    workoutsInStore,
    {
      filterFn: searchValue => exercise => exercise.title.toLowerCase().includes(searchValue),
    },
    {
      onChangeDelay: 200,
      shouldTrim: true,
      shouldLowerCase: true,
    },
  )
  const [
    deleteWorkouts,
    {
      isLoading: isDeleting,
      error: deleteError,
    },
  ] = workoutApi.useDeleteManyMutation()

  const [ copyWorkouts, { isLoading: isCopying, error: copyError } ] = workoutApi.useCopyMutation()

  const handleCopy = ids => copyWorkouts(ids).then((res: any) => {
    if (res?.data?.success) {
      loadWorkouts()
    }
    return res
  })

  const { dispatch } = useLoadList({
    loading,
    updateList,
    listFromComponent: _workouts,
    loadList: loadWorkouts,
  })

  const handleDelete = ({ ids }) => deleteWorkouts({ ids })
    .then((res: any) => {
      if (res.error) return res.error
      dispatch(updateList(workoutsInStore.filter(workout => !ids.includes(workout.id))))
      return res
    })

  useShowListErrorNotification({ isError, error: (error as ApiGetListError) })

  useEffect(() => {
    if ((listEl as Ref)?.$el !== $container.current?.$el) {
      setListEl($container.current)
      $container.current.scrollTo({ left: 0, top: 0 })
    }
  }, [ $container.current, listEl ])

  return (
    <EndlessScrollableContainer ref={$container}>
      <SearchPanel
        onChange={onSearchInputChange}
        loading={loading && loadingRoute === CREATE_ROUTE}
        href={CREATE_ROUTE}
        addButtonText={add}
      />
      <WorkoutList
        deleteWorkouts={handleDelete}
        copyWorkouts={handleCopy}
        error={deleteError || copyError}
        isLoading={status === API_STATUS.LOADING}
        isDeleting={isDeleting}
        isCopying={isCopying}
        workouts={workoutsToShow}
      />
    </EndlessScrollableContainer>
  )
}

Workouts.Layout = MainTemplate
Workouts.layoutProps = { tab: 'workouts' }

export default Workouts

const timeout = new Timeout()

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    const res = await respondAfterTimeoutInMs({ timeout, ctx, route: routes.workout.v1.list.full })

    return handleJwtStatus(res, () => ({
      props: {
        workouts: res.data,
      },
    }))
  }
  return { props: {} }
})
