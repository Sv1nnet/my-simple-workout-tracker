import React, { FC, ReactElement, useEffect, useLayoutEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { Header } from 'layouts/header'
import { Tabs } from 'antd'
import { TabRoutes } from 'layouts/nav/template/NavTemplate'
import hasWindow from '@/src/app/utils/hasWindow'

const { TabPane } = Tabs

const StyledTabs = styled(Tabs)`
  .ant-tabs-content {
    position: relative;
  }
  .ant-tabs-nav {
    height: 0;
    margin: 0;
  }
  .ant-tabs-tabpane {
    height: calc(${({ $height }) => `${$height || '100vh'}`} - 57px - 74px);
    overflow-y: scroll;
  }
`

const routes = [
  '',
  'activities',
  'workouts',
  'exercises',
]

const MainTemplate: FC<{ tab: string, children: ReactElement }> & { Layout: FC } = ({ tab, children, ...props }) => {
  const [ height, setHeight ] = useState('100vh')
  const router = useRouter()
  const [ , route, subRoute ] = router.route.split('/') as [any, TabRoutes, string]

  useEffect(() => {
    if (router.pathname === '' || router.pathname === '/') {
      router.replace('/activities')
      return
    }
    if (!routes.find(_route => _route === route || _route === '/404')) {
      router.replace('/404')
    }
  })

  const activeKey = !subRoute ? tab : 'subRoute'

  const getTabComponent = shouldRender => shouldRender ? React.cloneElement(children, { ...children.props, ...props }) : null

  useLayoutEffect(() => {
    if (hasWindow()) {
      const setTabsHeight = () => {
        setHeight(`${document.body.offsetHeight}px`)
      }

      setTabsHeight()

      window.addEventListener('resize', setTabsHeight)

      return () => window.removeEventListener('resize', setTabsHeight)
    }
  }, [])

  return (
    <>
      <Head>
        <title>My Simple Workout Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header route={route}>
        <StyledTabs activeKey={activeKey} $height={height}>
          <TabPane key="exercises">
            {getTabComponent(activeKey === 'exercises')}
          </TabPane>
          <TabPane key="workouts">
            {getTabComponent(activeKey === 'workouts')}
          </TabPane>
          <TabPane key="activities">
            {getTabComponent(activeKey === 'activities')}
          </TabPane>
          <TabPane key="subRoute">
            {getTabComponent(activeKey === 'subRoute')}
          </TabPane>
        </StyledTabs>
      </Header>
    </>
  )
}

MainTemplate.Layout = Header

export default MainTemplate

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    return {
      props: {
        token: ctx.req.session.token,
      },
    }
  }
  return ({ props: {} })
})
