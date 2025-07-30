import { PropsWithChildren } from 'react'
import IntlContextProvider from 'app/contexts/intl/IntContextProvider'
import AppLoaderProvider from 'app/contexts/loader/AppLoaderContextProvider'
import { ErrorBoundary } from 'app/components'
import ListContextProvider from 'app/contexts/list/ListContextProvider'
import HeaderTitleProvider from '../header_title/HeaderTItleContextProvider'
import ThemeContextProvider from '../theme/ThemeContextProvider'
import InitialDataLoader from 'layouts/initial_data_loader/DataLoader'

const RootProvider = ({ children }: PropsWithChildren) => (
  <IntlContextProvider>
    <ErrorBoundary>
      <ThemeContextProvider>
        <ListContextProvider>
          <AppLoaderProvider>
            <HeaderTitleProvider>
              <InitialDataLoader>
                {children}
              </InitialDataLoader>
            </HeaderTitleProvider>
          </AppLoaderProvider>
        </ListContextProvider>
      </ThemeContextProvider>
    </ErrorBoundary>
  </IntlContextProvider>
)

export default RootProvider
