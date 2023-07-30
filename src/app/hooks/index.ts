import { notification } from 'antd'
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import { useEffect, useRef } from 'react'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

import type { AppDispatch, AppState } from '../store'
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
    if (v === '-' || v === '-.' || v === '-,' || v === '.') {
      return '0'
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
  if (shouldUpdate) return (curValue?: any, prevValue?: any): boolean => shouldUpdate(curValue, prevValue)
  
  const _isFloat = typeof maxDigitsAfterPoint === 'number' &&
      !Number.isNaN(maxDigitsAfterPoint)
    ? isFloat(
      new RegExp(
        FLOAT_REGEX.toString()
          .replace(/,\)\\d\+/g, `,)\\d{1,${maxDigitsAfterPoint}}`)
          .slice(1, -1)
          .replace(/\//g, '//'),
      ),
    )
    : isFloat()
  const isPosFloat = (value?: string | number) => _isFloat(value) && isPos(value)
  const isNegFloat = (value?: string | number) => value !== '-' ? _isFloat(value) && (isZero(value) || !isPos(value)) : true
  
  const withinMax = (v?: string | number) => maxExcluding ? +v < max : +v <= max
  const withinMin = (v?: string | number) => (minExcluding && int) ? +v > min : +v >= min
  
  if (int) {
    if (onlyPositive) return (v?: string | number) => isPosInt(v) && withinMax(v) && withinMin(v)
    if (onlyNegative) return (v?: string | number) => (isNegInt(v) && withinMax(v) && withinMin(v)) || v === '-'
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

export const useNumberInput = ({
  int,
  onlyPositive,
  onlyNegative,
  shouldUpdate,
  maxDigitsAfterPoint,
  maxExcluding,
  minExcluding,
  commaSeparator,
  min,
  max,
  value: propValue,
  onChange,
  onBlur,
  cutZeroes = false,
  cutEndingZeroes = false,
  cutLeadingZeroes = false,
}: {
  int?: boolean;
  value?: number | string;
  onChange?: (v: string | number | null, e: ChangeEvent) => unknown;
  onBlur?: (v: string | number | null, e: ChangeEvent) => unknown;
  min?: number;
  max?: number;
  onlyPositive?: boolean;
  onlyNegative?: boolean;
  shouldUpdate?: (currValue?: number | string | null, prevValue?: number | string | null) => boolean;
  maxDigitsAfterPoint?: number;
  maxExcluding?: boolean;
  minExcluding?: boolean;
  commaSeparator?: boolean;
  cutZeroes?: boolean;
  cutEndingZeroes?: boolean;
  cutLeadingZeroes?: boolean;
}) => {
  const $input = useRef(null)

  const formatToNumber = useFormatToNumber({
    cutZeroes,
    cutEndingZeroes,
    cutLeadingZeroes,
  })

  const validate = useValidateNumber({
    shouldUpdate,
    maxDigitsAfterPoint,
    int,
    maxExcluding,
    minExcluding,
    onlyPositive,
    onlyNegative,
    min,
    max,
  })

  const [ value, setValue ] = useState(() => {
    const v = formatToNumber(stringifyValue(propValue))
    if (!Number.isNaN(v)) return v
    return ''
  })

  const handleChange = (e) => {
    let v = e.target.value
    if (v === '') {
      setValue(v)
      onChange?.(v, e)
      return
    }

    const element = $input.current.input
    let caret = element.selectionStart

    if (onlyNegative && !v.startsWith('-') && !v.startsWith('0')) {
      v = `-${v}`
      caret += 1
    }

    const isValid = shouldUpdate
      ? validate(v, value)
      : validate(v)

    if (!isValid) {
      requestAnimationFrame(() => {
        element.selectionStart = caret - 1
        element.selectionEnd = caret - 1
      })
      return
    }

    v = commaSeparator ? v.replace('.', ',') : v.replace(',', '.')

    requestAnimationFrame(() => {
      element.selectionStart = caret
      element.selectionEnd = caret
    })

    setValue(v)
    onChange?.(v, e)
  }

  const handleBlur = (e) => {
    let { value: v } = e.target
    if (v === '' || validate(v)) {
      v = v && (cutEndingZeroes && !cutLeadingZeroes) || (cutLeadingZeroes && !cutEndingZeroes) && !cutZeroes
        ? formatToNumber(v)
        : v && (cutZeroes || (cutEndingZeroes && cutLeadingZeroes))
          ? parseFloat(formatToNumber(v))
          : v

      setValue(v)

      if (typeof onBlur === 'function') onBlur(v, e)
    } else {
      setValue(value)
      if (typeof onBlur === 'function') onBlur(value, e)
    }
  }

  useEffect(() => {
    if (propValue === undefined || propValue === null) return

    let propValueStr = stringifyValue(propValue)
    const stateValueStr = stringifyValue(value)

    if (propValueStr !== stateValueStr) {
      if (propValueStr.replace(',', '.') !== stateValueStr.replace(',', '.')) {
        if (propValueStr === '') {
          setValue(propValueStr)
          return
        }

        const isValid = shouldUpdate
          ? validate(propValueStr, value)
          : validate(propValueStr)

        if (!isValid) {
          return
        }

        propValueStr = commaSeparator
          ? propValueStr.replace('.', ',')
          : propValueStr
        setValue(propValueStr)
      }
    }
  }, [ propValue, commaSeparator, shouldUpdate, validate, value ])

  return { ref: $input, value, onChange: handleChange, onBlur: handleBlur }
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

type SetValue<T> = Dispatch<SetStateAction<T>>

export const useLocalStorage = <T>(key: string, initialValue: T): [T | null, SetValue<T>, () => boolean] => {
  const [ storedValue, setStoredValue ] = useState<T | null>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: unknown) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  const removeItem = () => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(null)
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  return [ storedValue, setValue, removeItem ]
}


