import { FC, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Tabs } from 'antd'
import { useRouter } from 'next/router'
import { useAppSelector } from 'app/hooks'
import int from 'constants/int.json'
import { RouterContext } from 'app/contexts/router/RouterContextProvider'
import TabLabel from '../tab_label/TabLabel'
import { selectLang } from '@/src/app/store/slices/config'

const { TabPane } = Tabs

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav-list {
    width: 100%;
    .ant-tabs-tab {
      width: 100%;
      box-sizing: border-box;
      flex-shrink: 1;
      justify-content: center;
    }
  }
`

const { exercises, workouts, activities } = int.header

export type TabRoutes = 'exercises' | 'workouts' | 'activities'

interface INavTemplate {
  activeTab: TabRoutes
}

const NavTemplate: FC<INavTemplate> = ({ activeTab = 'workouts' }) => {
  const router = useRouter()
  const lang = useAppSelector(selectLang)
  const { loading, loadingRoute } = useContext(RouterContext)
  const [ width, setWidth ] = useState(() => typeof window !== 'undefined' && window.innerWidth < 375 ? 'sm' : 'md')

  const handleChange = tab => router.push(tab, undefined, { shallow: true })

  useEffect(() => {
    const handleResize = () => window.innerWidth < 375 ? setWidth('sm') : setWidth('md')
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isScreenSmall = width === 'sm'
  const labels = {
    exercises: (isScreenSmall ? exercises.short : exercises)[lang].toUpperCase(),
    workouts: (isScreenSmall ? workouts.short : workouts)[lang].toUpperCase(),
    activities: (isScreenSmall ? activities.short : activities)[lang].toUpperCase(),
  }

  return (
    <StyledTabs tabBarGutter={0} onChange={handleChange} size="large" activeKey={activeTab} centered>
      <TabPane tab={<TabLabel label={labels.exercises} loading={loading && loadingRoute === '/exercises'} />} key="exercises" />
      <TabPane tab={<TabLabel label={labels.workouts} loading={loading && loadingRoute === '/workouts'} />} key="workouts" />
      <TabPane tab={<TabLabel label={labels.activities} loading={loading && loadingRoute === '/activities'} />} key="activities" />
    </StyledTabs>
  )
}

export default NavTemplate
