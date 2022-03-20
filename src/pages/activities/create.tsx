import type { NextPage } from 'next'
import { FC, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from '@/src/layouts/main'

const CreateActivities: NextPage & { Layout: FC, layoutProps?: {} } = () => {
  useEffect(() => {
    console.log('exercise mounted')
  }, [])

  return (
    <h2>Create Exercise</h2>
  )
}

CreateActivities.Layout = MainTemplate
CreateActivities.layoutProps = { tab: 'activities' }

export default CreateActivities

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
