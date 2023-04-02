import type { NextPage } from 'next'
import { FC, useEffect, useRef } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from 'layouts/main'
import handleJwtStatus from 'app/utils/handleJwtStatus'
import { ExerciseList } from 'app/views'
import { ExerciseListItem } from 'app/store/slices/exercise/types'
import routes from 'app/constants/end_points'
import { exerciseApi } from 'store/slices/exercise/api'
import { selectList, updateList } from 'store/slices/exercise'
import { ApiGetListError, useAppSelector, useLoadList, useShowListErrorNotification } from 'app/hooks'
import { SearchPanel } from 'app/components/list_buttons'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useRouterContext } from '@/src/app/contexts/router/RouterContextProvider'
import respondAfterTimeoutInMs, { Timeout } from '@/src/app/utils/respondAfterTimeoutInMs'
import { API_STATUS } from '@/src/app/constants/api_statuses'
import { useSearchPanelUtils } from '@/src/app/components/list_buttons/search_panel/SearchPanel'
import EndlessScrollableContainer, { Ref } from '@/src/app/components/endless_scrollable_container/EndlessScrollableContainer'
import { useListContext } from '@/src/app/contexts/list/ListContextProvider'

export interface IExercises {
  exercises: ExerciseListItem<number>[];
}

const CREATE_ROUTE = '/exercises/create'

const Exercises: NextPage<IExercises> & { Layout: FC, layoutProps?: {} } = ({ exercises: _exercises }) => {
  const { add } = useIntlContext().intl.pages.workouts.list_buttons
  const { loading, loadingRoute } = useRouterContext()
  const $container = useRef<Ref>(null)
  const { listEl, setListEl } = useListContext($container.current)
  const { data: exercisesInStore = [], status } = useAppSelector(selectList)
  const { filteredList: exercisesToShow, onSearchInputChange } = useSearchPanelUtils(
    exercisesInStore,
    {
      filterFn: searchValue => exercise => exercise.title.toLowerCase().includes(searchValue),
    },
    {
      onChangeDelay: 200,
      shouldTrim: true,
      shouldLowerCase: true,
    },
  )

  const [ loadExercises, { error, isError } ] = exerciseApi.useLazyListQuery()
  const [
    deleteExercises,
    {
      isLoading: isDeleting,
      error: deleteError,
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
      <ExerciseList
        deleteExercises={handleDelete}
        error={deleteError}
        isLoading={status === API_STATUS.LOADING}
        isDeleting={isDeleting}
        exercises={exercisesToShow}
      />
    </EndlessScrollableContainer>
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
