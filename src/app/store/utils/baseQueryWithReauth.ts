import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { updateToken, logout } from 'store/slices/auth'
import routes from 'constants/end_points'
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { Token } from 'store/slices/auth/types'
import { IResponse } from '@/src/app/constants/response_types'
import { SerializedError } from '@reduxjs/toolkit'
import { AppState } from '..'

export const baseQuery = fetchBaseQuery({
  baseUrl: routes.base,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as AppState).auth.token
    // If we have a token set in state, let's assume that we should be passing it.
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})
export const baseQueryWithoutCreds = fetchBaseQuery({ baseUrl: routes.base })

export type CustomBaseQueryError = FetchBaseQueryError & { data: IResponse<null, any> } | SerializedError & { data: IResponse<null, any> }

const getBaseQueryWithReauth = (creds = true): BaseQueryFn<
string | FetchArgs,
unknown,
FetchBaseQueryError | SerializedError | CustomBaseQueryError
> => async (args, api, extraOptions) => {
  const query = creds ? baseQuery : baseQueryWithoutCreds
  let result = await query(args, api, extraOptions)
  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshResult = (await baseQuery(routes.auth.v1.refresh.path, api, extraOptions)) as QueryReturnValue<{ data: { token: Token } }>
    if (refreshResult.data) {
      const { token } = refreshResult.data.data
      // store the new token
      api.dispatch(updateToken(refreshResult.data.data.token))
      // retry the initial query
      result = await query(typeof args === 'object' ? { ...args, headers: { ...args.headers, Authorization: `Bearer ${token}` } } : args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }
  return result
}

// const baseQueryWithReauth: BaseQueryFn<
// string | FetchArgs,
// unknown,
// FetchBaseQueryError
// > = async (args, api, extraOptions) => {
//   let result = await baseQuery(args, api, extraOptions)
//   if (result.error && result.error.status === 401) {
//     // try to get a new token
//     const refreshResult = (await baseQuery(routes.auth.v1.refresh.path, api, extraOptions)) as QueryReturnValue<string>
//     if (refreshResult.data) {
//       // store the new token
//       api.dispatch(updateToken(refreshResult.data))
//       // retry the initial query
//       result = await baseQuery(args, api, extraOptions)
//     } else {
//       api.dispatch(authApi.endpoints.logout.useQuery())
//     }
//   }
//   return result
// }

export default getBaseQueryWithReauth
