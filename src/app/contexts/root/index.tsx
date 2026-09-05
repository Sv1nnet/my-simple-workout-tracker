import { PropsWithChildren } from 'react'
import IntlContextProvider from 'app/contexts/intl/IntContextProvider'
import AppLoaderProvider from 'app/contexts/loader/AppLoaderContextProvider'
import { ErrorBoundary } from 'app/components'
import ListContextProvider from 'app/contexts/list/ListContextProvider'
import HeaderTitleProvider from 'app/contexts/header_title/HeaderTItleContextProvider'
import ThemeContextProvider from 'app/contexts/theme/ThemeContextProvider'
import InitialDataLoader from 'layouts/initial_data_loader/DataLoader'
import ActivityInProgressContextProvider from 'app/contexts/activity/ActivityInProgressContextProvider'

const RootProvider = ({ children }: PropsWithChildren) => (
  <IntlContextProvider>
    <ErrorBoundary>
      <ThemeContextProvider>
        <ListContextProvider>
          <AppLoaderProvider>
            <HeaderTitleProvider>
              <InitialDataLoader>
                <ActivityInProgressContextProvider>
                  {children}
                </ActivityInProgressContextProvider>
              </InitialDataLoader>
            </HeaderTitleProvider>
          </AppLoaderProvider>
        </ListContextProvider>
      </ThemeContextProvider>
    </ErrorBoundary>
  </IntlContextProvider>
)

export default RootProvider
