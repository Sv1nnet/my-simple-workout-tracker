import { useEffect, useRef } from 'react'
import { WorkoutList } from 'app/views'
import { workoutApi } from 'app/store/slices/workout/api'
import { GetWorkoutListError, WorkoutListItem } from 'app/store/slices/workout/types'
import { SearchPanel } from 'app/components/list_buttons'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { selectList, updateList } from 'app/store/slices/workout'
import { ApiGetListError, useAppSelector, useLoadList, useShowListErrorNotification } from 'app/hooks'
import { API_STATUS } from 'app/constants/api_statuses'
import { useSearchPanelUtils } from 'app/components/list_buttons/search_panel/utils'
import EndlessScrollableContainer, { Ref } from 'app/components/endless_scrollable_container/EndlessScrollableContainer'
import { useListContext } from 'app/contexts/list/ListContextProvider'
import { DeleteWorkoutPayload } from 'app/views/workouts/components/list/WorkoutList'

export interface IWorkouts {
  workouts: WorkoutListItem[];
}

export type ApiGetWorkoutListError = {
  data: GetWorkoutListError;
  status: number;
}

const CREATE_ROUTE = '/workouts/create'

const Workouts = () => {
  const { add } = useIntlContext().intl.pages.workouts.list_buttons
  const $container = useRef<Ref>(null)
  const { listEl, setListEl } = useListContext($container.current)
  const [ loadWorkouts, { error, isError, isFetching } ] = workoutApi.useLazyListQuery()
  const { data: workoutsInStore, status } = useAppSelector(selectList)
  const { filteredList: workoutsToShow, onSearchInputChange, onRefetchClick } = useSearchPanelUtils(
    workoutsInStore,
    {
      filterFn: ({ searchValue, tags }) => workout => workout
        .title
        .toLowerCase()
        .includes(searchValue) && (
        !tags.length || !!workout.muscle_groups.length && tags.some(tag => workout.muscle_groups.find(muscleGroup => muscleGroup.id === tag.value))
      ),
      refetch: loadWorkouts,
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

  const handleCopy = (ids: DeleteWorkoutPayload) => copyWorkouts(ids).then((res: any) => {
    if (res?.data?.success) {
      loadWorkouts()
    }
    return res
  })

  const { dispatch } = useLoadList({
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
        shouldShowReloadButton={false}
        onChange={onSearchInputChange}
        refetch={onRefetchClick}
        loading={isFetching}
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
        containerRef={$container.current?.$el}
      />
    </EndlessScrollableContainer>
  )
}

export default Workouts
