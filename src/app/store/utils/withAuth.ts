import type { GetServerSideProps, GetServerSidePropsContext, PreviewData } from 'next'
import routes from 'constants/end_points'
import { ParsedUrlQuery } from 'querystring'
import { IncomingMessage } from 'http'
import { NextApiRequestCookies } from 'next/dist/server/api-utils'
import { Token } from 'store/slices/auth/types'

export interface GetServerSidePropsContextWithSession extends GetServerSidePropsContext<ParsedUrlQuery, PreviewData> {
  req: IncomingMessage & {
    cookies: NextApiRequestCookies
    session: {
      token: Token
    }
  }
}

const withAuth = (cb: GetServerSideProps): GetServerSideProps => async (ctx: GetServerSidePropsContextWithSession) => {
  try {
    if (!ctx.req?.cookies?.logout && !ctx.req?.cookies?.access_token) {
      const res = await fetch(
        routes.auth.v1.refresh.full,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            cookie: `refresh_token=${ctx.req.cookies.refresh_token}`,
          },
        },
      )
        .then(_res => _res.json())
        .catch((err) => console.log('catch err', err))

      if (res.data.token) {
        ctx.req.session = { token: res.data.token }
      }
    } else if (!ctx.req?.cookies?.logout) {
      ctx.req.session = { token: ctx.req?.cookies?.access_token }
    }
  } catch (error) {
    console.log('withAuth error', error)
  } finally {
    return cb(ctx)
  }
} 

export default withAuth
