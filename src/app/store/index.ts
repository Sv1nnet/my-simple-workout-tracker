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
import settingsSlice, { changeLang, changeTheme, changeUnits } from './slices/settings'
import configSlice from './slices/config'
import { workoutApi } from './slices/workout/api'
import { configApi } from './slices/config/api'
import { settingsApi } from './slices/settings/api'

const rootReducer = combineReducers({
  auth: authSlice,
  profile,
  exercise,
  workout,
  activity,
  muscleGroup,
  config: configSlice,
  settings: settingsSlice,
  [activityApi.reducerPath]: activityApi.reducer,
  [exerciseApi.reducerPath]: exerciseApi.reducer,
  [workoutApi.reducerPath]: workoutApi.reducer,
  [muscleGroupApi.reducerPath]: muscleGroupApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [configApi.reducerPath]: configApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
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
      settingsApi.middleware,
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
  lang: AppState['settings']['data']['lang'],
  isNoAuthLogin: AppState['auth']['isNoAuthLogin'],
  units: AppState['settings']['data']['units'],
  theme: AppState['settings']['data']['theme'],
}>) => {
  const { auth, settings } = store.getState()

  if (lang && settings.data.lang !== lang) store.dispatch(changeLang(lang))
  if (auth.isNoAuthLogin !== isNoAuthLogin) store.dispatch(loginWithNoAuth())
  if (theme && settings.data.theme !== theme) store.dispatch(changeTheme(theme))
  if (units && settings.data.units !== units) store.dispatch(changeUnits(units))

  return store
}
