import 'styles/globals.css'
import 'components/time_picker/style.scss'
import 'components/date_picker/style.scss'

import { App as CapacitorApp } from '@capacitor/app'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/ru'
import { useMemo } from 'react'
import { Provider } from 'react-redux'
import getStore from 'app/store'
import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import RootRouter from './router'
import { useLocalStorage } from './app/hooks'

import './styles/theme.less'
import './styles/theme-overrides.scss'
import RootProvider from 'app/contexts/root'

dayjs.extend(duration)
dayjs.extend(isoWeek)
dayjs.extend(utc)
dayjs.extend(timezone)

CapacitorApp.addListener('backButton', ({ canGoBack }) => {
  if (!canGoBack) {
    CapacitorApp.exitApp()
  } else {
    window.history.back()
  }
})

export default function App() {
  const [ isNoAuthLogin ] = useLocalStorage('isNoAuthLogin', false)

  const store = useMemo(() => getStore({ isNoAuthLogin }), [ isNoAuthLogin ])

  return (
    <Provider store={store}>
      <RootProvider>
        <RootRouter />
      </RootProvider>
    </Provider>
  )
}
