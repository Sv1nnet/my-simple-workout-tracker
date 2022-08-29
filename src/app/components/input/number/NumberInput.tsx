import { Input, InputProps } from 'antd'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const isPos = value => /^(?![-])/.test(value)
const isZero = value => +value === 0

const INT_REGEX = /(^\d+$)|(^-\d+$)/
const isInt = value => (value !== '-' ? INT_REGEX.test(value) : true)
const isPosInt = value => isInt(value) && isPos(value)
const isNegInt = value => value !== '-' ? isInt(value) && (isZero(value) || !isPos(value)) : true

const FLOAT_REGEX = /(^\d+$)|(^\d{1,}(\.|,)$)|(^\d+(\.|,)\d{1,}$)|(^(\.|,)\d{1,}$)|(^-\d+$)|(^-\d{1,}(\.|,)$)|(^-\d+(\.|,)\d{1,}$)|(^-(\.|,)\d{1,}$)/
const isFloat = (REGEX?: RegExp) => value => value !== '-' && value !== '-.' && value !== '-,'
  ? (REGEX ?? FLOAT_REGEX).test(value)
  : true

const SIGN_AND_SEPARATOR_REGEX = /(^-[,\.]$)/
const SEPARATOR_REGEX = /(^[,\.]$)/
const isSignedSeparator = v => SIGN_AND_SEPARATOR_REGEX.test(v)
const isSeparator = v => SEPARATOR_REGEX.test(v)

const stringifyValue = v => v === undefined && v === null ? '' : typeof v === 'string' ? v : `${v}`

const isFunc = func => typeof func === 'function'

export interface INumberInput extends Omit<InputProps, 'onChange' | 'onBlur'> {
  int?: boolean;
  positive?: boolean;
  negative?: boolean;
  value?: number | string;
  onChange?: Function;
  onBlur?: Function;
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

}

const NumberInput: FC<INumberInput> = ({
  int,
  negative,
  onlyPositive,
  onlyNegative,
  shouldUpdate,
  maxDigitsAfterPoint,
  maxExcluding,
  minExcluding,
  commaSeparator,
  min,
  max,
  value: _value,
  onChange,
  onBlur,
  cutZeroes,
  cutEndingZeroes,
  cutLeadingZeroes,
  ...props
}) => {
  const $input = useRef(null)
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

    return v
  }, [])

  const validate = useMemo(() => {
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
    const isPosFloat = value => _isFloat(value) && isPos(value)
    const isNegFloat = value => value !== '-' ? _isFloat(value) && (isZero(value) || !isPos(value)) : true
  
    const withinMax = v => maxExcluding ? v < max : v <= max
    const withinMin = v => (minExcluding && int) ? v > min : v >= min
  
    if (int) {
      if (onlyPositive) return v => isPosInt(v) && withinMax(v) && withinMin(v)
      if (onlyPositive) return v => (isNegInt(v) && withinMax(v) && withinMin(v)) || v === '-'
      return v => (isInt(v) && withinMax(v) && withinMin(v)) || v === '-'
    }
  
    if (onlyPositive) {
      return (v) => {
        const valueStr = stringifyValue(v).replace(',', '.')
        return (isPosFloat(v) && withinMax(valueStr) && withinMin(valueStr)) || valueStr === '.'
      }
    }
    if (onlyNegative) {
      return (v) => {
        const valueStr = stringifyValue(v).replace(',', '.')
        return (
          (isNegFloat(v) && withinMax(valueStr) && withinMin(valueStr)) ||
          isSeparator(valueStr) ||
          valueStr === '-' ||
          isSignedSeparator(valueStr)
        )
      }
    }
  
    return (v) => {
      const valueStr = stringifyValue(v).replace(',', '.')
      return (
        (_isFloat(v) && withinMax(valueStr) && withinMin(valueStr)) ||
        isSeparator(valueStr) ||
        valueStr === '-' ||
        isSignedSeparator(valueStr)
      )
    }
  }, [ int, onlyPositive, onlyNegative, negative, shouldUpdate, maxDigitsAfterPoint, maxExcluding, minExcluding, min, max ])

  const [ value, setValue ] = useState(() => {
    const v = formatToNumber(stringifyValue(_value))
    if (!Number.isNaN(v)) return v
    return ''
  })

  const handleChange = (e) => {
    let v = e.target.value
    if (v === '') {
      setValue(v)
      if (isFunc(onChange)) onChange(v, e)
      return
    }

    const element = $input.current.input
    let caret = element.selectionStart

    if (onlyNegative && !v.startsWith('-') && !v.startsWith('0')) {
      v = `-${v}`
      caret += 1
    }

    const isValid = isFunc(shouldUpdate)
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
    if (isFunc(onChange)) onChange(v, e)
  }

  const handleBlur = (e) => {
    let { value: v } = e.target
    if (v === '' || validate(v)) {
      v = v ? formatToNumber(v) : v
      setValue(v)
      if (typeof onBlur === 'function') onBlur(v, e)
    } else {
      setValue(value)
      if (typeof onBlur === 'function') onBlur(value, e)
    }
  }

  useEffect(() => {
    let propValue = stringifyValue(_value)
    const stateValue = stringifyValue(value)

    if (propValue !== stateValue) {
      if (propValue.replace(',', '.') !== stateValue.replace(',', '.')) {
        if (propValue === '') {
          setValue(propValue)
          return
        }

        const isValid = isFunc(shouldUpdate)
          ? validate(propValue, value)
          : validate(propValue)

        if (!isValid) {
          return
        }

        propValue = commaSeparator
          ? propValue.replace('.', ',')
          : propValue
        setValue(propValue)
      }
    }
  }, [ _value ])

  return <Input ref={$input} value={value} onChange={handleChange} onBlur={handleBlur} {...props} />
}

NumberInput.defaultProps = {
  min: -Infinity,
  max: Infinity,
  cutEndingZeroes: true,
  cutLeadingZeroes: true,
}

export default NumberInput
