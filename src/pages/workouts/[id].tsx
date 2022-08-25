import type { NextPage } from 'next'
import { FC, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { WorkoutTemplate } from 'layouts/main'
import { useRouter } from 'next/router'
import { workoutApi } from 'app/store/slices/workout/api'
import { GetWorkoutError, GetWorkoutSuccess, WorkoutServerPayload } from 'app/store/slices/workout/types'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { Workout } from 'app/views'
import routes from 'app/constants/end_points'
import handleJwtStatus from 'app/utils/handleJwtStatus'

interface IWorkoutPage {
  workout: WorkoutServerPayload;
  error: string;
}

const EditWorkouts: NextPage<IWorkoutPage> & { Layout: FC, layoutProps?: {} } = ({ workout, error: serverError }) => {
  const router = useRouter()
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

  const handleSubmit = values => update({ workout: values })
  
  const handleDelete = async id => deleteWorkout({ id }).then((res) => {
    if (!('error' in res)) router.replace('/workouts')
    return res
  })

  useEffect(() => {
    if (!workout) get({ id: router.query.id as string })
  }, [])

  let error
  if (errorGet ) {
    error = 'error' in errorGet
      ? errorGet.error
      : (errorGet as CustomBaseQueryError)?.data?.error?.message?.text
  } else if (errorUpdate) {
    error = 'error' in errorUpdate
      ? errorUpdate.error
      : (errorUpdate as CustomBaseQueryError)?.data?.error?.message?.text
  } else if (errorDelete) {
    error = 'error' in errorDelete
      ? errorDelete.error
      : (errorDelete as CustomBaseQueryError)?.data?.error?.message?.text
  }

  return (
    <Workout
      isEdit
      initialValues={dataOfUpdate?.data ?? dataOfGet?.data ?? workout}
      isFetching={isLoading_get || isFetching_get || isLoading_update || isLoading_delete}
      onSubmit={handleSubmit}
      error={error || serverError}
      deleteWorkout={handleDelete}
    />
  )
}

EditWorkouts.Layout = WorkoutTemplate
EditWorkouts.layoutProps = { tab: 'workouts' }

export default EditWorkouts

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    const [ ,,id ] = ctx.resolvedUrl.split('/')
    try {
      let res: GetWorkoutSuccess | GetWorkoutError = await fetch(`${routes.workout.v1.base.full}/${id}`, {
        headers: {
          Authorization: `Bearer ${ctx.req.session.token}`,
        },
      }).then(r => r.json())
  
      return handleJwtStatus(res, () => ({
        props: {
          workout: res.data,
        },
      }))
    } catch (error) {
      return {
        props: {
          workout: null,
          error: error.errno.includes('ECONNREFUSED') ? 'Connection error' : 'Something has gone wrong. Please try again.',
        },
      }
    }
  }
  return { props: {} }
})
