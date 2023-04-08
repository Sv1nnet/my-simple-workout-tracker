import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Tabs } from 'antd'
import { useRouter } from 'next/router'
import { useRouterContext } from 'app/contexts/router/RouterContextProvider'
import TabLabel from '../tab_label/TabLabel'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useAppSelector } from '@/src/app/hooks'
import { selectAllLists } from '@/src/app/store/utils/commonSelectors'
import { API_STATUS } from '@/src/app/constants/api_statuses'
import { useListContext } from '@/src/app/contexts/list/ListContextProvider'

const { TabPane } = Tabs

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-top: 0;
    margin-bottom: 0;
  }

  .ant-tabs-nav-list {
    width: 100%;

    .ant-tabs-tab {
      width: 100%;
      height: 59px;
      padding: 0;
      box-sizing: border-box;
      flex-shrink: 1;
      justify-content: center;

      .ant-tabs-tab-btn {
        width: 100%;
        height: 100%;
      }
    }

    .ant-tabs-ink-bar.ant-tabs-ink-bar-animated {
      top: 0;
      bottom: initial;
    }
  }
`

export type TabRoutes = 'exercises' | 'workouts' | 'activities'

interface INavTemplate {
  activeTab: TabRoutes
}

const NavTemplate: FC<INavTemplate> = ({ activeTab = 'workouts' }) => {
  const router = useRouter()
  const { intl } = useIntlContext()
  const { loading, loadingRoute } = useRouterContext()
  const { exerciseList, workoutList, activityList } = useAppSelector(selectAllLists)
  const [ width, setWidth ] = useState(() => typeof window !== 'undefined' && window.innerWidth < 375 ? 'sm' : 'md')
  const { listEl } = useListContext()

  const getLoadingTab = ({ activeTab: _activeTab, loading: _loading, loadingRoute: _loadingRoute, exerciseList: _exerciseList, workoutList: _workoutList, activityList: _activityList }) => {
    if (_loading && _loadingRoute) {
      switch (_loadingRoute) {
        case '/exercises':
          return 'exercises'
        case '/workouts':
          return 'workouts'
        case '/activities':
          return 'activities'
        default:
          return null
      }
    }

    if (_exerciseList.status === API_STATUS.LOADING || _workoutList.status === API_STATUS.LOADING || _activityList.status === API_STATUS.LOADING) {
      return _activeTab
    }

    return null
  }

  const [ loadingTab, setLoadingTab ] = useState(() => getLoadingTab({ activeTab, loading, loadingRoute, exerciseList, workoutList, activityList }))

  const handleNavClick = (tab: string) => {
    if ((activeTab === tab && listEl?.scrollTop === 0) || activeTab !== tab || !new RegExp(`^/${tab}/{0,1}$`).test(router.pathname)) {
      router.push(`/${tab}`, undefined, {})
    } else {
      listEl?.scrollTo({ left: 0, top: 0 })
    }
  }

  useEffect(() => {
    const handleResize = () => window.innerWidth < 375 ? setWidth('sm') : setWidth('md')
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isScreenSmall = width === 'sm'
  const labels = {
    exercises: ((isScreenSmall ? intl.header.exercises.short : (intl.header.exercises)) || '').toUpperCase(),
    workouts: ((isScreenSmall ? intl.header.workouts.short : (intl.header.workouts)) || '').toUpperCase(),
    activities: ((isScreenSmall ? intl.header.activities.short : (intl.header.activities)) || '').toUpperCase(),
  }

  useEffect(() => {
    setLoadingTab(getLoadingTab({ activeTab, loading, loadingRoute, exerciseList, workoutList, activityList }))
  }, [ loading, loadingRoute, exerciseList.status, workoutList.status, activityList.status, activeTab ])

  const [ ,, subRoute ] = router.route.split('/')

  return (
    <StyledTabs tabBarGutter={0} size="large" activeKey={!subRoute ? activeTab : ''} tabPosition="bottom" centered>
      <TabPane
        tab={(
          <TabLabel
            id="exercises-tab-pane"
            tab="exercises"
            onClick={handleNavClick}
            label={labels.exercises}
            loading={loadingTab === 'exercises'}
          />
        )}
        key="exercises"
      />
      <TabPane
        tab={(
          <TabLabel
            id="workouts-tab-pane"
            tab="workouts"
            onClick={handleNavClick}
            label={labels.workouts}
            loading={loadingTab === 'workouts'}
          />
        )}
        key="workouts"
      />
      <TabPane
        tab={(
          <TabLabel
            id="activities-tab-pane"
            tab="activities"
            onClick={handleNavClick}
            label={labels.activities}
            loading={loadingTab === 'activities'}
          />
        )}
        key="activities"
      />
    </StyledTabs>
  )
}

export default NavTemplate
