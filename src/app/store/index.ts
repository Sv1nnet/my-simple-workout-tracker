import { combineReducers, configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { authApi } from './slices/auth/api'
import auth from './slices/auth'
import config from './slices/config'

const rootReducer = combineReducers({
  auth,
  [authApi.reducerPath]: authApi.reducer,
  config,
})

export function makeStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(authApi.middleware),
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
