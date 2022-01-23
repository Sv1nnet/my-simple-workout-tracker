import { createAsyncThunk } from '@reduxjs/toolkit'
import routes from 'constants/end_points'
import { LogoutSuccess } from './types'

export const logout = createAsyncThunk<
// Return type of the payload creator
LogoutSuccess
>(
  'logout',
  async (_, thunkApi) => {
    try {
      const res = await fetch(routes.auth.v1.logout.full).then(r => r.json())
      return res
    } catch (error) {
      return thunkApi.rejectWithValue(error.res)
    }
  },
)
