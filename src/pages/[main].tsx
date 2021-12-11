import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'
import styled from 'styled-components'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { Header } from 'layouts/header'
import { Tabs } from 'antd'
import { TabRoutes } from 'layouts/nav/template/NavTemplate'

const { TabPane } = Tabs

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    height: 0;
    margin: 0;
  }
`

const routes = [
  '',
  'activities',
  'workouts',
  'exercises',
]

const Main: NextPage & { Layout: FC } = () => {
  const router = useRouter()
  const activeTab = (router.query.main as TabRoutes) || 'activities'

  useEffect(() => {
    if (router.pathname === '' || router.pathname === '/') {
      router.replace('/activities')
      return
    }
    if (!routes.includes(typeof router.query?.main === 'string' ? router.query.main : '/404')) {
      router.replace('/404')
    }
  }, [])

  return (
    <div>
      <Head>
        <title>My Simple Workout Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StyledTabs activeKey={activeTab}>
        <TabPane key="exercises">
          <h2>Exercises</h2>
        </TabPane>
        <TabPane key="workouts">
          <h2>Workouts</h2>
        </TabPane>
        <TabPane key="activities">
          <h2>Activities</h2>
        </TabPane>
      </StyledTabs>
    </div>
  )
}

Main.Layout = Header

export default Main

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
