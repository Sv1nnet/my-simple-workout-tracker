import { useEffect, useMemo } from 'react'
import { IActivityFormData } from 'app/store/slices/activity/types'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { Activity } from 'app/views'
import { activityApi } from 'app/store/slices/activity/api'
import { useNavigate, useParams } from 'react-router-dom'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useAppSelector } from 'app/hooks'
import { selectActivity } from 'app/store/slices/activity'
import { API_STATUS } from 'app/constants/api_statuses'

const ActivityItem = () => {
  const navigate = useNavigate()
  const params = useParams()

  const { status, data: activity } = useAppSelector(selectActivity)

  const activityWithParamsId = useMemo(() => ({
    ...(params.id === activity?.id ? activity : null),
    id: params.id,
  }), [ activity, params.id, status ])

  const { lang } = useIntlContext()
  const [
    get,
    {
      data: dataOfGet,
      isLoading: isLoading_get,
      isFetching: isFetching_get,
      error: errorGet,
    },
  ] = activityApi.useLazyGetQuery()
  const [
    update,
    {
      data: dataOfUpdate,
      isLoading: isLoading_update,
      error: errorUpdate,
    },
  ] = activityApi.useUpdateMutation()
  const [
    deleteActivity,
    {
      isLoading: isLoading_delete,
      error: errorDelete,
    },
  ] = activityApi.useDeleteMutation()

  const handleSubmit = (values: IActivityFormData) => update({ activity: values })

  const handleDelete = async id => deleteActivity({ id }).then((res) => {
    if (!('error' in res)) navigate('/activities', { replace: true })
    return res
  })

  useEffect(() => {
    if (!activity && status !== API_STATUS.LOADED && status !== API_STATUS.LOADING) get({ id: params.id })
  }, [ activity, status ])

  let error: string | undefined
  if (errorGet ) {
    error = 'error' in errorGet
      ? errorGet.error
      : (errorGet as CustomBaseQueryError)?.data?.error?.message?.text?.[lang || 'eng']
  } else if (errorUpdate) {
    error = 'error' in errorUpdate
      ? errorUpdate.error
      : (errorUpdate as CustomBaseQueryError)?.data?.error?.message?.text?.[lang || 'eng']
  } else if (errorDelete) {
    error = 'error' in errorDelete
      ? errorDelete.error
      : (errorDelete as CustomBaseQueryError)?.data?.error?.message?.text?.[lang || 'eng']
  }

  return (
    <Activity
      isEdit
      isError={!!error}
      errorCode={(errorGet as CustomBaseQueryError)?.data?.error?.code}
      errorAppCode={(errorGet as CustomBaseQueryError)?.data?.error?.appCode}
      initialValues={dataOfUpdate?.data ?? dataOfGet?.data ?? activityWithParamsId}
      isFetching={isLoading_get || isFetching_get || isLoading_update || isLoading_delete}
      onSubmit={handleSubmit}
      error={error}
      deleteActivity={handleDelete}
    />
  )
}

export default ActivityItem
