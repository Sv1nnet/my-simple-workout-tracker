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

/**
 * @description PageHeaderTitle is a component that sets the title of the page.
 * @param children - The title of the page.
 * @param isPersist - If true, the title will not be reset when the component is unmounted.
 */
export type PageHeaderTitleProps = {
  children: React.ReactNode
  isPersist?: boolean
}

export const PageHeaderTitle = ({ children, isPersist = false }: PageHeaderTitleProps) => {
  const { setTitle } = useHeaderTitleContext()

  useLayoutEffect(() => {
    setTitle(children)
    return () => !isPersist && setTitle(undefined)
  }, [ children, isPersist ])

  return null
}

export default HeaderTitleProvider
