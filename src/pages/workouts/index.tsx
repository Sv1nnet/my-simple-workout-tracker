import type { NextPage } from 'next'
import { FC, useContext, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from 'layouts/main'
import handleJwtStatus from 'app/utils/handleJwtStatus'
import { WorkoutList } from 'app/views'
import routes from 'app/constants/end_points'
import { notification } from 'antd'
import { workoutApi } from 'app/store/slices/workout/api'
import { GetWorkoutListError, GetWorkoutListSuccess, WorkoutForm } from '@/src/app/store/slices/workout/types'
import { AddButton } from 'app/components/list_buttons'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'

export interface IExercises {
  workouts: WorkoutForm[];
}

export type ApiGetExerciseListError = {
  data: GetWorkoutListError;
  status: number;
}

const Workouts: NextPage<IExercises> & { Layout: FC, layoutProps?: {} } = ({ workouts: _workouts }) => {
  const { add } = useContext(IntlContext).intl.pages.workouts.list_buttons
  const [ loadWorkouts, { data: { data } = { data: [] }, error, isError } ] = workoutApi.useLazyListQuery()
  const [
    deleteWorkouts,
    {
      data: { data: deleteData } = { data: [] },
      isError: isDeleteError,
      isLoading: isDeleteLoading,
      error: deleteError,
      status: deleteStatus,
    },
  ] = workoutApi.useDeleteManyMutation()

  const getWorkouts = () => {
    if (deleteStatus !== 'fulfilled') {
      return !data.length && _workouts ? _workouts : data
    }
    return deleteData
  }

  useEffect(() => {
    if (!_workouts || _workouts.length === 0) loadWorkouts()
  }, [])

  useEffect(() => {
    if (isError && error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: 'Error!', description: (error as ApiGetExerciseListError)?.data?.error?.message })
    }
  }, [ error ])

  useEffect(() => {
    if (deleteStatus === 'fulfilled' && !isDeleteLoading && !deleteError) loadWorkouts()

  }, [ isDeleteLoading, deleteStatus, isDeleteError ])

  return (
    <>
      <AddButton href="/workouts/create" text={add} />
      <WorkoutList
        deleteWorkouts={deleteWorkouts}
        error={deleteError}
        isLoading={isDeleteLoading}
        workouts={getWorkouts()}
      />
    </>
  )
}

Workouts.Layout = MainTemplate
Workouts.layoutProps = { tab: 'workouts' }

export default Workouts

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    let res: GetWorkoutListSuccess | GetWorkoutListError = await fetch(`${routes.workout.v1.list.full}`, {
      headers: {
        Authorization: `Bearer ${ctx.req.session.token}`,
      },
    }).then(r => r.json())

    return handleJwtStatus(res, () => ({
      props: {
        workouts: res.data,
      },
    }))
  }
  return { props: {} }
})
