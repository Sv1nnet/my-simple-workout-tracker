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
import { Lang, Theme, Unit } from 'app/store/slices/config/types'
import RootRouter from './router'
import { useAppDispatch, useLocalStorage } from './app/hooks'

import './styles/theme.less'
import { applyTheme } from 'utils/theme'
import { changeLang, changeTheme, changeUnits } from 'app/store/slices/config'
import { UserConfig } from './plugins'

dayjs.extend(duration)
dayjs.extend(isoWeek)
dayjs.extend(utc)
dayjs.extend(timezone)

type AppProps = {
  lang: Lang,
}


CapacitorApp.addListener('backButton', ({ canGoBack }) => {
  if (!canGoBack) {
    CapacitorApp.exitApp()
  } else {
    window.history.back()
  }
})

const ThemeSwitcher = () => {
  const dispatch = useAppDispatch()
  const { getUserConfig, setUserConfig } = UserConfig

  useEffect(() => {
    getUserConfig().then(({ theme, lang, units }) => {
      dispatch(changeTheme(theme))
      dispatch(changeLang(lang))
      dispatch(changeUnits(units))
    })
  }, [])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }}>
      <button onClick={() => {
        applyTheme('dark')
        dispatch(changeTheme('dark'))
        setUserConfig({ theme: 'dark' })
      }}>
        Dark
      </button>
      <button onClick={() => {
        applyTheme('light')
        dispatch(changeTheme('light'))
        setUserConfig({ theme: 'light' })
      }}>
        Light
      </button>
      <button onClick={() => {
        applyTheme('system')
        dispatch(changeTheme('system'))
        setUserConfig({ theme: 'system' })
      }}>
        System
      </button>
    </div>
  )
}

export default function App({ lang }: AppProps) {
  const [ isNoAuthLogin ] = useLocalStorage('isNoAuthLogin', false)
  const [ theme ] = useLocalStorage<Theme>('theme', 'light')
  const [ units ] = useLocalStorage<Unit>('units', 'kg')

  const store = useMemo(() => getStore({ lang, isNoAuthLogin, theme, units }), [ lang, isNoAuthLogin, theme, units ])

  return (
    <>
      <Provider store={store}>
        <ThemeSwitcher />
        <RootRouter />
      </Provider>
    </>
  )
}
