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

export type CustomBaseQueryError = FetchBaseQueryError & { data: IResponse<null, any> } | SerializedError & { data: IResponse<null, any> }

const getBaseQueryWithReauth = (() => {
  let refreshRequest = null

  return (creds = true): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError | SerializedError | CustomBaseQueryError
  > => async (args, api, extraOptions) => {
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
