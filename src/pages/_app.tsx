import '../styles/globals.css'
import 'antd/dist/antd.css'

import { Fragment } from 'react'
import { Provider } from 'react-redux'
import type { AppProps as NextAppProps } from 'next/app'
import Router from 'next/router'
import store from 'app/store'
import { NextComponentType } from 'next'
import { AuthLayout } from 'layouts/authorization'
import { updateToken } from '../app/store/slices/auth'

Router.events.on('routeChangeStart', (e) => {
  console.log('loading route', e)
})
Router.events.on('routeChangeComplete', (e) => {
  console.log('route loaded', e)
})

type ComponentWithLayout = NextComponentType & {
  Layout?: NextComponentType
}

type AppProps = NextAppProps & {
  Component: ComponentWithLayout
}

export default function App({ Component, pageProps }: AppProps) {
  const Layout = Component.Layout || Fragment
  const layoutExists = Layout !== Fragment

  if (pageProps.token) {
    store.dispatch(updateToken(pageProps.token))
  }

  return (
    <Provider store={store}>
      <AuthLayout>
        <Layout {...(layoutExists ? pageProps : {})}>
          <Component {...(layoutExists ? {} : pageProps)} />
        </Layout>
      </AuthLayout>
    </Provider>
  )
}
