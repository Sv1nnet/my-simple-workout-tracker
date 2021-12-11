import type { GetServerSideProps, GetServerSidePropsContext, PreviewData } from 'next'
import routes from 'constants/end_points'
import { ParsedUrlQuery } from 'querystring'
import { IncomingMessage } from 'http'
import { NextApiRequestCookies } from 'next/dist/server/api-utils'
import { Token } from 'store/slices/auth/types'

export interface GetServerSidePropsContextWithSession extends GetServerSidePropsContext<ParsedUrlQuery, PreviewData> {
  req: IncomingMessage & {
    cookies: NextApiRequestCookies
    session: Token
  }
}

const withAuth = (cb: GetServerSideProps): GetServerSideProps => async (ctx: GetServerSidePropsContextWithSession) => {
  try {
    if (!ctx.req.cookies.logout && ctx.req.cookies.refresh_token) {
      const res = await fetch(
        routes.auth.v1.refresh.full,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            cookie: `refresh_token=${ctx.req.cookies.refresh_token}`,
          },
        },
      )
        .then(_res => _res.json())
        .catch(err => console.warn('catch err', err))

      if (res.token) {
        ctx.req.session = { token: res.token }
      }
    }
  } catch (error) {
    console.warn('withAuth error', error)
  } finally {
    return cb(ctx)
  }
} 

export default withAuth
