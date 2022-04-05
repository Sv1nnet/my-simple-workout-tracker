import { Input, InputProps } from 'antd'
import { FC, useState } from 'react'

const NEG_FLOAT_REGEXP = /(^\d+$)|(^\d{1,}(\.|,)$)|(^\d+(\.|,)\d{1,}$)|(^(\.|,)\d{1,}$)/
const POS_FLOAT_REGEXP = /(^\d+$)|(^\d{1,}(\.|,)$)|(^\d+(\.|,)\d{1,}$)|(^(\.|,)\d{1,}$)/
const NEG_INT_REGEXP = /^-\d+$/
const POS_INT_REGEXP = /^\d+$/

const isInt = value => NEG_INT_REGEXP.test(value) || POS_INT_REGEXP.test(value)
const isPosInt = value => POS_INT_REGEXP.test(value)
const isNegInt = value => NEG_INT_REGEXP.test(value)

const isFloat = value => NEG_FLOAT_REGEXP.test(value) || POS_INT_REGEXP.test(value)
const isPosFloat = value => POS_FLOAT_REGEXP.test(value)
const isNegFloat = value => NEG_FLOAT_REGEXP.test(value)

export interface INumberInput extends Omit<InputProps, 'onChange' | 'onBlur'> {
  int?: boolean,
  positive?: boolean,
  negative?: boolean,
  value?: number | string,
  onChange?: Function,
  onBlur?: Function,
}

const NumberInput: FC<INumberInput> = ({ int, positive, negative, value: _value, onChange, onBlur, ...props }) => {
  const convert = v => !int ? parseFloat(v) : parseInt(v, 10)

  const [ value, setValue ] = useState(() => {
    const v = convert(_value)
    if (!Number.isNaN(v)) return v
    return ''
  })

  const isValid = (v) => {
    if (int) {
      if (positive) return isPosInt(v)
      if (negative) return isNegInt(v)
      return isInt(v)
    }
    
    if (positive) return isPosFloat(v)
    if (negative) return isNegFloat(v)
    return isFloat(v)
  }

  const handleChange = (e) => {
    let { value: v } = e.target
    if (v === '' || isValid(v)) {
      setValue(v)
      if (typeof onChange === 'function') onChange(v, e)
    } else {
      setValue(value)
      if (typeof onChange === 'function') onChange(value, e)
    }
  }

  const handleBlur = (e) => {
    let { value: v } = e.target
    if (v === '' || isValid(v)) {
      v = v ? convert(v) : v
      setValue(v)
      if (typeof onBlur === 'function') onBlur(v, e)
    } else {
      setValue(value)
      if (typeof onBlur === 'function') onBlur(value, e)
    }
  }

  return <Input value={value} onChange={handleChange} onBlur={handleBlur} {...props} />
}

export default NumberInput
