import { useEffect } from 'react'
import { Exercise } from 'app/views'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exerciseApi } from 'store/slices/exercise/api'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { ExerciseForm } from 'app/store/slices/exercise/types'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { selectExercise } from 'app/store/slices/exercise'
import { useAppSelector } from 'app/hooks'

const CreateExercise = () => {
  const [ create, { data, isLoading, isError, error: serverError } ] = exerciseApi.useCreateMutation()
  const { lang, intl } = useIntlContext()
  const [ searchParams ] = useSearchParams()
  const navigate = useNavigate()
  
  const isCopy = !!+(searchParams.get('copy') || 0)
  const initialValues = useAppSelector(selectExercise)

  const handleSubmit = (values: ExerciseForm) => create({ exercise: values })

  useEffect(() => {
    if (!isError && data) navigate('/exercises')
  }, [ isLoading ])

  let error = (serverError as CustomBaseQueryError)?.data?.error?.message?.text?.[lang || 'eng']

  if (!error) {
    error = (serverError as { originalStatus?: number })?.originalStatus === 413
      ? intl.pages.exercises.notifications.error.max_image_size
      : null
  }

  return (
    <Exercise
      initialValues={data?.data || (isCopy ? initialValues?.data : null)}
      isFetching={isLoading || (!!data && !isError)}
      isError={isError}
      onSubmit={handleSubmit}
      error={error}
    />
  )
}

export default CreateExercise
