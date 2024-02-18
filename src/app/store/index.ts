import { combineReducers, configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { authApi } from './slices/auth/api'
import { profileApi } from './slices/profile/api'
import { exerciseApi } from './slices/exercise/api'
import { activityApi } from './slices/activity/api'
import auth, { loginWithNoAuth } from './slices/auth'
import profile from './slices/profile'
import exercise, { exerciseHandlers } from './slices/exercise'
import workout, { workoutHandlers } from './slices/workout'
import activity, { activityHandlers } from './slices/activity'
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
      activityApi.middleware,
      profileApi.middleware,
      exerciseApi.middleware,
      workoutApi.middleware,
      configApi.middleware,
    ),
  })
}

export const store = makeStore()

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
ReturnType,
AppState,
unknown,
Action<string>
>

export const handlers = {
  exercise: exerciseHandlers.default,
  workout: workoutHandlers.default,
  activity: activityHandlers.default,
}

export default ({ lang, isNoAuthLogin }: { lang: AppState['config']['data']['lang'], isNoAuthLogin: AppState['auth']['isNoAuthLogin'] }) => {
  if (store.getState().config.data.lang !== lang) store.dispatch(changeLang(lang))
  if (store.getState().auth.isNoAuthLogin !== isNoAuthLogin) store.dispatch(loginWithNoAuth())
  return store
}
