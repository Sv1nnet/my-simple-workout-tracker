import { useEffect } from 'react'
import { IActivityFormData } from 'app/store/slices/activity/types'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { Activity } from 'app/views'
import { activityApi } from 'app/store/slices/activity/api'
import { useNavigate, useParams } from 'react-router-dom'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

const ActivityItem = () => {
  const navigate = useNavigate()
  const params = useParams()

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
    get({ id: params.id })
  }, [])

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
      initialValues={dataOfUpdate?.data ?? dataOfGet?.data}
      isFetching={isLoading_get || isFetching_get || isLoading_update || isLoading_delete}
      onSubmit={handleSubmit}
      error={error}
      deleteActivity={handleDelete}
    />
  )
}

export default ActivityItem
