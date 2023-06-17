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
import { Lang } from 'app/store/slices/config/types'
import RootRouter from './router'

import './styles/theme.less'

dayjs.extend(duration)
dayjs.extend(isoWeek)

type AppProps = {
  lang: Lang,
}

export default function App({ lang }: AppProps) {
  const store = useMemo(() => getStore({ lang }), [])

  return (
    <Provider store={store}>
      <RootRouter />
    </Provider>
  )
}
