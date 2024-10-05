import { PropsWithChildren } from 'react'
import IntlContextProvider from 'app/contexts/intl/IntContextProvider'
import AppLoaderProvider from 'app/contexts/loader/AppLoaderContextProvider'
import { ErrorBoundary } from 'app/components'
import ListContextProvider from 'app/contexts/list/ListContextProvider'
import HeaderTitleProvider from '../header_title/HeaderTItleContextProvider'

const RootProvider = ({ children }: PropsWithChildren) => (
  <IntlContextProvider>
    <ErrorBoundary>
      <ListContextProvider>
        <AppLoaderProvider>
          <HeaderTitleProvider>
            {children}
          </HeaderTitleProvider>
        </AppLoaderProvider>
      </ListContextProvider>
    </ErrorBoundary>
  </IntlContextProvider>
)

export default RootProvider
