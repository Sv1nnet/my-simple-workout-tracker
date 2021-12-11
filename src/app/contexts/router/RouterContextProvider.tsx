import { useState, createContext, FC, useEffect, useRef } from 'react'
import Router from 'next/router'

export const RouterContext = createContext({ loading: false, loadingRoute: null })

const RouterContextProvider: FC = ({ children }) => {
  const [ loading, setLoading ] = useState(false)
  const [ loadingRoute, setLoadingRoute ] = useState<null | string>(null)
  const loadingRouteRef = useRef<null | string>(loadingRoute)
  
  useEffect(() => {
    Router.events.on('routeChangeStart', (e) => {
      setLoading(true)
      setLoadingRoute(e)
      loadingRouteRef.current = e
    })
    Router.events.on('routeChangeComplete', (e) => {
      setLoading(false)
      if (loadingRouteRef.current === e) {
        setLoadingRoute(null)
      }
    })
    Router.events.on('routeChangeError', (e) => {
      setLoading(false)
      if (loadingRouteRef.current === e) {
        setLoadingRoute(null)
      }
    })
  }, [])

  return <RouterContext.Provider value={{ loading, loadingRoute }}>{children}</RouterContext.Provider>
}

export default RouterContextProvider
