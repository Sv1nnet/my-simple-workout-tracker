import { notification } from 'antd'
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from 'react'
import { useEffect, useRef } from 'react'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

import type { AppDispatch, AppState } from '../store'

export * from './numberInputHooks'

export const useForm = <TContent>(defaultValues: TContent) =>
  (handler: (content: TContent) => void) =>
    async (event: ChangeEvent<HTMLFormElement>) => {
      event.preventDefault()
      event.persist()

      const form = event.target as HTMLFormElement
      const elements = Array.from(form.elements) as HTMLInputElement[]
      const data = elements
        .filter(element => element.hasAttribute('name'))
        .reduce(
          (object, element) => ({
            ...object,
            [`${element.getAttribute('name')}`]: element.value,
          }),
          defaultValues,
        )
      await handler(data)
      form.reset()
    }

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export const useInterval = (callback: Function, delay: number) => {
  const savedCallback = useRef<Function>()

  useEffect(() => {
    savedCallback.current = callback
  }, [ callback ])
  
  useEffect(() => {
    const handler = (...args: any) => savedCallback.current?.(...args)

    if (delay !== null) {
      const id = setInterval(handler, delay)
      return () => clearInterval(id)
    }
  }, [ delay ])
}

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector

export type UseLoadList = (args: {
  loadList: Function,
}) => { dispatch: AppDispatch }

export const useLoadList: UseLoadList = ({ loadList }) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    loadList()
  }, [])

  return { dispatch }
}

export type ApiGetListError = {
  data: { error?: { message?: { text?: { [key: string]: string } } } };
  status: number;
}

export const useShowListErrorNotification = ({ isError, error }: { isError: boolean, error: ApiGetListError }) => {
  const { intl, lang } = useIntlContext()
  const { modal } = intl
  
  useEffect(() => {
    if (isError && error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: modal.common.title.error, description: (error as ApiGetListError)?.data?.error?.message?.text?.[lang || 'eng'] })
    }
  }, [ error ])
}

export const useMounted = ({ initialMounted = false, dependencies = [] }: { initialMounted?: boolean, dependencies?: any[] } = {}) => {
  const isMountedRef = useRef(initialMounted)

  return {
    isMountedRef,
    isMounted: useCallback(() => isMountedRef.current, []),
    useHandleMounted() {
      useEffect(() => {
        isMountedRef.current = true

        return () => { isMountedRef.current = false }
      }, dependencies)
    },
  }
}

export const useDebouncedCallback = <T extends Function>(callback: T, delay: number = 100) => {
  const callbackRef = useRef<T>(callback)
  const timeoutIdRef = useRef<NodeJS.Timeout>(-1 as unknown as NodeJS.Timeout)

  if (callback !== callbackRef.current) {
    callbackRef.current = callback
  }

  useEffect(() => () => clearTimeout(timeoutIdRef.current), [])

  return useCallback((...args: any[]) => {
    clearTimeout(timeoutIdRef.current)

    timeoutIdRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }, [])
}

export const useNotificationPermissionRequest = () => {
  const [ permission, setPermission ] = useState(typeof Notification !== 'undefined' ? Notification.permission : null)

  useEffect(() => {
    if (typeof Notification === 'undefined') return setPermission(null)
    if (Notification.permission === 'denied' || Notification.permission === 'granted') return setPermission(Notification.permission)

    Notification
      .requestPermission()
      .then(setPermission)

    setPermission(Notification.permission)
  }, [])

  return {
    permission,
    permitted: permission === 'granted',
  }
}

export type SetValue<T> = Dispatch<SetStateAction<T>>

export const useLocalStorage = <T>(key: string, initialValue: T): [T | null, SetValue<T>, () => boolean, () => T] => {
  const [ storedValue, setStoredValue ] = useState<T | null>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = useCallback((value: unknown) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }, [ key, storedValue ])

  const removeItem = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(null)
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }, [ key ])

  const getStoredValue = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  }, [ key ])

  return [ storedValue, setValue, removeItem,  getStoredValue ]
}

export const useToggle = (initialValue: boolean): { state: boolean, toggle: VoidFunction, setTrue: VoidFunction, setFalse: VoidFunction, setState: Dispatch<SetStateAction<boolean>> } => {
  const [ state, setState ] = useState(initialValue)

  const toggle = useCallback(() => {
    setState(_state => !_state)
  }, [])

  const setTrue = useCallback(() => {
    setState(true)
  }, [])

  const setFalse = useCallback(() => {
    setState(false)
  }, [])

  return { state, toggle, setTrue, setFalse, setState }
}
