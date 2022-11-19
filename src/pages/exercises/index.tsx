import type { NextPage } from 'next'
import { FC, useContext, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from 'layouts/main'
import handleJwtStatus from 'app/utils/handleJwtStatus'
import { ExerciseList } from 'app/views'
import { ExerciseListItem } from 'app/store/slices/exercise/types'
import routes from 'app/constants/end_points'
import { exerciseApi } from 'store/slices/exercise/api'
import { selectList, updateList } from 'store/slices/exercise'
import { ApiGetListError, useAppSelector, useLoadList, useShowListErrorNotification } from 'app/hooks'
import { AddButton } from 'app/components/list_buttons'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'
import { RouterContext } from '@/src/app/contexts/router/RouterContextProvider'
import respondAfterTimeoutInMs, { Timeout } from '@/src/app/utils/respondAfterTimeoutInMs'
import { API_STATUS } from '@/src/app/constants/api_statuses'

export interface IExercises {
  exercises: ExerciseListItem<number>[];
}

const CREATE_ROUTE = '/exercises/create'

const Exercises: NextPage<IExercises> & { Layout: FC, layoutProps?: {} } = ({ exercises: _exercises }) => {
  const { add } = useContext(IntlContext).intl.pages.workouts.list_buttons
  const { loading, loadingRoute } = useContext(RouterContext)
  const { data: exercisesInStore, status } = useAppSelector(selectList)
  const [ loadExercises, { error, isError } ] = exerciseApi.useLazyListQuery()
  const [
    deleteExercises,
    {
      isError: isDeleteError,
      isLoading: isDeleting,
      error: deleteError,
      status: deleteStatus,
    },
  ] = exerciseApi.useDeleteManyMutation()

  const { dispatch } = useLoadList({
    loading,
    updateList,
    listFromComponent: _exercises,
    loadList: loadExercises,
  })

  const handleDelete = ({ ids }) => deleteExercises({ ids })
    .then((res: any) => {
      if (res.error) return res.error
      dispatch(updateList(exercisesInStore.filter(exercise => !ids.includes(exercise.id))))
      return res
    })

  useShowListErrorNotification({ isError, error: (error as ApiGetListError) })

  useEffect(() => {
    if (deleteStatus === 'fulfilled' && !isDeleting && !deleteError) loadExercises()
  }, [ isDeleting, deleteStatus, isDeleteError ])

  return (
    <>
      <AddButton loading={loading && loadingRoute === CREATE_ROUTE} href={CREATE_ROUTE} text={add} />
      <ExerciseList
        deleteExercises={handleDelete}
        error={deleteError}
        isLoading={status === API_STATUS.LOADING}
        isDeleting={isDeleting}
        exercises={exercisesInStore ?? []}
      />
    </>
  )
}

Exercises.Layout = MainTemplate
Exercises.layoutProps = { tab: 'exercises' }

export default Exercises

const timeout = new Timeout()

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    const res = await respondAfterTimeoutInMs({ timeout, ctx, route: routes.exercise.v1.list.full })

    return handleJwtStatus(res, () => ({
      props: {
        exercises: res.data,
      },
    }))
  }
  return { props: {} }
})
