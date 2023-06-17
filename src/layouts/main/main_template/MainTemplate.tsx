import { FC, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { PageLayoutWithNav, PageLayout } from 'layouts/header'
import { ROUTES } from 'src/router'
import { TabRoutes } from 'layouts/nav/template/NavTemplate'

const routes = [
  '',
  'profile',
  'activities',
  'workouts',
  'exercises',
]

const MainTemplate: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [ , route ] = location.pathname.split('/') as [any, typeof routes[number], string]

  useEffect(() => {
    if (location.pathname === '' || location.pathname === '/') {
      navigate(ROUTES.ACTIVITIES, { replace: true })
      return
    }
    if (!routes.find(_route => _route === route || _route === '/404')) {
      navigate(ROUTES.NOT_FOUND, { replace: true })
    }
  })

  return route === 'profile' 
    ? (
      <PageLayout>
        <Outlet />
      </PageLayout>
    )
    : (
      <PageLayoutWithNav route={route as TabRoutes}>
        <Outlet />
      </PageLayoutWithNav>
    )
}

export default MainTemplate
