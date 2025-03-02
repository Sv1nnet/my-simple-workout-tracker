import { useEffect } from 'react'
import { Exercise } from 'app/views'
import { useNavigate } from 'react-router-dom'
import { exerciseApi } from 'store/slices/exercise/api'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { ExerciseForm } from 'app/store/slices/exercise/types'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

const CreateExercise = () => {
  const [ create, { data, isLoading, isError, error: serverError } ] = exerciseApi.useCreateMutation()
  const { lang, intl } = useIntlContext()
  const navigate = useNavigate()

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
      initialValues={data?.data}
      isFetching={isLoading || (!!data && !isError)}
      isError={isError}
      onSubmit={handleSubmit}
      error={error}
    />
  )
}

export default CreateExercise
