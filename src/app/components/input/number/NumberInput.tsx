import { useFormatToNumber, useValidateNumber } from 'app/hooks'
import isFunc from 'app/utils/isFunc'
import { stringifyValue } from 'app/utils/validateNumberUtils'
import { Input, InputProps } from 'antd'
import { FC, useEffect, useRef, useState } from 'react'

export interface INumberInput extends Omit<InputProps, 'onChange' | 'onBlur'> {
  int?: boolean;
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
  cutZeroes,
  cutEndingZeroes,
  cutLeadingZeroes,
  ...props
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
      v = v ? parseFloat(formatToNumber(v)) : v
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

        const isValid = isFunc(shouldUpdate)
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

  return <Input ref={$input} value={value} onChange={handleChange} onBlur={handleBlur} {...props} />
}

NumberInput.defaultProps = {
  min: -Infinity,
  max: Infinity,
  cutEndingZeroes: true,
  cutLeadingZeroes: true,
}

export default NumberInput
