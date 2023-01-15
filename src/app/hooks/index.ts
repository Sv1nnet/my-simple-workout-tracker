import { notification } from 'antd'
import { ChangeEvent, useCallback, useContext, useMemo } from 'react'
import { useEffect, useRef } from 'react'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'

import type { AppDispatch, AppState } from '../store'
import isFunc from '../utils/isFunc'
import { FLOAT_REGEX, isFloat, isInt, isNegInt, isPos, isPosInt, isSeparator, isSignedSeparator, isZero, stringifyValue } from '../utils/validateNumberUtils'

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
  data: { error?: { message?: { text?: { [key: string]: string } } } };
  status: number;
}

export const useShowListErrorNotification = ({ isError, error }: { isError: boolean, error: ApiGetListError }) => {
  const { intl, lang } = useContext(IntlContext)
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
    useHandleMounted() {
      useEffect(() => {
        isMountedRef.current = true

        return () => { isMountedRef.current = false }
      }, dependencies)
    },
  }
}

export const useFormatToNumber = ({
  cutZeroes,
  cutEndingZeroes,
  cutLeadingZeroes,
}: {
  cutZeroes?: boolean,
  cutEndingZeroes?: boolean,
  cutLeadingZeroes?: boolean,
} = {}) => {
  const formatToNumber = useCallback((v: string) => {
    if (v.length > 1) {
      if (
        (cutZeroes || cutEndingZeroes) &&
        (v.includes(',') || v.includes('.')) &&
        v.endsWith('0')
      ) {
        return formatToNumber(v.slice(0, -1))
      }
      // 001
      if (
        (cutZeroes || cutLeadingZeroes) &&
        v.startsWith('0')
      ) {
        return formatToNumber(v.slice(1))
      }
      // -0000 or -0 or -0001
      if (
        (cutZeroes || cutLeadingZeroes) &&
        v.startsWith('-0')
      ) {
        const cutValue = v.slice(2)
        return formatToNumber(!cutValue.length ? '0' : `-${v.slice(2)}`)
      }
    }
    // 10.00 or 10,00
    if (v === '-' || v === '-.' || v === '-,') {
      return ''
    }
    // 123. or 123,
    if (v.endsWith(',') || v.endsWith('.')) {
      return v.slice(0, -1)
    }
    // ,123 or .123
    if (v.startsWith(',') || v.startsWith('.')) {
      return `0${v}`
    }
    // -,123 or -.123
    if (v.startsWith('-,') || v.startsWith('-.')) {
      return `-0${v.slice(1)}`
    }

    if (/[^0-9\-.,]/g.test(v)) return formatToNumber(v.replace(/[^0-9\-.,]/g, ''))

    return v
  }, [ cutZeroes, cutEndingZeroes, cutLeadingZeroes ])

  return formatToNumber
}

export const useValidateNumber = ({
  shouldUpdate,
  maxDigitsAfterPoint,
  int,
  maxExcluding,
  minExcluding,
  onlyPositive,
  onlyNegative,
  min = -Infinity,
  max = Infinity,
}: {
  shouldUpdate?: (curValue?: string | number, prevValue?: string | number) => boolean,
  maxDigitsAfterPoint?: number,
  int?: boolean,
  maxExcluding?: boolean,
  minExcluding?: boolean,
  onlyPositive?: boolean,
  onlyNegative?: boolean,
  min?: number,
  max?: number,
}) => useMemo(() => {
  if (isFunc(shouldUpdate)) return (curValue?: any, prevValue?: any): boolean => shouldUpdate(curValue, prevValue)
  
  const _isFloat = typeof maxDigitsAfterPoint === 'number' &&
      !Number.isNaN(maxDigitsAfterPoint)
    ? isFloat(
      new RegExp(
        FLOAT_REGEX.toString()
          .replace(/,\)\\d\{1,\}/g, `,)\\d{1,${maxDigitsAfterPoint}}`)
          .slice(1, -1)
          .replace(/\//g, '//'),
      ),
    )
    : isFloat()
  const isPosFloat = (value?: string | number) => _isFloat(value) && isPos(value)
  const isNegFloat = (value?: string | number) => value !== '-' ? _isFloat(value) && (isZero(value) || !isPos(value)) : true
  
  const withinMax = (v?: string | number) => maxExcluding ? v < max : v <= max
  const withinMin = (v?: string | number) => (minExcluding && int) ? v > min : v >= min
  
  if (int) {
    if (onlyPositive) return (v?: string | number) => isPosInt(v) && withinMax(v) && withinMin(v)
    if (onlyPositive) return (v?: string | number) => (isNegInt(v) && withinMax(v) && withinMin(v)) || v === '-'
    return (v?: string | number) => (isInt(v) && withinMax(v) && withinMin(v)) || v === '-'
  }
  
  if (onlyPositive) {
    return (v?: string | number) => {
      const valueStr = stringifyValue(v).replace(',', '.')
      return (isPosFloat(v) && withinMax(valueStr) && withinMin(valueStr)) || valueStr === '.'
    }
  }
  if (onlyNegative) {
    return (v?: string | number) => {
      const valueStr = stringifyValue(v).replace(',', '.')
      return (
        (isNegFloat(v) && withinMax(valueStr) && withinMin(valueStr)) ||
          isSeparator(valueStr) ||
          valueStr === '-' ||
          isSignedSeparator(valueStr)
      )
    }
  }
  
  return (v: string | number) => {
    const valueStr = stringifyValue(v).replace(',', '.')
    return (
      (_isFloat(v) && withinMax(valueStr) && withinMin(valueStr)) ||
        isSeparator(valueStr) ||
        valueStr === '-' ||
        isSignedSeparator(valueStr)
    )
  }
}, [ int, onlyPositive, onlyNegative, shouldUpdate, maxDigitsAfterPoint, maxExcluding, minExcluding, min, max ])
