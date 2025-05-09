import { FC, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { PageLayoutWithNav, PageLayout } from 'layouts/header'
import { BASE_ROUTES } from 'src/router'
import { TabRoutes } from 'layouts/nav/template/NavTemplate'
import { useLocalStorage, useOnPreviousChange } from 'app/hooks'

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
  const [ , setLastOpenedPage ] = useLocalStorage('lastOpenedPage', location.pathname)
  const [ , route ] = location.pathname.split('/') as [any, typeof routes[number], string]

  useOnPreviousChange(
    (prev, curr) => {
      if (prev[0] !== curr[0]) {
        setLastOpenedPage(curr[0])
      }
    },
    [ location.pathname ],
  )

  useEffect(() => {
    if (location.pathname === '' || location.pathname === '/') {
      navigate(BASE_ROUTES.ACTIVITIES, { replace: true })
      return
    }
    if (!routes.find(_route => _route === route || _route === '/404')) {
      navigate(BASE_ROUTES.NOT_FOUND, { replace: true })
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
