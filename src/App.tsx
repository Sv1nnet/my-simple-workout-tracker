import 'styles/globals.css'
import 'components/time_picker/style.scss'
import 'components/date_picker/style.scss'

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
import { Lang } from 'app/store/slices/config/types'
import RootRouter from './router'
import { useLocalStorage } from './app/hooks'
import './styles/theme.less'

dayjs.extend(duration)
dayjs.extend(isoWeek)
dayjs.extend(utc)
dayjs.extend(timezone)

type AppProps = {
  lang: Lang,
}

export default function App({ lang }: AppProps) {
  const [ isNoAuthLogin ] = useLocalStorage('isNoAuthLogin', false)
  const store = useMemo(() => getStore({ lang, isNoAuthLogin }), [])

  return (
    <Provider store={store}>
      <RootRouter />
    </Provider>
  )
}
