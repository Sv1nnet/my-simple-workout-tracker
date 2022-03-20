import type { GetServerSideProps, GetServerSidePropsContext, PreviewData } from 'next'
import routes from 'constants/end_points'
import { ParsedUrlQuery } from 'querystring'
import { IncomingMessage } from 'http'
import { NextApiRequestCookies } from 'next/dist/server/api-utils'
import { RefreshError, RefreshSuccess, Token } from 'store/slices/auth/types'

export interface GetServerSidePropsContextWithSession extends GetServerSidePropsContext<ParsedUrlQuery, PreviewData> {
  req: IncomingMessage & {
    cookies: NextApiRequestCookies
    session: {
      token: Token
    }
  };
}
type RefreshTokenResult = { body: RefreshSuccess | RefreshError | null, cookies?: string[], error?: any }
const refreshToken = async (token): Promise<RefreshTokenResult> => {
  let refreshRes
  try {
    const _headers = new Headers({
      'Content-Type': 'application/json',
      cookie: `refresh_token=${token}`,
    })
    const res = await fetch(
      routes.auth.v1.refresh.full,
      {
        headers: _headers,
      },
    )

    const body = await res.json()
    const { headers } = res
    const cookies = headers.get('set-cookie')

    if (cookies) {
      refreshRes = {
        body,
        cookies,
      } 
    } else {
      refreshRes = { body }
    }
  } catch (error) {
    refreshRes = {
      body: null,
      error,
    }
  }

  return refreshRes
}

const handleRefreshResult = (ctx, refreshRes) => {
  if (refreshRes.cookies && refreshRes?.body?.data?.token) {
    let [ refresh_token, access_token ] = refreshRes.cookies.split('HttpOnly')
    access_token = access_token.substring(2)

    ctx.res.setHeader('Set-Cookie', [ refresh_token, access_token ])
    ctx.req.session = { token: refreshRes.body.data.token }
    return true
  }

  ctx.res.removeHeader('set-cookie')
  ctx.req.session.token = null
  return false
}

export type GetServerSidePropsWithAuth = GetServerSideProps & { shouldRefresh?: boolean } & { props?: object }
export type WithAuthCb = (ctx: GetServerSidePropsContextWithSession) => Promise<{ props: any, shouldRefresh?: boolean } | any>

const withAuth = (cb: WithAuthCb): GetServerSidePropsWithAuth => async (ctx: GetServerSidePropsContextWithSession) => {
  try {
    let refreshRes = null

    if (!ctx.req?.cookies?.logout && !ctx.req?.cookies?.access_token && ctx.req.cookies.refresh_token) {
      refreshRes = await refreshToken(ctx.req?.cookies?.refresh_token)

      handleRefreshResult(ctx, refreshRes)
    } else if (!ctx.req?.cookies?.logout && ctx.req.cookies.refresh_token) {
      ctx.req.session = { token: ctx.req.cookies.access_token ?? null }
    }

    if (ctx?.req?.session?.token) {
      let cbRes = await cb(ctx)
      if ('shouldRefresh' in cbRes && cbRes.shouldRefresh) {
        refreshRes = await refreshToken(ctx.req?.cookies?.refresh_token)
        const isRefreshSuccessful = handleRefreshResult(ctx, refreshRes)
        if (isRefreshSuccessful) {
          cbRes = await cb(ctx)
          return {
            ...cbRes,
            props: {
              token: ctx.req.session.token,
              ...(cbRes.props || {}),
            },
          }
        }
      } else if ('shouldRefresh' in cbRes && !cbRes.shouldRefresh) {
        return { props: {} }
      } else {
        return {
          ...cbRes,
          props: {
            token: ctx.req.session.token,
            ...(cbRes.props || {}),
          },
        }
      }
    }
    ctx.res.removeHeader('set-cookie')
    return { props: {} }
  } catch (error) {
    console.log('withAuth error', error)
    return { props: {} }
  }
} 

export default withAuth
