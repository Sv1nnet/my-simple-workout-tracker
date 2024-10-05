import { useEffect, useRef, useState } from 'react'
import { ActivityList } from 'app/views'
import { ActivityListItem } from 'app/store/slices/activity/types'
import { activityApi } from 'store/slices/activity/api'
import { selectList, updateList } from 'store/slices/activity'
import { ApiGetListError, useAppSelector, useLoadList, useShowListErrorNotification } from 'app/hooks'
import { SearchPanel } from 'app/components/list_buttons'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { Dayjs } from 'dayjs'
import { API_STATUS } from 'app/constants/api_statuses'
import { EndlessScrollableContainer } from 'app/components'
import { useSearchPanelUtils } from 'app/components/list_buttons/search_panel/SearchPanel'
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
  const { add } = intl.pages.workouts.list_buttons
  const [ loadActivities, { error, isError, isFetching } ] = activityApi.useLazyListQuery()
  const { data: activitiesInStore = [], total, status } = useAppSelector(selectList)
  const prevRequestRef = useRef<ReturnType<typeof loadActivities>>(null)

  const { searchValue, filteredList: activitiesToShow, onSearchInputChange, onRefetchClick } = useSearchPanelUtils(
    activitiesInStore,
    {
      onChange(_searchValue) {
        prevRequestRef.current?.abort()
        prevRequestRef.current = loadActivities({ page: 1, byPage: 50, searchValue: _searchValue })

        prevRequestRef.current.unwrap()
          .then((res) => {
            setPage(1)
            return res
          })
      },
      refetch: () => loadActivities({ page: 1, byPage: 50, searchValue: searchValue }),
    },
    {
      onChangeDelay: 350,
      shouldTrim: true,
      shouldLowerCase: true,
    },
  )

  const { dispatch } = useLoadList({
    loadList: () => loadActivities({ page: 1, byPage: 50, searchValue }),
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
        loadActivities({ page: page + 1, byPage: 50, searchValue })
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

  return (
    <>
      <PageHeaderTitle>{intl.header.activities}</PageHeaderTitle>
      <EndlessScrollableContainer ref={$container} callOnMount onScroll={handleScroll}>
        <SearchPanel
          loading={isFetching}
          onChange={onSearchInputChange}
          refetch={onRefetchClick}
          href={CREATE_ROUTE}
          addButtonText={add}
        />
        <ActivityList
          deleteActivities={handleDeleteActivities}
          error={deleteError}
          isLoading={status === API_STATUS.LOADING}
          isDeleting={isDeleting}
          activities={activitiesToShow}
        />
      </EndlessScrollableContainer>
    </>
  )
}

export default Activities
