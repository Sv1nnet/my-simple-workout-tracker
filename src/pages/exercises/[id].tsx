import type { NextPage } from 'next'
import { FC, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { ExerciseTemplate } from 'layouts/main'
import { Exercise } from 'app/components'
import { exerciseApi } from '@/src/app/store/slices/exercise/api'
import { useRouter } from 'next/router'
import routes from 'constants/end_points'
import handleJwtStatus from '@/src/app/utils/handleJwtStatus'
import { GetExerciseError, GetExerciseSuccess, IExerciseFormData } from '@/src/app/store/slices/exercise/types'
import { CustomBaseQueryError } from '@/src/app/store/utils/baseQueryWithReauth'

interface IExercisePage {
  exercise: IExerciseFormData;
  error: string;
}

const EditExercise: NextPage<IExercisePage> & { Layout: FC, layoutProps?: {} } = ({ exercise, error: serverError }) => {
  const router = useRouter()
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

  const handleSubmit = (values: IExerciseFormData) => update({ exercise: values })

  useEffect(() => {
    if (!exercise) get({ id: router.query.id as string })
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
  }

  return (
    <Exercise
      isEdit
      initialValues={dataOfGet?.data ?? exercise ?? dataOfUpdate?.data}
      isFetching={isLoading_get || isFetching_get || isLoading_update}
      onSubmit={handleSubmit}
      error={error || serverError}
    />
  )
}

EditExercise.Layout = ExerciseTemplate
EditExercise.layoutProps = { tab: 'exercises' }

export default EditExercise

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    const [ ,,id ] = ctx.resolvedUrl.split('/')
    try {
      let res: GetExerciseSuccess | GetExerciseError = await fetch(`${routes.exercise.v1.base.full}/${id}`, {
        headers: {
          Authorization: `Bearer ${ctx.req.session.token}`,
        },
      }).then(r => r.json())
  
      return handleJwtStatus(res, () => ({
        props: {
          exercise: res.data,
        },
      }))
    } catch (error) {
      return {
        props: {
          exercise: null,
          error: error.errno.includes('ECONNREFUSED') ? 'Connection error' : 'Something has gone wrong. Please try again.',
        },
      }
    }
  }
  return { props: {} }
})
