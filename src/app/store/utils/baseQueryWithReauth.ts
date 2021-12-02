import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { updateToken, logout } from 'store/slices/auth'
import routes from 'constants/end_points'
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'

export const baseQuery = fetchBaseQuery({ baseUrl: routes.base, credentials: 'include' })
const baseQueryWithReauth: BaseQueryFn<
string | FetchArgs,
unknown,
FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshResult = (await baseQuery(routes.auth.v1.refresh.path, api, extraOptions)) as QueryReturnValue<string>
    if (refreshResult.data) {
      // store the new token
      api.dispatch(updateToken(refreshResult.data))
      // retry the initial query
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }
  return result
}

export default baseQueryWithReauth
