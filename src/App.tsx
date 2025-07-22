import 'styles/globals.css'
import 'components/time_picker/style.scss'
import 'components/date_picker/style.scss'

import { App as CapacitorApp } from '@capacitor/app'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/ru'
import { useEffect, useMemo } from 'react'
import { Provider } from 'react-redux'
import getStore from 'app/store'
import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Lang, Unit } from 'app/store/slices/config/types'
import RootRouter from './router'
import { useAppDispatch, useLocalStorage } from './app/hooks'

import './styles/theme.less'
import './styles/theme-overrides.scss'
import { applyTheme, useSystemTheme } from 'utils/theme'
import { changeLang, changeUnits } from 'app/store/slices/config'
import { UserConfig } from './plugins'
import { useThemeContext } from 'app/contexts/theme/ThemeContextProvider'
import RootProvider from 'app/contexts/root'

dayjs.extend(duration)
dayjs.extend(isoWeek)
dayjs.extend(utc)
dayjs.extend(timezone)

interface AppProps {
  lang: Lang
}

CapacitorApp.addListener('backButton', ({ canGoBack }) => {
  if (!canGoBack) {
    CapacitorApp.exitApp()
  } else {
    window.history.back()
  }
})

export const ThemeSwitcher = () => {
  const dispatch = useAppDispatch()
  const { theme: currentTheme, changeTheme } = useThemeContext()
  const { getUserConfig, setUserConfig } = UserConfig

  useSystemTheme(currentTheme)

  useEffect(() => {
    getUserConfig().then(({ theme, lang, units }) => {
      changeTheme(theme)
      dispatch(changeLang(lang))
      dispatch(changeUnits(units))
    })
  }, [])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }}>
      <button onClick={() => {
        applyTheme('dark')
        changeTheme('dark')
        setUserConfig({ theme: 'dark' })
      }}>
        Dark
      </button>
      <button onClick={() => {
        applyTheme('light')
        changeTheme('light')
        setUserConfig({ theme: 'light' })
      }}>
        Light
      </button>
      <button onClick={() => {
        applyTheme('system')
        changeTheme('system')
        setUserConfig({ theme: 'system' })
      }}>
        System
      </button>
    </div>
  )
}

export default function App({ lang }: AppProps) {
  const [ isNoAuthLogin ] = useLocalStorage('isNoAuthLogin', false)
  const [ units ] = useLocalStorage<Unit>('units', 'kg')

  const store = useMemo(() => getStore({ lang, isNoAuthLogin, units }), [ lang, isNoAuthLogin, units ])

  return (
    <Provider store={store}>
      <RootProvider>
        <ThemeSwitcher />
        <RootRouter />
      </RootProvider>
    </Provider>
  )
}
