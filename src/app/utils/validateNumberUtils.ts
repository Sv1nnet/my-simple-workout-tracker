export const isPos = value => /^(?![-])/.test(value)
export const isZero = value => +value === 0

export const INT_REGEX = /(^\d+$)|(^-\d+$)/
export const isInt = value => (value !== '-' ? INT_REGEX.test(value) : true)
export const isPosInt = value => isInt(value) && isPos(value)
export const isNegInt = value => value !== '-' ? isInt(value) && (isZero(value) || !isPos(value)) : true

export const FLOAT_REGEX = /(^\d+$)|(^\d+(\.|,)$)|(^\d+(\.|,)\d+$)|(^(\.|,)\d+$)|(^-\d+$)|(^-\d+(\.|,)$)|(^-\d+(\.|,)\d+$)|(^-(\.|,)\d+$)/
export const isFloat = (REGEX?: RegExp) => value => value !== '-' && value !== '-.' && value !== '-,'
  ? (REGEX ?? FLOAT_REGEX).test(value)
  : true

export const SIGN_AND_SEPARATOR_REGEX = /(^-[,\.]$)/
export const SEPARATOR_REGEX = /(^[,\.]$)/
export const isSignedSeparator = v => SIGN_AND_SEPARATOR_REGEX.test(v)
export const isSeparator = v => SEPARATOR_REGEX.test(v)

export const stringifyValue = (v?: number | string | null) => v === undefined || v === null ? '' : typeof v === 'string' ? v : `${v}`
