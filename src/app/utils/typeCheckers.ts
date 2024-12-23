import { Dayjs, isDayjs as _isDayjs } from 'dayjs'

export const isNumber = (arg: any): arg is number => typeof arg === 'number'
export const isFunction = (arg: any): arg is Function => typeof arg === 'function'
export const isString = (arg: any): arg is string => typeof arg === 'string'
export const isBoolean = (arg: any): arg is boolean => typeof arg === 'boolean'
export const isObject = (arg: any): arg is object => arg !== null && typeof arg === 'object'
export const isArray = (arg: any): arg is Array<any> => Array.isArray(arg)
export const isNull = (arg: any): arg is null => arg === null
export const isUndefined = (arg: any): arg is undefined => arg === undefined
export const isDate = (arg: any): arg is Date => isObject(arg) && arg instanceof Date
export const isDayjs = (arg: any): arg is Dayjs => _isDayjs(arg)
