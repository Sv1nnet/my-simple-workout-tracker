import { combineReducers, configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { authApi } from './slices/auth/api'
import { profileApi } from './slices/profile/api'
import { exerciseApi } from './slices/exercise/api'
import auth from './slices/auth'
import profile from './slices/profile'
import config from './slices/config'

const rootReducer = combineReducers({
  auth,
  profile,
  [exerciseApi.reducerPath]: exerciseApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  config,
})

export function makeStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(
      authApi.middleware,
      profileApi.middleware,
      exerciseApi.middleware,
    ),
  })
}

const store = makeStore()

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
ReturnType,
AppState,
unknown,
Action<string>
>

export default store
