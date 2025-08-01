import { useEffect } from 'react'
import { workoutApi } from 'app/store/slices/workout/api'
import { WorkoutForm } from 'app/store/slices/workout/types'
import { Workout } from 'app/views'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from 'app/hooks'
import { selectWorkout } from 'app/store/slices/workout'

const CreateWorkout = () => {
  const [ create, { data, isLoading, isError, error } ] = workoutApi.useCreateMutation()
  const { lang } = useIntlContext()
  const [ searchParams ] = useSearchParams()
  const navigate = useNavigate()

  const isCopy = !!+(searchParams.get('copy') || 0)
  const initialValues = useAppSelector(selectWorkout)

  const handleSubmit = (values: WorkoutForm) => create({ workout: values })

  useEffect(() => {
    if (!isError && data) navigate('/workouts')
  }, [ isLoading ])

  return (
    <Workout
      initialValues={data?.data || (isCopy ? initialValues?.data : null)}
      isFetching={isLoading || (!!data && !isError)}
      isError={isError}
      onSubmit={handleSubmit}
      error={(error as CustomBaseQueryError)?.data?.error?.message?.text?.[lang || 'eng']}
    />
  )
}

export default CreateWorkout
