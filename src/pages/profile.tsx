import { HeaderWithoutNav } from 'layouts/header'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'

const Profile = () => {
  return <h2>Profile page</h2>
}

Profile.Layout = HeaderWithoutNav

export default Profile

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
