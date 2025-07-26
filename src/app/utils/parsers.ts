import { isString } from './typeCheckers'

export const parseIfString = <T>(value: string | T): T => isString(value) ? JSON.parse(value) : value
