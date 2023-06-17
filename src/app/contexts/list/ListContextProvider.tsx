import { useState, createContext, useEffect, useContext, useMemo, PropsWithChildren } from 'react'
import { Ref } from 'components/endless_scrollable_container/EndlessScrollableContainer'

const initialContextValue = { listEl: null, setListEl: () => {} }

export type ListEl = Ref | HTMLElement | null

export interface IListContextValue {
  listEl: ListEl
  setListEl: (listEl: ListEl) => void
}

export const ListContext = createContext<IListContextValue>(initialContextValue)

const ListContextProvider = ({ children }: PropsWithChildren) => {
  const [ listEl, setListEl ] = useState<ListEl>(null)
  const value = useMemo(() => ({ listEl, setListEl }), [ listEl ])

  useEffect(() => () => setListEl(null), [])

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>
}

export default ListContextProvider

export const useListContext = (listEl?: ListEl): IListContextValue => {
  const context = useContext(ListContext)

  if (!context) {
    console.warn('RouterContext is not provided')
    return initialContextValue
  }

  useEffect(() => {
    if (listEl !== undefined) context.setListEl(listEl)
  }, [ listEl ])

  return context
}
