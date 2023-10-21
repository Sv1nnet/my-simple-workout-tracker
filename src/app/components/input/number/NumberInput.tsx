import { UseNumberInputArgs, useNumberInput } from 'app/hooks'
import { Input, InputProps, InputRef } from 'antd'
import { FC } from 'react'
import { isMobileOrTablet } from 'app/utils/isMobile'

export interface INumberInput extends Omit<InputProps, 'onChange' | 'onBlur' | 'min' | 'max' | 'value'>, UseNumberInputArgs {}

const NumberInput: FC<INumberInput> = ({
  int,
  onlyPositive,
  onlyNegative,
  shouldUpdate,
  maxDigitsAfterPoint,
  maxExcluding,
  minExcluding,
  isCommaDecimalPoint,
  min = -Infinity,
  max = Infinity,
  value,
  onChange,
  onBlur,
  onValueChange,
  cutZeroes,
  cutEndingZeroes = true,
  cutLeadingZeroes = true,
  type,
  ...props
}) => {
  const inputProps = useNumberInput<InputRef>({
    getElement: ref => ref.current.input,
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
    value,
    onChange,
    onBlur,
    onValueChange,
    cutZeroes,
    cutEndingZeroes,
    cutLeadingZeroes,
  })

  return <Input {...inputProps} type={type || (isMobileOrTablet ? 'tel' : 'text')} {...props} />
}

export default NumberInput
