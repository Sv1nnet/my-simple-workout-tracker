import type { NextPage } from 'next'
import { FC, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from 'layouts/main'
import handleJwtStatus from 'app/utils/handleJwtStatus'
import { ExerciseList } from 'app/components'
import { ExerciseForm, GetExerciseListError, GetExerciseListSuccess } from '@/src/app/store/slices/exercise/types'
import routes from '@/src/app/constants/end_points'
import { exerciseApi } from '@/src/app/store/slices/exercise/api'
import { notification } from 'antd'

export interface IExercises {
  exercises: ExerciseForm[];
}

export type ApiGetExerciseListError = {
  data: GetExerciseListError;
  status: number;
}

const Exercises: NextPage<IExercises> & { Layout: FC, layoutProps?: {} } = ({ exercises: _exercises }) => {
  const [ loadExercises, { data: { data } = { data: [] }, error, isError } ] = exerciseApi.useLazyListQuery()
  const [
    deleteExercises,
    {
      data: { data: deleteData } = { data: [] },
      isError: isDeleteError,
      isLoading: isDeleteLoading,
      error: deleteError,
      status: deleteStatus,
    },
  ] = exerciseApi.useDeleteManyMutation()

  const getExercises = () => {
    if (deleteStatus !== 'fulfilled') {
      return !data.length && _exercises ? _exercises : data
    }
    return deleteData
  }

  useEffect(() => {
    if (!_exercises || _exercises.length === 0) loadExercises()
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
    if (deleteStatus === 'fulfilled' && !isDeleteLoading && !deleteError) loadExercises()

  }, [ isDeleteLoading, deleteStatus, isDeleteError ])

  return (
    <ExerciseList
      deleteExercises={deleteExercises}
      error={deleteError}
      isLoading={isDeleteLoading}
      exercises={getExercises()}
    />
  )
}

Exercises.Layout = MainTemplate
Exercises.layoutProps = { tab: 'exercises' }

export default Exercises

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    let res: GetExerciseListSuccess | GetExerciseListError = await fetch(`${routes.exercise.v1.list.full}`, {
      headers: {
        Authorization: `Bearer ${ctx.req.session.token}`,
      },
    }).then(r => r.json())

    return handleJwtStatus(res, () => ({
      props: {
        exercises: res.data,
      },
    }))
  }
  return { props: {} }
})
