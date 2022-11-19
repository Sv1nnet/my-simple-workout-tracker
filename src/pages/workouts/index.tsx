import type { NextPage } from 'next'
import { FC, useContext, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from 'layouts/main'
import handleJwtStatus from 'app/utils/handleJwtStatus'
import { WorkoutList } from 'app/views'
import routes from 'app/constants/end_points'
import { workoutApi } from 'app/store/slices/workout/api'
import { GetWorkoutListError, WorkoutListItem } from '@/src/app/store/slices/workout/types'
import { AddButton } from 'app/components/list_buttons'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'
import { selectList, updateList } from '@/src/app/store/slices/workout'
import { ApiGetListError, useAppSelector, useLoadList, useShowListErrorNotification } from '@/src/app/hooks'
import { RouterContext } from '@/src/app/contexts/router/RouterContextProvider'
import respondAfterTimeoutInMs, { Timeout } from '@/src/app/utils/respondAfterTimeoutInMs'
import { API_STATUS } from '@/src/app/constants/api_statuses'

export interface IWorkouts {
  workouts: WorkoutListItem[];
}

export type ApiGetWorkoutListError = {
  data: GetWorkoutListError;
  status: number;
}

const CREATE_ROUTE = '/workouts/create'

const Workouts: NextPage<IWorkouts> & { Layout: FC, layoutProps?: {} } = ({ workouts: _workouts }) => {
  const { add } = useContext(IntlContext).intl.pages.workouts.list_buttons
  const { loading, loadingRoute } = useContext(RouterContext)
  const [ loadWorkouts, { error, isError } ] = workoutApi.useLazyListQuery()
  const { data: workoutsInStore, status } = useAppSelector(selectList)
  const [
    deleteWorkouts,
    {
      isError: isDeleteError,
      isLoading: isDeleting,
      error: deleteError,
      status: deleteStatus,
    },
  ] = workoutApi.useDeleteManyMutation()

  const { dispatch } = useLoadList({
    loading,
    updateList,
    listFromComponent: _workouts,
    loadList: loadWorkouts,
  })

  const handeDelete = ({ ids }) => deleteWorkouts({ ids })
    .then((res: any) => {
      if (res.error) return res.error
      dispatch(updateList(workoutsInStore.filter(workout => !ids.includes(workout.id))))
      return res
    })

  useShowListErrorNotification({ isError, error: (error as ApiGetListError) })

  useEffect(() => {
    if (deleteStatus === 'fulfilled' && !isDeleting && !deleteError) loadWorkouts()
  }, [ isDeleting, deleteStatus, isDeleteError ])

  return (
    <>
      <AddButton loading={loading && loadingRoute === CREATE_ROUTE} href={CREATE_ROUTE} text={add} />
      <WorkoutList
        deleteWorkouts={handeDelete}
        error={deleteError}
        isLoading={status === API_STATUS.LOADING}
        isDeleting={isDeleting}
        workouts={workoutsInStore ?? []}
      />
    </>
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
