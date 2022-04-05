import { combineReducers, configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { authApi } from './slices/auth/api'
import { profileApi } from './slices/profile/api'
import { exerciseApi } from './slices/exercise/api'
import auth from './slices/auth'
import profile from './slices/profile'
import exercise from './slices/exercise'
import config from './slices/config'
import { workoutApi } from './slices/workout/api'

const rootReducer = combineReducers({
  auth,
  profile,
  exercise,
  config,
  [exerciseApi.reducerPath]: exerciseApi.reducer,
  [workoutApi.reducerPath]: workoutApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
})

export function makeStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(
      authApi.middleware,
      profileApi.middleware,
      exerciseApi.middleware,
      workoutApi.middleware,
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
