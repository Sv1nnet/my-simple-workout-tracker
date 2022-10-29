import type { NextPage } from 'next'
import { FC, useContext, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { ExerciseTemplate } from 'layouts/main'
import { Exercise } from 'app/views'
import { exerciseApi } from '@/src/app/store/slices/exercise/api'
import { useRouter } from 'next/router'
import routes from 'constants/end_points'
import handleJwtStatus from '@/src/app/utils/handleJwtStatus'
import { GetExerciseError, GetExerciseSuccess, IExerciseFormData } from '@/src/app/store/slices/exercise/types'
import { CustomBaseQueryError } from '@/src/app/store/utils/baseQueryWithReauth'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'

interface IExercisePage {
  exercise: IExerciseFormData;
  error: string;
}

const EditExercise: NextPage<IExercisePage> & { Layout: FC, layoutProps?: {} } = ({ exercise, error: serverError }) => {
  const router = useRouter()
  const { lang } = useContext(IntlContext)
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

  const handleSubmit = (values: IExerciseFormData) => update({ exercise: values })

  const handleDelete = async id => deleteExercise({ id }).then((res) => {
    if (!('error' in res)) router.replace('/exercises')
    return res
  })

  useEffect(() => {
    if (!exercise) get({ id: router.query.id as string })
  }, [])

  let error
  if (errorGet ) {
    error = 'error' in errorGet
      ? errorGet.error
      : (errorGet as CustomBaseQueryError)?.data?.error?.message?.text[lang || 'eng']
  } else if (errorUpdate) {
    error = 'error' in errorUpdate
      ? errorUpdate.error
      : (errorUpdate as CustomBaseQueryError)?.data?.error?.message?.text[lang || 'eng']
  } else if (errorDelete) {
    error = 'error' in errorDelete
      ? errorDelete.error
      : (errorDelete as CustomBaseQueryError)?.data?.error?.message?.text[lang || 'eng']
  }

  return (
    <Exercise
      isEdit
      isError={!!error}
      errorCode={(errorGet as CustomBaseQueryError)?.data?.error?.code}
      errorAppCode={(errorGet as CustomBaseQueryError)?.data?.error?.appCode}
      initialValues={dataOfUpdate?.data ?? dataOfGet?.data ?? exercise}
      isFetching={isLoading_get || isFetching_get || isLoading_update || isLoading_delete}
      onSubmit={handleSubmit}
      error={error || serverError}
      deleteExercise={handleDelete}
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
