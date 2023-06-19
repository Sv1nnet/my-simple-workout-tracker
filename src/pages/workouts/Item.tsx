import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { workoutApi } from 'app/store/slices/workout/api'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { Workout } from 'app/views'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { API_STATUS } from 'app/constants/api_statuses'
import { useAppSelector } from 'app/hooks'
import { selectWorkout } from 'app/store/slices/workout'

const WorkoutItem = () => {
  const { status, data: workout } = useAppSelector(selectWorkout)
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
  ] = workoutApi.useLazyGetQuery()
  const [
    update,
    {
      data: dataOfUpdate,
      isLoading: isLoading_update,
      error: errorUpdate,
    },
  ] = workoutApi.useUpdateMutation()
  const [
    deleteWorkout,
    {
      isLoading: isLoading_delete,
      error: errorDelete,
    },
  ] = workoutApi.useDeleteMutation()

  const [ fetchList ] = workoutApi.useLazyListQuery()

  const handleSubmit = values => update({ workout: values })
    .then((res) => {
      fetchList()
      return res
    })
  
  const handleDelete = async id => deleteWorkout({ id }).then((res) => {
    if (!('error' in res)) navigate('/workouts', { replace: true })
    return res
  })

  useEffect(() => {
    if (!workout && status !== API_STATUS.LOADED && status !== API_STATUS.LOADING) get({ id: params.id })
  }, [ workout, status ])

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
    <Workout
      isEdit
      isError={!!error}
      errorCode={(errorGet as CustomBaseQueryError)?.data?.error?.code}
      errorAppCode={(errorGet as CustomBaseQueryError)?.data?.error?.appCode}
      initialValues={dataOfUpdate?.data ?? dataOfGet?.data ?? workout}
      isFetching={isLoading_get || isFetching_get || isLoading_update || isLoading_delete}
      onSubmit={handleSubmit}
      error={error}
      deleteWorkout={handleDelete}
    />
  )
}

export default WorkoutItem
