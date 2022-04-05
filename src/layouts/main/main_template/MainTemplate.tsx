import React, { FC, ReactElement, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { Header } from 'layouts/header'
import { Tabs } from 'antd'
import { TabRoutes } from 'layouts/nav/template/NavTemplate'

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
    height: calc(100vh - 57px - 74px);
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
  return (
    <>
      <Head>
        <title>My Simple Workout Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header route={route}>
        <StyledTabs activeKey={activeKey}>
          <TabPane key="exercises">
            {activeKey === 'exercises' ? React.cloneElement(children, { ...children.props, ...props }) : null}
          </TabPane>
          <TabPane key="workouts">
            {activeKey === 'workouts' ? React.cloneElement(children, { ...children.props, ...props }) : null}
          </TabPane>
          <TabPane key="activities">
            {activeKey === 'activities' ? React.cloneElement(children, { ...children.props, ...props }) : null}
          </TabPane>
          <TabPane key="subRoute">
            {activeKey === 'subRoute' ? React.cloneElement(children, { ...children.props, ...props }) : null}
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
