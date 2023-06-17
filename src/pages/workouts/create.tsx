import { useEffect } from 'react'
import { workoutApi } from 'app/store/slices/workout/api'
import { WorkoutForm } from 'app/store/slices/workout/types'
import { Workout } from 'app/views'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useNavigate } from 'react-router-dom'

const CreateWorkout = () => {
  const [ create, { data, isLoading, isError, error } ] = workoutApi.useCreateMutation()
  const { lang } = useIntlContext()
  const navigate = useNavigate()

  const handleSubmit = (values: WorkoutForm) => create({ workout: values })

  useEffect(() => {
    if (!isError && data) navigate('/workouts')
  }, [ isLoading ])

  return (
    <Workout
      initialValues={data?.data}
      isFetching={isLoading || (!!data && !isError)}
      isError={isError}
      onSubmit={handleSubmit}
      error={(error as CustomBaseQueryError)?.data?.error?.message?.text?.[lang || 'eng']}
    />
  )
}

export default CreateWorkout
