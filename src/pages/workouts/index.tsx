import type { NextPage } from 'next'
import { FC } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from 'layouts/main'

const Workouts: NextPage<{ props: { tab: string } }> & { Layout: FC } = () => null

Workouts.Layout = MainTemplate

export default Workouts

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
