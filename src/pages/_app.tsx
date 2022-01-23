import 'antd/dist/antd.css'
import 'src/styles/globals.css'

import { Fragment } from 'react'
import { Provider } from 'react-redux'
import type { AppProps as NextAppProps } from 'next/app'
import store from 'app/store'
import { NextComponentType } from 'next'
import { AuthLayout } from 'layouts/authorization'
import { selectToken, updateToken } from 'app/store/slices/auth'
import RouterContextProvider from 'app/contexts/router/RouterContextProvider'

type ComponentWithLayout = NextComponentType & {
  Layout?: NextComponentType
}

type AppProps = NextAppProps & {
  Component: ComponentWithLayout
}

export default function App({ Component, pageProps }: AppProps) {
  const Layout = Component.Layout || Fragment
  const layoutExists = Layout !== Fragment

  if (pageProps.token && pageProps.token !== selectToken(store.getState())) {
    store.dispatch(updateToken(pageProps.token))
  }

  return (
    <Provider store={store}>
      <RouterContextProvider>
        <AuthLayout>
          <Layout {...(layoutExists ? pageProps : {})}>
            <Component {...(layoutExists ? {} : pageProps)} />
          </Layout>
        </AuthLayout>
      </RouterContextProvider>
    </Provider>
  )
}
