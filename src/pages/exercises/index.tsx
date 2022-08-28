import type { NextPage } from 'next'
import { FC, useContext, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from 'layouts/main'
import handleJwtStatus from 'app/utils/handleJwtStatus'
import { ExerciseList } from 'app/views'
import { ExerciseListItem, GetExerciseListError, GetExerciseListSuccess } from 'app/store/slices/exercise/types'
import routes from 'app/constants/end_points'
import { exerciseApi } from 'store/slices/exercise/api'
import { notification } from 'antd'
import { selectList, updateList } from 'store/slices/exercise'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { AddButton } from 'app/components/list_buttons'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'

export interface IExercises {
  exercises: ExerciseListItem<number>[];
}

export type ApiGetExerciseListError = {
  data: GetExerciseListError;
  status: number;
}

const Exercises: NextPage<IExercises> & { Layout: FC, layoutProps?: {} } = ({ exercises: _exercises }) => {
  const { add } = useContext(IntlContext).intl.pages.workouts.list_buttons
  const dispatch = useAppDispatch()
  const { data: exercisesInStore } = useAppSelector(selectList)
  const [ loadExercises, { error, isError } ] = exerciseApi.useLazyListQuery()
  const [
    deleteExercises,
    {
      isError: isDeleteError,
      isLoading: isDeleteLoading,
      error: deleteError,
      status: deleteStatus,
      isUninitialized: isDeleteUninitialized,
    },
  ] = exerciseApi.useDeleteManyMutation()

  const getExercises = () => isDeleteUninitialized ? _exercises : exercisesInStore

  useEffect(() => {
    if (!_exercises) {
      loadExercises()
      return
    }
    dispatch(updateList(getExercises()))
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
    <>
      <AddButton href="/exercises/create" text={add} />
      <ExerciseList
        deleteExercises={deleteExercises}
        error={deleteError}
        isLoading={isDeleteLoading}
        exercises={getExercises()}
      />
    </>
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
