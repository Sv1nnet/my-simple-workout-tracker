import { useState, createContext, FC, useEffect, useRef, useContext } from 'react'
import Router from 'next/router'

const initialContextValue = { loading: false, loadingRoute: null }

export interface IRouterContextValue {
  loading: boolean;
  loadingRoute: string | null;
}

export const RouterContext = createContext<IRouterContextValue>(initialContextValue)

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

export const useRouterContext = (): IRouterContextValue => {
  const context = useContext(RouterContext)

  if (!context) {
    console.warn('RouterContext is not provided')
    return initialContextValue
  }

  return context
}
