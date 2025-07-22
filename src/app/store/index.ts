import { combineReducers, configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { authApi } from './slices/auth/api'
import { profileApi } from './slices/profile/api'
import { exerciseApi } from './slices/exercise/api'
import { activityApi } from './slices/activity/api'
import { muscleGroupApi } from './slices/muscleGroup/api'
import authSlice, { loginWithNoAuth } from './slices/auth'
import profile from './slices/profile'
import exercise from './slices/exercise'
import workout from './slices/workout'
import activity from './slices/activity'
import muscleGroup from './slices/muscleGroup'
import configSlice, { changeLang, changeTheme, changeUnits } from './slices/config'
import { workoutApi } from './slices/workout/api'
import { configApi } from './slices/config/api'

const rootReducer = combineReducers({
  auth: authSlice,
  profile,
  exercise,
  workout,
  activity,
  muscleGroup,
  config: configSlice,
  [activityApi.reducerPath]: activityApi.reducer,
  [exerciseApi.reducerPath]: exerciseApi.reducer,
  [workoutApi.reducerPath]: workoutApi.reducer,
  [muscleGroupApi.reducerPath]: muscleGroupApi.reducer,
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
      muscleGroupApi.middleware,
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

export default ({ lang, isNoAuthLogin, theme, units }: Partial<{
  lang: AppState['config']['data']['lang'],
  isNoAuthLogin: AppState['auth']['isNoAuthLogin'],
  units: AppState['config']['data']['units'],
  theme: AppState['config']['data']['theme'],
}>) => {
  const { auth, config } = store.getState()

  if (config.data.lang !== lang) store.dispatch(changeLang(lang))
  if (auth.isNoAuthLogin !== isNoAuthLogin) store.dispatch(loginWithNoAuth())
  if (theme && config.data.theme !== theme) store.dispatch(changeTheme(theme))
  if (units && config.data.units !== units) store.dispatch(changeUnits(units))

  return store
}
