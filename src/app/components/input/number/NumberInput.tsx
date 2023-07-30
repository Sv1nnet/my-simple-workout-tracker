import { useNumberInput } from 'app/hooks'
import { Input, InputProps } from 'antd'
import { ChangeEvent, FC } from 'react'
import { isMobileOrTablet } from 'app/utils/isMobile'

export interface INumberInput extends Omit<InputProps, 'onChange' | 'onBlur'> {
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
  value,
  onChange,
  onBlur,
  cutZeroes,
  cutEndingZeroes,
  cutLeadingZeroes,
  type,
  ...props
}) => {
  const inputProps = useNumberInput({
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
    value,
    onChange,
    onBlur,
    cutZeroes,
    cutEndingZeroes,
    cutLeadingZeroes,
  })

  return <Input {...inputProps} type={type || (isMobileOrTablet ? 'number' : 'text')} {...props} />
}

NumberInput.defaultProps = {
  min: -Infinity,
  max: Infinity,
  cutEndingZeroes: true,
  cutLeadingZeroes: true,
}

export default NumberInput
