import 'antd/dist/antd.css'
import 'src/styles/globals.css'
import 'components/time_picker/style.scss'
import 'components/date_picker/style.scss'

import getConfig from 'next/config'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/ru'
import Head from 'next/head'
import { Fragment, useMemo } from 'react'
import { Provider } from 'react-redux'
import type { AppProps as NextAppProps } from 'next/app'
import getStore from 'app/store'
import { NextComponentType } from 'next'
import { AuthLayout } from 'layouts/authorization'
import { selectToken, updateToken } from 'app/store/slices/auth'
import RouterContextProvider from 'app/contexts/router/RouterContextProvider'
import IntlContextProvider from 'app/contexts/intl/IntContextProvider'
import AppLoaderProvider from 'app/contexts/loader/AppLoaderContextProvider'
import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'
import { Lang } from 'app/store/slices/config/types'

dayjs.extend(duration)
dayjs.extend(isoWeek)

type ComponentWithLayout = NextComponentType & {
  Layout?: NextComponentType
  layoutProps?: object
  componentProps?: object
}

type AppProps = NextAppProps & {
  Component: ComponentWithLayout,
  pageProps: any,
  lang: Lang,
}

export default function App({ Component, pageProps, lang }: AppProps) {
  const store = useMemo(() => getStore({ lang }), [])
  const Layout = Component.Layout || Fragment
  const layoutExists = Layout !== Fragment
  const { componentProps = {}, layoutProps = {} } = Component

  if (pageProps.token && pageProps.token !== selectToken(store.getState())) {
    store.dispatch(updateToken(pageProps.token))
  }

  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
      </Head>
      <Provider store={store}>
        <IntlContextProvider>
          <AppLoaderProvider>
            <RouterContextProvider>
              <AuthLayout>
                <Layout {...(layoutExists ? pageProps : {})} {...layoutProps}>
                  <Component {...(layoutExists ? {} : pageProps)} {...componentProps} />
                </Layout>
              </AuthLayout>
            </RouterContextProvider>
          </AppLoaderProvider>
        </IntlContextProvider>
      </Provider>
    </>
  )
}

App.getInitialProps = async ({ ctx: { req } }) => {
  const langRegex = /lang=[a-zA-Z]+/
  const [ , lang ] = (langRegex.exec(req.headers.cookie)?.[0] || 'lang=eng').split('=')

  return { lang }
}
