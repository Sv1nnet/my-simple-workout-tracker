import { useEffect, useRef, useState } from 'react'
import { ActivityList } from 'app/views'
import { ActivityListItem } from 'app/store/slices/activity/types'
import { activityApi } from 'store/slices/activity/api'
import { resetListState, selectList, updateList } from 'store/slices/activity'
import { ApiGetListError, useAppSelector, useLoadList, useShowListErrorNotification } from 'app/hooks'
import { SearchPanel } from 'app/components/list_buttons'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { Dayjs } from 'dayjs'
import { API_STATUS } from 'app/constants/api_statuses'
import { EndlessScrollableContainer, LoaderInEndlessScrollableContainer as Loader } from 'app/components'
import { useSearchPanelUtils } from 'app/components/list_buttons/search_panel/utils'
import { Ref } from 'app/components/endless_scrollable_container/EndlessScrollableContainer'
import { useListContext } from 'app/contexts/list/ListContextProvider'
import { PageHeaderTitle } from 'app/contexts/header_title/HeaderTItleContextProvider'

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

const Activities = () => {
  const [ page, setPage ] = useState(1)
  const $container = useRef<Ref>(null)
  const { listEl, setListEl } = useListContext($container.current)
  const { intl } = useIntlContext()
  const { start } = intl.pages.activities.list_buttons
  const [ loadActivities, { error, isError, isFetching } ] = activityApi.useLazyListQuery()
  const { data: activitiesInStore = [], total, status } = useAppSelector(selectList)
  const prevRequestRef = useRef<ReturnType<typeof loadActivities>>(null)

  const { searchValue, tags, filteredList: activitiesToShow, onSearchInputChange, onRefetchClick } = useSearchPanelUtils(
    activitiesInStore,
    {
      onChange({ searchValue: _searchValue, tags: _tags }) {
        prevRequestRef.current?.abort()
        prevRequestRef.current = loadActivities({ page: 1, byPage: 50, searchValue: _searchValue, tags: _tags.map(tag => tag.value) })

        prevRequestRef.current.unwrap()
          .then((res) => {
            setPage(1)
            return res
          })
      },
      refetch: () => loadActivities({ page: 1, byPage: 50, searchValue, tags: tags.map(tag => tag.value) }),
    },
    {
      onChangeDelay: 350,
      shouldTrim: true,
      shouldLowerCase: true,
    },
  )

  const { dispatch } = useLoadList({
    loadList: () => loadActivities({ page: 1, byPage: 50, searchValue, tags: tags.map(tag => tag.value) }),
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
        loadActivities({ page: page + 1, byPage: 50, searchValue, tags: tags.map(tag => tag.value) })
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

  useEffect(() => () => {
    dispatch(resetListState())
  }, [])

  return (
    <>
      <PageHeaderTitle>{intl.header.activities}</PageHeaderTitle>
      <EndlessScrollableContainer ref={$container} callOnMount onScroll={handleScroll}>
        <SearchPanel
          shouldShowReloadButton={false}
          loading={isFetching}
          onChange={onSearchInputChange}
          refetch={onRefetchClick}
          href={CREATE_ROUTE}
          addButtonText={start}
        />
        <ActivityList
          deleteActivities={handleDeleteActivities}
          error={deleteError}
          isLoading={status === API_STATUS.LOADING}
          isDeleting={isDeleting}
          activities={activitiesToShow}
          containerRef={$container.current?.$el}
        />
        {isFetching && !!activitiesInStore.length && <Loader>{intl.common.loading}</Loader>}
      </EndlessScrollableContainer>
    </>
  )
}

export default Activities
