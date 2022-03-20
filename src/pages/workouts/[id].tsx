import type { NextPage } from 'next'
import { FC, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from '@/src/layouts/main'

const EditWorkouts: NextPage & { Layout: FC, layoutProps?: {} } = () => {
  useEffect(() => {
    console.log('exercise mounted')
  }, [])

  return (
    <h2>Edit Exercise</h2>
  )
}

EditWorkouts.Layout = MainTemplate
EditWorkouts.layoutProps = { tab: 'workouts' }

export default EditWorkouts

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
