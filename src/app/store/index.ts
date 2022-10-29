import { combineReducers, configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { authApi } from './slices/auth/api'
import { profileApi } from './slices/profile/api'
import { exerciseApi } from './slices/exercise/api'
import { activityApi } from './slices/activity/api'
import auth from './slices/auth'
import profile from './slices/profile'
import exercise from './slices/exercise'
import workout from './slices/workout'
import activity from './slices/activity'
import config, { changeLang } from './slices/config'
import { workoutApi } from './slices/workout/api'
import { configApi } from './slices/config/api'

const rootReducer = combineReducers({
  auth,
  profile,
  exercise,
  workout,
  activity,
  config,
  [activityApi.reducerPath]: activityApi.reducer,
  [exerciseApi.reducerPath]: exerciseApi.reducer,
  [workoutApi.reducerPath]: workoutApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [configApi.reducerPath]: configApi.reducer,
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

export default ({ lang }) => {
  if (store.getState().config.data.lang !== lang) store.dispatch(changeLang(lang))
  return store
}
