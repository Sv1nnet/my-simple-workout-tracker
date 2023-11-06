import { ChangeEvent, ChangeEventHandler, FocusEvent, FocusEventHandler, MutableRefObject, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FLOAT_REGEX, isFloat, isInt, isNegInt, isPos, isPosInt, isSeparator, isSignedSeparator, isZero, stringifyValue } from '../utils/validateNumberUtils'

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
    if (v === '-' || v === '-.' || v === '-,' || v === '.' || v === ',') {
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

export type UseNumberInputArgs<R = HTMLInputElement> = {
  getElement?: (ref: MutableRefObject<R>) => HTMLInputElement;
  int?: boolean;
  value?: number | string;
  onChange?: (v: string | number | null, e: ChangeEvent) => unknown;
  onBlur?: (v: string | number | null, e: ChangeEvent) => unknown;
  onValueChange?: (v: string | number | null) => unknown;
  min?: number;
  max?: number;
  onlyPositive?: boolean;
  onlyNegative?: boolean;
  shouldUpdate?: (currValue?: number | string | null, prevValue?: number | string | null) => boolean;
  maxDigitsAfterPoint?: number;
  maxExcluding?: boolean;
  minExcluding?: boolean;
  isCommaDecimalPoint?: boolean;
  cutZeroes?: boolean;
  cutEndingZeroes?: boolean;
  cutLeadingZeroes?: boolean;
}

const defaultGetElement = <R>(ref: MutableRefObject<R & HTMLInputElement>) => ref.current

export const useNumberInput = <R = HTMLInputElement>({
  getElement = defaultGetElement,
  int,
  onlyPositive,
  onlyNegative,
  shouldUpdate,
  maxDigitsAfterPoint,
  maxExcluding,
  minExcluding,
  isCommaDecimalPoint,
  min,
  max,
  value: propValue,
  onChange,
  onBlur,
  onValueChange,
  cutZeroes = false,
  cutEndingZeroes = false,
  cutLeadingZeroes = false,
}: UseNumberInputArgs<R>) => {
  const $input = useRef<R>()

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

  const [ value, setValue ] = useState<string | number>(() => {
    const v = formatToNumber(stringifyValue(propValue))
    if (!Number.isNaN(v)) return v
    return ''
  })

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    let v = e.target.value

    if (v === '') {
      setValue(v)
      onChange?.(v, e)
      onValueChange?.(v)
      return
    }

    const element = getElement($input)
    let caret = element.selectionStart

    if (onlyNegative && !v.startsWith('-') && !v.startsWith('0')) {
      v = `-${v}`
      caret += 1
    }

    const isValid = shouldUpdate ? validate(v, value) : validate(v)

    if (!isValid) {
      requestAnimationFrame(() => {
        element.selectionStart = caret - 1
        element.selectionEnd = caret - 1
      })
      return
    }

    v = isCommaDecimalPoint ? v.replace('.', ',') : v.replace(',', '.')

    requestAnimationFrame(() => {
      element.selectionStart = caret
      element.selectionEnd = caret
    })

    setValue(v)
    onChange?.(v, e)
    onValueChange?.(v)
  }

  const format = (v: string | number) => (v && cutEndingZeroes && !cutLeadingZeroes) ||
  (cutLeadingZeroes && !cutEndingZeroes && !cutZeroes)
    ? formatToNumber(stringifyValue(v))
    : v && (cutZeroes || (cutEndingZeroes && cutLeadingZeroes))
      ? (
        formatted => isCommaDecimalPoint
          ? formatted.replace('.', ',')
          : formatted
      )(formatToNumber(stringifyValue(v)))
      : v

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    let { value: v } = e.target as Omit<FocusEvent<HTMLInputElement>['target'], 'value'> & { value: string | number }
    if (v === '' || validate(v)) {
      v = format(stringifyValue(v))

      setValue(v)
      onValueChange?.(v)
      onBlur?.(v, e)
    } else {
      setValue(value)
      onValueChange?.(value)
      onBlur?.(value, e)
    }
  }

  useLayoutEffect(() => {
    if (propValue === undefined || propValue === null) return

    let propValueStr = stringifyValue(propValue)
    const stateValueStr = stringifyValue(value)

    if (propValueStr !== stateValueStr) {
      if (propValueStr === '') {
        setValue(propValueStr)
        onValueChange?.(propValueStr)
        return
      }

      const isValid = shouldUpdate
        ? validate(propValueStr, value)
        : validate(propValueStr)

      if (!isValid) {
        return
      }

      const v = format(propValueStr)
      setValue(v)
      onValueChange?.(v)
    }
  }, [ propValue, shouldUpdate, validate, value ])

  return { ref: $input, value, onChange: handleChange, onBlur: handleBlur }
}
