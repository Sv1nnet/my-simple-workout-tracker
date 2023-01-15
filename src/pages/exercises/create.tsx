import type { NextPage } from 'next'
import React, { FC, useContext, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { ExerciseTemplate } from 'layouts/main'
import { Exercise } from 'app/views'
import { useRouter } from 'next/router'
import { exerciseApi } from 'store/slices/exercise/api'
import { IExercise } from '@/src/app/views/exercises/components/exercise/Exercise'
import { CustomBaseQueryError } from '@/src/app/store/utils/baseQueryWithReauth'
import { ExerciseForm } from '@/src/app/store/slices/exercise/types'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'

interface ICreatePage {
  setExercise: React.Dispatch<React.SetStateAction<IExercise>>
}

const CreateExercise: NextPage<ICreatePage> & { Layout: FC, layoutProps?: {} } = () => {
  const [ create, { data, isLoading, isError, error } ] = exerciseApi.useCreateMutation()
  const { lang } = useContext(IntlContext)
  const router = useRouter()

  const handleSubmit = (values: ExerciseForm) => create({ exercise: values })

  useEffect(() => {
    if (!isError && data) router.push('/exercises')
  }, [ isLoading ])

  return (
    <Exercise
      initialValues={data?.data}
      isFetching={isLoading || (!!data && !isError)}
      isError={isError}
      onSubmit={handleSubmit}
      error={(error as CustomBaseQueryError)?.data?.error?.message?.text?.[lang || 'eng']}
    />
  )
}

CreateExercise.Layout = ExerciseTemplate
CreateExercise.layoutProps = { tab: 'subRoute' }

export default CreateExercise

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
