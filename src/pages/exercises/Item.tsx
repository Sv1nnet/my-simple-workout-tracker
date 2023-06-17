import { useEffect } from 'react'
import { Exercise } from 'app/views'
import { useNavigate, useParams } from 'react-router-dom'
import { exerciseApi } from 'app/store/slices/exercise/api'
import { IExerciseFormData } from 'app/store/slices/exercise/types'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

const ExerciseItem = () => {
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
  ] = exerciseApi.useLazyGetQuery()
  const [
    update,
    {
      data: dataOfUpdate,
      isLoading: isLoading_update,
      error: errorUpdate,
    },
  ] = exerciseApi.useUpdateMutation()
  const [
    deleteExercise,
    {
      isLoading: isLoading_delete,
      error: errorDelete,
    },
  ] = exerciseApi.useDeleteMutation()

  const [ fetchList ] = exerciseApi.useLazyListQuery()

  const handleSubmit = (values: IExerciseFormData) => update({ exercise: values })
    .then((res) => {
      fetchList()
      return res
    })

  const handleDelete = async id => deleteExercise({ id }).then((res) => {
    if (!('error' in res)) navigate('/exercises', { replace: true })
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
    <Exercise
      isEdit
      isError={!!error}
      errorCode={(errorGet as CustomBaseQueryError)?.data?.error?.code}
      errorAppCode={(errorGet as CustomBaseQueryError)?.data?.error?.appCode}
      initialValues={dataOfUpdate?.data ?? dataOfGet?.data}
      isFetching={isLoading_get || isFetching_get || isLoading_update || isLoading_delete}
      onSubmit={handleSubmit}
      error={error}
      deleteExercise={handleDelete}
    />
  )
}

export default ExerciseItem
