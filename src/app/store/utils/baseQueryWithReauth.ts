import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { updateToken, logout, selectToken } from 'store/slices/auth'
import routes from 'constants/end_points'
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { Token } from 'store/slices/auth/types'
import { IResponse } from 'app/constants/response_types'
import { SerializedError } from '@reduxjs/toolkit'
import { AppState } from '..'
import { getIsNoAuthLoginFromLocalStorage } from 'app/utils/getIsNoAuthLoginFromLocalStorage'
import handlersLoader from './noAuthHandlers/noAuthHandlers.loader'

export const baseQuery = fetchBaseQuery({
  baseUrl: routes.base,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = selectToken(getState() as AppState)
    // If we have a token set in state, let's assume that we should be passing it.
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})
export const baseQueryWithoutCreds = fetchBaseQuery({
  baseUrl: routes.base,
  prepareHeaders: (headers, { getState }) => {
    const token = selectToken(getState() as AppState)
    // If we have a token set in state, let's assume that we should be passing it.
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const UUID_REGEX = /[a-f0-9]{24}/

export type CustomBaseQueryError = FetchBaseQueryError & { data: IResponse<null, any> } | SerializedError & { data: IResponse<null, any> }

const getBaseQueryWithReauth = (() => {
  let refreshRequest = null

  return (creds = true): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError | SerializedError | CustomBaseQueryError
  > => async (args, api, extraOptions) => {
    if (getIsNoAuthLoginFromLocalStorage()) {
      if (typeof args !== 'string') {
        const url = new URL(args.url)
        const { endpoint: handlerName } = api
        const [ , _api, _v, routeName, rest ] = url.pathname.split('/')

        const handlers = await handlersLoader.get()

        const result = await handlers[routeName][handlerName](
          args,
          url,
          new URLSearchParams(url.searchParams),
          rest,
        )

        return result
      }
    }
    const query = creds ? baseQuery : baseQueryWithoutCreds
    let result = await query(args, api, extraOptions)

    if (result.error && result.error.status === 401) {
      // try to get a new token
      if (!refreshRequest) {
        refreshRequest = (baseQuery(routes.auth.v1.refresh.path, api, extraOptions)) as QueryReturnValue<{ data: { token: Token } }>

        if (refreshRequest instanceof Promise) {
          refreshRequest = refreshRequest.then((res) => {
            refreshRequest = null
            return res
          })
        }
      }
      
      const refreshResult = await refreshRequest
  
      if (refreshResult.data) {
        const { token } = (refreshResult.data?.data || { token: null })
        // store the new token
        api.dispatch(updateToken(token))
        // retry the initial query
        result = await query(typeof args === 'object' ? { ...args, headers: { ...args.headers, Authorization: `Bearer ${token}` } } : args, api, extraOptions)
      } else {
        api.dispatch(logout())
      }
    }
    return result
  }
})()

export default getBaseQueryWithReauth
