import { notification } from 'antd'
import type { ChangeEvent } from 'react'
import { useEffect, useRef } from 'react'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import type { AppDispatch, AppState } from '../store'

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
  loading: boolean,
  updateList: Function,
  listFromComponent: any[],
  loadList: Function,
}) => { dispatch: AppDispatch }

export const useLoadList: UseLoadList = ({ loading, updateList, listFromComponent, loadList }) => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!loading) {
      if (!listFromComponent) {
        loadList()
        return
      }
      dispatch(updateList(listFromComponent))
    }
  }, [ loading ])

  return { dispatch }
}

export type ApiGetListError = {
  data: { error?: { message?: string } };
  status: number;
}

export const useShowListErrorNotification = ({ isError, error }: { isError: boolean, error: ApiGetListError }) => {
  useEffect(() => {
    if (isError && error) {
      const openNotification = ({ message, description }) => {
        notification.error({
          message,
          description,
        })
      }
      openNotification({ message: 'Error!', description: (error as ApiGetListError)?.data?.error?.message })
    }
  }, [ error ])
}
