import { useEffect, useRef } from 'react'
import { ExerciseList } from 'app/views'
import { ExerciseListItem } from 'app/store/slices/exercise/types'
import { exerciseApi } from 'store/slices/exercise/api'
import { selectList, updateList } from 'store/slices/exercise'
import { ApiGetListError, useAppSelector, useLoadList, useShowListErrorNotification } from 'app/hooks'
import { SearchPanel } from 'app/components/list_buttons'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { API_STATUS } from 'app/constants/api_statuses'
import { useSearchPanelUtils } from 'app/components/list_buttons/search_panel/SearchPanel'
import EndlessScrollableContainer, { Ref } from 'app/components/endless_scrollable_container/EndlessScrollableContainer'
import { useListContext } from 'app/contexts/list/ListContextProvider'

export interface IExercises {
  exercises: ExerciseListItem<number>[];
}

const CREATE_ROUTE = '/exercises/create'

const Exercises = () => {
  const { add } = useIntlContext().intl.pages.workouts.list_buttons
  const $container = useRef<Ref>(null)
  const { listEl, setListEl } = useListContext($container.current)
  const [ loadExercises, { error, isError, isFetching } ] = exerciseApi.useLazyListQuery()
  const { data: exercisesInStore = [], status } = useAppSelector(selectList)
  const { filteredList: exercisesToShow, onSearchInputChange, onRefetchClick } = useSearchPanelUtils(
    exercisesInStore,
    {
      filterFn: searchValue => exercise => exercise.title.toLowerCase().includes(searchValue),
      refetch: loadExercises,
    },
    {
      onChangeDelay: 200,
      shouldTrim: true,
      shouldLowerCase: true,
    },
  )

  const [
    deleteExercises,
    {
      isLoading: isDeleting,
      error: deleteError,
    },
  ] = exerciseApi.useDeleteManyMutation()

  const [ copyExercises, { isLoading: isCopying, error: copyError } ] = exerciseApi.useCopyMutation()

  const handleCopy = ids => copyExercises(ids).then((res: any) => {
    if (res?.data?.success) {
      loadExercises()
    }
    return res
  })

  const { dispatch } = useLoadList({
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
        refetch={onRefetchClick}
        loading={isFetching}
        href={CREATE_ROUTE}
        addButtonText={add}
      />
      <ExerciseList
        deleteExercises={handleDelete}
        copyExercises={handleCopy}
        error={deleteError || copyError}
        isLoading={status === API_STATUS.LOADING}
        isDeleting={isDeleting}
        isCopying={isCopying}
        exercises={exercisesToShow}
      />
    </EndlessScrollableContainer>
  )
}

export default Exercises
