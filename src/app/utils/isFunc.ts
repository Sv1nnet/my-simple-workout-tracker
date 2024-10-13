const isFunc = (func: any): func is Function => typeof func === 'function'

export default isFunc
