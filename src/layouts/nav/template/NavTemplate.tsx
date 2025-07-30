import { FC, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Tabs } from 'antd'
import Icon from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router'
import TabLabel from '../tab_label/TabLabel'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useAppSelector } from 'app/hooks'
import { selectAllLists } from 'app/store/utils/commonSelectors'
import { API_STATUS } from 'app/constants/api_statuses'
import { useListContext } from 'app/contexts/list/ListContextProvider'
import { selectIsNoAuthLogin } from 'app/store/slices/auth'
import useReduxSetPageInfo from './utils/useReduxSetPageInfo'
import { ActivityIcon, DumbbellAndListIcon, DumbbellIcon } from 'src/assets/icons'

const StyledTabs = styled(Tabs)`
  background: var(--background-color);

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

      .anticon {
        margin-right: 0;
      }

      &:nth-last-child(2) {
        display: none;
      }
    }

    .ant-tabs-tab-active svg * {
      stroke: var(--primary-color-light);
    }
  }
`

const StyledDumbbellIcon = styled(DumbbellIcon)`
  width: 1.25em;
  height: 1.25em;

  path {
    stroke-width: 2.5px;
  }
`

export type TabRoutes = 'exercises' | 'workouts' | 'activities'

interface INavTemplate {
  activeTab: TabRoutes
}

const getFormInfo = (activeTab: TabRoutes, pathname: string) => {
  const isFormOpen = (activeTab === 'activities' || activeTab === 'workouts' || activeTab === 'exercises') && !new RegExp(`^/${activeTab}/{0,1}$`).test(pathname)
  const isEditType = new RegExp(`^/${activeTab}/edit/{0,1}$`).test(pathname)
  const isAddType = new RegExp(`^/${activeTab}/create/{0,1}$`).test(pathname)

  return {
    isFormOpen,
    isEditType,
    isAddType,
  }
}

const NavTemplate: FC<INavTemplate> = ({ activeTab = 'activities' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { intl } = useIntlContext()
  const { exerciseList, workoutList, activityList } = useAppSelector(selectAllLists)
  const isNoAuthLogin = useAppSelector(selectIsNoAuthLogin)
  const [ width, setWidth ] = useState(() => window.innerWidth < 375 ? 'sm' : 'md')
  const { listEl } = useListContext()
  const pageInfo = useMemo(() => ({
    activeTab,
    formInfo: getFormInfo(activeTab, location.pathname),
  }), [ activeTab, location.pathname ])

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

  useReduxSetPageInfo(pageInfo)

  const isScreenSmall = width === 'sm'
  const labels = {
    exercises: (isScreenSmall ? intl.header.exercises.short : (intl.header.exercises)) || '',
    workouts: (isScreenSmall ? intl.header.workouts.short : (intl.header.workouts)) || '',
    activities: (isScreenSmall ? intl.header.activities.short : (intl.header.activities)) || '',
    profile: (isScreenSmall ? intl.header.profile.short : (intl.header.profile)) || '',
    settings: intl.header.settings || '',
  }

  const items = useMemo(() => 
    [
      {
        key:'exercises',
        label:(
          <TabLabel
            id="exercises-tab-pane"
            tab="exercises"
            onClick={handleNavClick}
            label={<Icon component={StyledDumbbellIcon} title={labels.exercises} />}
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
            label={<Icon component={DumbbellAndListIcon} title={labels.workouts} />}
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
            label={<Icon component={ActivityIcon} title={labels.activities} />}
            loading={!isNoAuthLogin && loadingTab === 'activities'}
          />
        ),
      },
      {
        key: 'subRoute',
        label: undefined,
      },
    ],
  [
    loadingTab,
    location.pathname,
    listEl,
    labels.exercises,
    labels.workouts,
    labels.activities,
    labels.profile,
    labels.settings,
  ])

  useEffect(() => {
    const handleResize = () => window.innerWidth < 375 ? setWidth('sm') : setWidth('md')
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setLoadingTab(getLoadingTab({ activeTab, exerciseList, workoutList, activityList }))
  }, [ exerciseList.status, workoutList.status, activityList.status, activeTab ])

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
