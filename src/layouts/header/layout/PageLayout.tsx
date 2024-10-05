import { FC, ReactNode, useLayoutEffect, useState } from 'react'
import styled from 'styled-components'
import { PageHeader } from 'antd'
import { useLocation } from 'react-router'
import { theme } from 'styles/vars'
import { NavTemplate } from 'layouts/nav'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { TabRoutes } from 'layouts/nav/template/NavTemplate'
import Content from '../content/Content'
import { useSearchParams } from 'react-router-dom'
import { PageHeaderTitle, useHeaderTitleContext } from 'app/contexts/header_title/HeaderTItleContextProvider'

const ContentContainer = styled.div<{ $height?: string }>`
  height: calc(${({ $height }) => `${$height || '100vh'}`} - 57px - 74px);
  overflow-y: scroll;
  position: relative;
`

const StyledPageHeader = styled(PageHeader)`
  background-color: ${theme.primaryColor};
  .ant-page-header-heading-extra {
    display: flex;
    align-items: center;
    margin: 0;
  }
  .ant-page-header-heading {
    justify-content: center;
    .ant-page-header-back {
      position: absolute;
      left: 15px;
    }
  }
  .ant-page-header-heading-title {
    color: white;
    margin-right: 0;
    position: relative;
    z-index: 2;
  }
  .anticon.anticon-arrow-left > svg {
    transform: scale(1.5);
    fill: white;
  }
`


const Header = ({ children }) => {
  const { title } = useHeaderTitleContext()

  return (
    <>
      <StyledPageHeader
        title={title || <span>&nbsp;</span>}
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
    <Header>
      <PageHeaderTitle>{intl.header[_title]}</PageHeaderTitle>
      {children}
    </Header>
  )
}

export const PageLayoutWithNav: FC<{ route: TabRoutes, children?: ReactNode }> = ({ route, children }) => {
  const { intl } = useIntlContext()
  const [ height, setHeight ] = useState('100vh')
  const location = useLocation()
  const _title = route ?? ((location.pathname) || 'activities').replace('/', '') as TabRoutes


  useLayoutEffect(() => {
    const setTabsHeight = () => {
      setHeight(`${document.body.offsetHeight}px`)
    }

    setTabsHeight()

    window.addEventListener('resize', setTabsHeight)

    return () => window.removeEventListener('resize', setTabsHeight)
  }, [])

  return (
    <Header>
      <PageHeaderTitle>{intl.header[_title]}</PageHeaderTitle>
      <ContentContainer $height={height}>
        {children}
      </ContentContainer>
      <NavTemplate activeTab={_title} />
    </Header>
  )
}
