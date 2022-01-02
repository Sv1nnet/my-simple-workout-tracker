export type Comparator = (el: Element | HTMLElement) => boolean

const hasParent = (comparator: Comparator | Element | HTMLElement, el?: HTMLElement | Element): boolean => {
  let _el = el
  const fn = typeof comparator === 'function' ? comparator : () => _el === comparator
  
  while (_el) {
    const res = fn(_el)
    if (res) return res
    _el = _el?.parentElement
  }
  
  return false
}

export default hasParent
