import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import Activities from './activities'
import hasWindow from 'app/utils/hasWindow'

export default Activities

export const getServerSideProps = (_ctx) => {
  if (hasWindow()) return { props: {} }

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