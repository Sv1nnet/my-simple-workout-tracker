import { FC, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { PageLayoutWithNav } from 'layouts/header'
import { BASE_ROUTES } from 'src/router'
import { TabRoutes } from 'layouts/nav/template/NavTemplate'
import { useLocalStorage, useMounted, useOnPreviousChange } from 'app/hooks'
import { routes as appRoutes } from 'src/router'

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
  const { isMounted, useHandleMounted } = useMounted()
  const [ lastOpenedPage, setLastOpenedPage ] = useLocalStorage('lastOpenedPage', location.pathname)
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
    if (isMounted()) {
      if (location.pathname === '' || location.pathname === '/') {
        navigate(lastOpenedPage === appRoutes.activities.create() ? lastOpenedPage : BASE_ROUTES.WORKOUTS, { replace: true })
        return
      }
      if (!routes.find(_route => _route === route || _route === '/404')) {
        navigate(BASE_ROUTES.WORKOUTS, { replace: true })
      }
    }
  })

  useEffect(() => {
    if (lastOpenedPage === appRoutes.activities.create()) {
      navigate(lastOpenedPage)
    }
  }, [])

  useHandleMounted()

  return (
    <PageLayoutWithNav route={route as TabRoutes}>
      <Outlet />
    </PageLayoutWithNav>
  )
}

export default MainTemplate
