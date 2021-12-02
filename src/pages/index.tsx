import type { NextPage } from 'next'
import Head from 'next/head'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'

const IndexPage: NextPage = () => (
  <div>
    <Head>
      <title>Redux Toolkit</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <h2>Index page</h2>
  </div>
)

export default IndexPage

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
