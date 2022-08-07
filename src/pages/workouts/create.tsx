import type { NextPage } from 'next'
import { FC, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { WorkoutTemplate } from 'layouts/main'
import { IWorkout } from 'app/views/workouts/components/workout/Workout'
import { workoutApi } from 'app/store/slices/workout/api'
import { WorkoutForm } from 'app/store/slices/workout/types'
import { useRouter } from 'next/router'
import { Workout } from 'app/views'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'

interface ICreatePage {
  setWorkout: React.Dispatch<React.SetStateAction<IWorkout>>
}

const CreateWorkout: NextPage<ICreatePage> & { Layout: FC, layoutProps?: {} } = () => {
  const [ create, { data, isLoading, isError, error } ] = workoutApi.useCreateMutation()
  const router = useRouter()

  const handleSubmit = (values: WorkoutForm) => create({ workout: values })

  useEffect(() => {
    if (!isError && data) router.push('/workouts')
  }, [ isLoading ])

  return (
    <Workout
      initialValues={data?.data}
      isFetching={isLoading || (!!data && !isError)}
      onSubmit={handleSubmit}
      error={(error as CustomBaseQueryError)?.data?.error?.message?.text}
    />
  )
}

CreateWorkout.Layout = WorkoutTemplate
CreateWorkout.layoutProps = { tab: 'workout' }

export default CreateWorkout

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    return {
      props: {
        token: ctx.req.session.token,
      },
    }
  }
  return ({ props: {} })
})
