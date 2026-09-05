import { FC, ReactNode } from 'react'
import { useLocation } from 'react-router'
import { NavTemplate } from 'layouts/nav'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { TabRoutes } from 'layouts/nav/template/NavTemplate'
import Content from '../content/Content'
import { useSearchParams } from 'react-router-dom'
import { useHeaderTitleContext } from 'app/contexts/header_title/HeaderTItleContextProvider'
import { Header } from './components'
import { StyledPageHeader, ContentContainer } from './components/styled'


const WithHeader = ({ children, title: propTitle }) => {
  const { title } = useHeaderTitleContext()

  return  (
    <>
      <StyledPageHeader
        title={<Header title={title || propTitle} />}
        ghost={false}
        extra={<Content />}
      />
      {children}
    </>
  )
}

export const PageLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const { intl } = useIntlContext()
  const [ searchParams ] = useSearchParams()
  const location = useLocation()

  const queryEntries = searchParams ? Object.entries(searchParams) : null
  const queryEntry = queryEntries && queryEntries.length > 0 ? queryEntries[queryEntries.length - 1][1] : null
  let _title = (queryEntry ?? location.pathname) as string || 'activities'
  if (_title.startsWith('/')) _title = _title.substring(1)

  return (
    <WithHeader title={intl.header[_title]}>
      {children}
    </WithHeader>
  )
}

const NAV_TABS: TabRoutes[] = [ 'exercises', 'workouts', 'activities' ]

export const PageLayoutWithNav: FC<{ route: TabRoutes, children?: ReactNode }> = ({ route, children }) => {
  const { intl } = useIntlContext()
  const location = useLocation()
  const pathTab = route || ((location.pathname) || 'activities').replace('/', '') as TabRoutes
  const _title = NAV_TABS.includes(pathTab) ? pathTab : 'activities'

  return (
    <WithHeader title={intl.header[_title]}>
      <ContentContainer>
        {children}
      </ContentContainer>
      <NavTemplate activeTab={_title} />
    </WithHeader>
  )
}
