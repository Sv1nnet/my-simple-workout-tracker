import { FC, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Tabs } from 'antd'
import { useLocation, useNavigate } from 'react-router'
import TabLabel from '../tab_label/TabLabel'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useAppSelector } from 'app/hooks'
import { selectAllLists } from 'app/store/utils/commonSelectors'
import { API_STATUS } from 'app/constants/api_statuses'
import { useListContext } from 'app/contexts/list/ListContextProvider'
import { selectIsNoAuthLogin } from 'app/store/slices/auth'

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-top: 0;
    margin-bottom: 0;
  }

  .ant-tabs-tabpane {
    height: 0;
    overflow-y: scroll;
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

      &:nth-child(4) {
        display: none;
      }
    }
  }
`

export type TabRoutes = 'exercises' | 'workouts' | 'activities'

interface INavTemplate {
  activeTab: TabRoutes
}

const NavTemplate: FC<INavTemplate> = ({ activeTab = 'workouts' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { intl } = useIntlContext()
  const { exerciseList, workoutList, activityList } = useAppSelector(selectAllLists)
  const isNoAuthLogin = useAppSelector(selectIsNoAuthLogin)
  const [ width, setWidth ] = useState(() => window.innerWidth < 375 ? 'sm' : 'md')
  const { listEl } = useListContext()

  const getLoadingTab = ({ activeTab: _activeTab,  exerciseList: _exerciseList, workoutList: _workoutList, activityList: _activityList }) => {

    if (_exerciseList.status === API_STATUS.LOADING || _workoutList.status === API_STATUS.LOADING || _activityList.status === API_STATUS.LOADING) {
      return _activeTab
    }

    return null
  }

  const [ loadingTab, setLoadingTab ] = useState(() => getLoadingTab({ activeTab, exerciseList, workoutList, activityList }))

  const handleNavClick = (tab: string) => {
    if ((activeTab === tab && listEl?.scrollTop === 0) || activeTab !== tab || !new RegExp(`^/${tab}/{0,1}$`).test(location.pathname)) {
      navigate(`/${tab}`)
      return
    } 

    if (listEl?.scrollTop !== 0) {
      listEl?.scrollTo({ left: 0, top: 0 })
      return
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
    setLoadingTab(getLoadingTab({ activeTab, exerciseList, workoutList, activityList }))
  }, [ exerciseList.status, workoutList.status, activityList.status, activeTab ])

  const items = useMemo(() => 
    [
      {
        key:'exercises',
        label:(
          <TabLabel
            id="exercises-tab-pane"
            tab="exercises"
            onClick={handleNavClick}
            label={labels.exercises}
            loading={!isNoAuthLogin && loadingTab === 'exercises'}
          />
        ),
      },
      {
        key:'workouts',
        label:(
          <TabLabel
            id="workouts-tab-pane"
            tab="workouts"
            onClick={handleNavClick}
            label={labels.workouts}
            loading={!isNoAuthLogin && loadingTab === 'workouts'}
          />
        ),
      },
      {
        key:'activities',
        label:(
          <TabLabel
            id="activities-tab-pane"
            tab="activities"
            onClick={handleNavClick}
            label={labels.activities}
            loading={!isNoAuthLogin && loadingTab === 'activities'}
          />
        ),
      },
      {
        key: 'subRoute',
        label: undefined,
      },
    ]
  , [
    loadingTab,
    location.pathname,
    listEl,
    labels.exercises,
    labels.workouts,
    labels.activities,
  ])

  const [ , route, subRoute ] = location.pathname.split('/')
  const activeKey = !subRoute ? route : 'subRoute'

  return (
    <StyledTabs
      tabBarGutter={0}
      animated={false}
      size="large"
      activeKey={activeKey}
      tabPosition="bottom"
      centered
      items={items}
      destroyInactiveTabPane
    />
  )
}

export default NavTemplate
