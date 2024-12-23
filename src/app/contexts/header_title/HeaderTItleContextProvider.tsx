import { createContext, useState, useContext, useMemo, useLayoutEffect } from 'react'

export type HeaderTitleContextType = {
  title: React.ReactNode
  setTitle: (title: React.ReactNode) => void
}

const initialContextValue = { title: '', setTitle: () => {} }

const HeaderTitleContext = createContext<HeaderTitleContextType>(initialContextValue)

const HeaderTitleProvider = ({ children }: { children: React.ReactNode }) => {
  const [ title, setTitle ] = useState<HeaderTitleContextType['title']>('')

  const value = useMemo(() => ({
    title,
    setTitle,
  }), [ title ])

  return (
    <HeaderTitleContext.Provider value={value}>
      {children}
    </HeaderTitleContext.Provider>
  )
}

export const useHeaderTitleContext = () => {
  const context = useContext(HeaderTitleContext)
  if (!context) {
    console.warn('useHeaderTitleContext must be used within a HeaderTitleProvider')
    return initialContextValue
  }
  return context
}

export const PageHeaderTitle = ({ children }: { children: React.ReactNode }) => {
  const { setTitle } = useHeaderTitleContext()

  useLayoutEffect(() => {
    setTitle(children)
    return () => setTitle(undefined)
  }, [ children ])

  return null
}

export default HeaderTitleProvider
