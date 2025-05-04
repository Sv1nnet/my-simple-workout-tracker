import { Dayjs, isDayjs as _isDayjs } from 'dayjs'

export const isNumber = (arg: unknown): arg is number => typeof arg === 'number'
export const isFunction = (arg: unknown): arg is Function => typeof arg === 'function'
export const isString = (arg: unknown): arg is string => typeof arg === 'string'
export const isBoolean = (arg: unknown): arg is boolean => typeof arg === 'boolean'
export const isObject = (arg: unknown): arg is object => arg !== null && typeof arg === 'object'
export const isArray = (arg: unknown): arg is Array<any> => Array.isArray(arg)
export const isNull = (arg: unknown): arg is null => arg === null
export const isNullish = (arg: unknown): arg is null | undefined => arg === null || arg === undefined
export const isUndefined = (arg: unknown): arg is undefined => arg === undefined
export const isDate = (arg: unknown): arg is Date => isObject(arg) && arg instanceof Date
export const isDayjs = (arg: unknown): arg is Dayjs => _isDayjs(arg)
