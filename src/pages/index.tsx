import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import Activities from './activities'

export default Activities

export const getServerSideProps = (_ctx) => {
  if (typeof window !== 'undefined') return { props: {} }

  const { req } = _ctx
  if (!req) return {}

  return withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
    if (ctx.req.session) {
      return {
        redirect: {
          permanent: false,
          destination: '/activities',
        },
        props: {
          token: ctx.req.session.token,
        },
      }
    }
    return ({ props: {} })
  })(_ctx)
}