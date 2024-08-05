import { ChangeEvent, ClipboardEvent, ChangeEventHandler, ClipboardEventHandler, FocusEvent, FocusEventHandler, MutableRefObject, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FLOAT_REGEX, isFloat, isInt, isNegInt, isPos, isPosInt, isSeparator, isSignedSeparator, isZero, stringifyValue } from '../utils/validateNumberUtils'

/**
 * Formats to number depending on props.
 * Ex. 001 -> 1; -,123 -> -0.123; 123, -> 123; -, -> 0;
 * 
 * @returns {string}
 */
export const useFixNumber = ({
  cutZeroes,
  cutEndingZeroes,
  cutLeadingZeroes,
  int,
  maxDigitsAfterPoint,
  onlyPositive,
  onlyNegative,
}: {
  cutZeroes?: boolean,
  cutEndingZeroes?: boolean,
  cutLeadingZeroes?: boolean,
  int?: boolean,
  maxDigitsAfterPoint?: number,
  onlyPositive?: boolean,
  onlyNegative?: boolean,
} = {}) => {
  const fixNumber = useCallback((v: string) => {
    if (v.length > 1) {
      if (
        (cutZeroes || cutEndingZeroes) &&
        (v.includes(',') || v.includes('.')) &&
        v.endsWith('0')
      ) {
        return fixNumber(v.slice(0, -1))
      }
      // 001
      if (
        (cutZeroes || cutLeadingZeroes) &&
        v.startsWith('0')
      ) {
        return fixNumber(v.slice(1))
      }
      // -0000 or -0 or -0001
      if (
        (cutZeroes || cutLeadingZeroes) &&
        v.startsWith('-0')
      ) {
        const cutValue = v.slice(2)
        return fixNumber(!cutValue.length ? '0' : `-${v.slice(2)}`)
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

    if (/[^0-9\-.,]/g.test(v)) {
      return fixNumber(v.replace(/[^0-9\-.,]/g, ''))
    }

    if (int && /[,.]/.test(v)) {
      return v.slice(0, v.indexOf(',') || v.indexOf('.'))
    }

    if (!int && maxDigitsAfterPoint > 0) {
      return v.slice(0, v.indexOf('.') + maxDigitsAfterPoint + 1)
    }

    if (onlyPositive && v.startsWith('-')) {
      return v.slice(1)
    }

    if (onlyNegative && v && !v.startsWith('-')) {
      return `-${v}`
    }

    return v
  }, [
    cutZeroes,
    cutEndingZeroes,
    cutLeadingZeroes,
    int,
    maxDigitsAfterPoint,
    onlyPositive,
    onlyNegative,
  ])

  return fixNumber
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
  onPaste?: (e: ClipboardEvent) => unknown;
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
  onPaste,
  onBlur,
  onValueChange,
  cutZeroes = false,
  cutEndingZeroes = false,
  cutLeadingZeroes = false,
}: UseNumberInputArgs<R>) => {
  const $input = useRef<R>()

  const isValuePastedRef = useRef(false)

  const fixNumber = useFixNumber({
    cutZeroes,
    cutEndingZeroes,
    cutLeadingZeroes,
    int,
    maxDigitsAfterPoint,
    onlyPositive,
    onlyNegative,
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
    const v = fixNumber(stringifyValue(propValue))
    if (!Number.isNaN(v)) return v
    return ''
  })

  const fix = (v: string | number) => (v && cutEndingZeroes && !cutLeadingZeroes) ||
  (cutLeadingZeroes && !cutEndingZeroes && !cutZeroes)
    ? fixNumber(stringifyValue(v))
    : v && (cutZeroes || (cutEndingZeroes && cutLeadingZeroes))
      ? (
        formatted => isCommaDecimalPoint
          ? formatted.replace('.', ',')
          : formatted
      )(fixNumber(stringifyValue(v)))
      : v

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

    v = isCommaDecimalPoint ? v.replace('.', ',') : v.replace(',', '.')

    if (!isValid) {
      if (!isValuePastedRef.current) {
        requestAnimationFrame(() => {
          element.selectionStart = caret - 1
          element.selectionEnd = caret - 1
        })
        return
      }

      isValuePastedRef.current = false

      const parsed = parseFloat(v)

      if (Number.isNaN(parsed)) {
        setValue('0')
        onChange?.('0', e)
        onValueChange?.('0')
        return
      }

      v = `${fix(`${parsed}`)}`
    }

    // v = isCommaDecimalPoint ? v.replace('.', ',') : v.replace(',', '.')

    requestAnimationFrame(() => {
      element.selectionStart = caret
      element.selectionEnd = caret
    })

    setValue(v)
    onChange?.(v, e)
    onValueChange?.(v)
  }

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    let { value: v } = e.target as Omit<FocusEvent<HTMLInputElement>['target'], 'value'> & { value: string | number }
    if (v === '' || validate(v)) {
      v = fix(stringifyValue(v))

      setValue(v)
      onValueChange?.(v)
      onBlur?.(v, e)
    } else {
      setValue(value)
      onValueChange?.(value)
      onBlur?.(value, e)
    }
  }

  const handlePaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    isValuePastedRef.current = true
    onPaste?.(e)
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

      const v = fix(propValueStr)
      setValue(v)
      onValueChange?.(v)
    }
  }, [ propValue, shouldUpdate, validate, value ])

  return { ref: $input, value, onChange: handleChange, onBlur: handleBlur, onPaste: handlePaste }
}
